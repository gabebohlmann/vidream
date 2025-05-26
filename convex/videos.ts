// convex/videos.ts
// This file contains mutations and queries for video metadata.
// It does NOT use the Node.js runtime.

import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { ConvexError } from 'convex/values'
// import { api } from './_generated/api' // For potential internal calls if needed

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
      throw new ConvexError('User must be authenticated to create video metadata.')
    }
    const userId = identity.subject // Clerk User ID

    const videoId = await ctx.db.insert('videos', {
      userId,
      title: args.title,
      description: args.description,
      tags: args.tags,
      visibility: args.visibility,
      processingStatus: 'pending_upload',
      // bunnyLibraryId, bunnyVideoGUID, etc., will be updated by other functions
    })

    return { _id: videoId } // Return the object with the new document's ID
  },
})

// Mutation to link a Convex video record with a Bunny Video GUID and Library ID
export const linkBunnyVideoToConvex = mutation({
  args: {
    convexVideoId: v.id('videos'),
    bunnyVideoGUID: v.string(),
    bunnyLibraryId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    // Basic auth check, but primarily this is called by a trusted action
    if (!identity) {
      // Potentially allow if called by a secure internal mechanism in the future
      console.warn('linkBunnyVideoToConvex called without user identity (expected if from action)')
    }

    // Optionally verify video ownership if needed, though action should handle this
    // const video = await ctx.db.get(args.convexVideoId);
    // if (identity && video && video.userId !== identity.subject) {
    //   throw new ConvexError("Not authorized to link this video.");
    // }

    await ctx.db.patch(args.convexVideoId, {
      bunnyVideoGUID: args.bunnyVideoGUID,
      bunnyLibraryId: args.bunnyLibraryId,
      processingStatus: 'credentials_generated', // Video object created in Bunny, ready for TUS
    })
  },
})

// Mutation to update video status, playback URLs, thumbnails, etc.
export const updateVideoDetails = mutation({
  args: {
    convexVideoId: v.id('videos'),
    status: v.optional(
      v.union(
        v.literal('uploading'),
        v.literal('processing'),
        v.literal('finished'),
        v.literal('failed_upload'),
        v.literal('failed_processing')
      )
    ),
    playbackUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    // --- New Replyke Args ---
    replykeEntityId: v.optional(v.string()),
    replykeEntityShortId: v.optional(v.string()),
    replykeForeignId: v.optional(v.string()),
    // --- End New Replyke Args ---
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    const videoToUpdate = await ctx.db.get(args.convexVideoId)

    if (!videoToUpdate) {
      throw new ConvexError('Video not found for status update.')
    }

    if (identity && videoToUpdate.userId !== identity.subject) {
      throw new ConvexError("Not authorized to update this video's details.")
    }

    const patchData: {
      processingStatus?: string
      playbackUrl?: string
      thumbnailUrl?: string
      duration?: number
      replykeEntityId?: string // Add to patchData type
      replykeEntityShortId?: string // Add to patchData type
      replykeForeignId?: string // Add to patchData type
    } = {}

    if (args.status) patchData.processingStatus = args.status
    if (args.playbackUrl) patchData.playbackUrl = args.playbackUrl
    if (args.thumbnailUrl) patchData.thumbnailUrl = args.thumbnailUrl
    if (args.duration !== undefined) patchData.duration = args.duration
    // --- Patch Replyke Data ---
    if (args.replykeEntityId) patchData.replykeEntityId = args.replykeEntityId
    if (args.replykeEntityShortId) patchData.replykeEntityShortId = args.replykeEntityShortId
    if (args.replykeForeignId) patchData.replykeForeignId = args.replykeForeignId
    // --- End Patch Replyke Data ---

    if (Object.keys(patchData).length > 0) {
      await ctx.db.patch(args.convexVideoId, patchData as Partial<typeof videoToUpdate>)
    }
    return { success: true }
  },
})

// Query to list videos for the authenticated user
export const listUserVideos = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return [] // Or throw error, depending on desired public/private behavior
    }
    return await ctx.db
      .query('videos')
      .withIndex('by_userId', (q) => q.eq('userId', identity.subject))
      .order('desc')
      .collect()
  },
})

// Query to get a single video's details
export const getVideoDetails = query({
  args: { videoId: v.id('videos') },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId)
    if (!video) {
      return null
    }
    // TODO: Implement visibility checks if video can be private/unlisted
    // const identity = await ctx.auth.getUserIdentity();
    // if (video.visibility === 'private' && (!identity || video.userId !== identity.subject)) {
    //   return null; // Or throw an error "Not authorized"
    // }
    return video
  },
})
