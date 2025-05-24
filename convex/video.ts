// convex/videos.ts
import { v } from 'convex/values'
import { mutation, query, internalAction } from './_generated/server'
import { ConvexError } from 'convex/values'
import crypto from 'crypto'

// Mutation to create initial video metadata in Convex
export const createVideoMetadata = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    visibility: v.union(v.literal('public'), v.literal('private'), v.literal('unlisted')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('User must be authenticated to upload videos.')
    }
    const userId = identity.subject // Clerk User ID

    const video = await ctx.db.insert('videos', {
      userId,
      title: args.title,
      description: args.description,
      tags: args.tags,
      visibility: args.visibility,
      processingStatus: 'pending_upload', // Initial status
    })

    return { id: video } // Return the ID of the newly created Convex document
  },
})

// Action to get pre-signed URL data from Bunny Stream
// This action is called by the client to securely get upload credentials.
export const getBunnyUploadUrl = internalAction({
  args: {
    title: v.string(),
    collectionId: v.optional(v.string()),
    convexVideoId: v.id('videos'), // ID of the video record in Convex
  },
  handler: async (ctx, args) => {
    const BUNNY_STREAM_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID
    const BUNNY_STREAM_API_KEY = process.env.BUNNY_STREAM_API_KEY // This is your main Video Library API Key

    if (!BUNNY_STREAM_LIBRARY_ID || !BUNNY_STREAM_API_KEY) {
      console.error('Bunny Stream environment variables not set')
      throw new ConvexError('Server configuration error for video uploads.')
    }

    try {
      // 1. Create a video object with Bunny.net
      const createVideoResponse = await fetch(
        `https://video.bunnycdn.com/library/${BUNNY_STREAM_LIBRARY_ID}/videos`,
        {
          method: 'POST',
          headers: {
            AccessKey: BUNNY_STREAM_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: args.title,
            // collectionId: args.collectionId, // Optional
          }),
        }
      )

      if (!createVideoResponse.ok) {
        const errorData = await createVideoResponse.json()
        console.error('Bunny Stream Create Video API error:', errorData)
        throw new ConvexError(
          `Failed to create video object with Bunny Stream: ${errorData.Message || createVideoResponse.statusText}`
        )
      }

      const bunnyVideoData = await createVideoResponse.json()
      const bunnyVideoGUID = bunnyVideoData.guid // This is the VideoId for TUS

      // 2. Generate the TUS presigned signature
      const expirationTime = Math.floor(Date.now() / 1000) + 3600 // 1 hour expiration
      const stringToSign = `${BUNNY_STREAM_LIBRARY_ID}${BUNNY_STREAM_API_KEY}${expirationTime}${bunnyVideoGUID}`

      const signature = crypto.createHash('sha256').update(stringToSign).digest('hex')

      // 3. Update the Convex record with the bunnyVideoGUID and mark as 'uploading' (optional here, or after client confirms upload start)
      // Consider if you want to update status here or let the client handle it.
      await ctx.runMutation(api.videos.linkBunnyVideo, {
        convexVideoId: args.convexVideoId,
        bunnyVideoGUID: bunnyVideoGUID,
      })

      return {
        bunnyVideoGUID,
        signature,
        expires: expirationTime,
        libraryId: BUNNY_STREAM_LIBRARY_ID,
      }
    } catch (error) {
      console.error('Error in getBunnyUploadUrl action:', error)
      throw new ConvexError('Failed to prepare video for upload.')
    }
  },
})

// Mutation to link a Convex video record with a Bunny Video GUID
export const linkBunnyVideo = mutation({
  args: {
    convexVideoId: v.id('videos'),
    bunnyVideoGUID: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('User must be authenticated.')
    }
    // You might want to verify that the user owns this convexVideoId record

    await ctx.db.patch(args.convexVideoId, {
      bunnyVideoGUID: args.bunnyVideoGUID,
      processingStatus: 'uploading', // Or some other status indicating it's ready for TUS
    })
  },
})

// Mutation to finalize video details after successful Bunny upload (optional)
export const finalizeVideoUpload = mutation({
  args: {
    convexVideoId: v.id('videos'), // The ID from your Convex `videos` table
    // bunnyVideoGUID: v.string(), // Already stored, but could be passed for verification
    playbackUrl: v.optional(v.string()), // If you construct this or get it from a webhook
    thumbnailUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new ConvexError('User must be authenticated.')
    }
    // Optionally, verify ownership of the video record
    await ctx.db.patch(args.convexVideoId, {
      playbackUrl: args.playbackUrl,
      thumbnailUrl: args.thumbnailUrl,
      duration: args.duration,
      processingStatus: 'finished', // Or "processing" if Bunny needs more time
    })
    return { success: true }
  },
})

// Example Query (not directly used in upload but good for listing videos)
export const listUserVideos = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return [] // Or throw error if user must be logged in to see any videos
    }
    return await ctx.db
      .query('videos')
      .withIndex('by_userId', (q) => q.eq('userId', identity.subject))
      .order('desc')
      .collect()
  },
})
