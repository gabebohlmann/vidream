// convex/bunnyActions.ts
'use node' // This file uses the Node.js runtime

import { action } from './_generated/server'
import { v } from 'convex/values'
import { ConvexError } from 'convex/values'
import crypto from 'crypto'
import { api } from './_generated/api' // Required to call mutations (api.videos.linkBunnyVideoToConvex)

// --- Environment Variables ---
// IMPORTANT: Ensure these are set in your Convex project's dashboard under Settings > Environment Variables:
// BUNNY_STREAM_LIBRARY_ID: Your Bunny Stream Video Library ID
// BUNNY_STREAM_API_KEY: Your Bunny Stream Video Library API Key (this is the main one, not a token authentication key)

export const generateBunnyUploadCredentials = action({
  args: {
    title: v.string(),
    collectionId: v.optional(v.string()), // Client should send `undefined` if no collection
    convexVideoId: v.id('videos'), // The _id of the video record in your Convex 'videos' table
  },
  handler: async (ctx, args) => {
    const BUNNY_STREAM_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID
    const BUNNY_STREAM_API_KEY = process.env.BUNNY_STREAM_API_KEY

    if (!BUNNY_STREAM_LIBRARY_ID || !BUNNY_STREAM_API_KEY) {
      console.error(
        'Bunny Stream environment variables (BUNNY_STREAM_LIBRARY_ID, BUNNY_STREAM_API_KEY) are not set in the Convex dashboard.'
      )
      throw new ConvexError(
        'Server configuration error for video uploads. Please contact support if this issue persists.'
      )
    }

    if (!args.convexVideoId) {
      // Should be caught by validator, but good to double check
      console.error('convexVideoId was not provided to generateBunnyUploadCredentials action.')
      throw new ConvexError('Internal error: convexVideoId is missing.')
    }

    try {
      // Step 1: Create a video object with Bunny.net.
      // This API call will return a GUID for the video, which is used as 'VideoId' in TUS uploads.
      const createVideoPayload: { title: string; collectionId?: string } = {
        title: args.title,
      }
      if (args.collectionId) {
        createVideoPayload.collectionId = args.collectionId
      }

      const createVideoResponse = await fetch(
        `https://video.bunnycdn.com/library/${BUNNY_STREAM_LIBRARY_ID}/videos`,
        {
          method: 'POST',
          headers: {
            AccessKey: BUNNY_STREAM_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createVideoPayload), // Send title, optionally collectionId
        }
      )

      if (!createVideoResponse.ok) {
        let errorData
        try {
          errorData = await createVideoResponse.json()
        } catch (e) {
          errorData = { Message: createVideoResponse.statusText }
        }
        console.error("Bunny Stream 'Create Video' API error:", errorData)
        throw new ConvexError(
          `Failed to create video object with Bunny Stream: ${
            errorData.Message || createVideoResponse.statusText
          }`
        )
      }

      const bunnyVideoData = await createVideoResponse.json()
      const bunnyVideoGUID = bunnyVideoData.guid

      if (!bunnyVideoGUID) {
        console.error("Bunny Stream 'Create Video' API did not return a GUID.")
        throw new ConvexError(
          'Failed to retrieve video GUID from Bunny Stream. The response might have changed.'
        )
      }

      // Step 2: Generate the TUS presigned signature components.
      const expirationTime = Math.floor(Date.now() / 1000) + 3600 // Signature valid for 1 hour
      const stringToSign = `${BUNNY_STREAM_LIBRARY_ID}${BUNNY_STREAM_API_KEY}${expirationTime}${bunnyVideoGUID}`
      const signature = crypto.createHash('sha256').update(stringToSign).digest('hex')

      // Step 3: Link this Bunny video GUID to your Convex video record.
      await ctx.runMutation(api.videos.linkBunnyVideoToConvex, {
        convexVideoId: args.convexVideoId,
        bunnyVideoGUID: bunnyVideoGUID,
        bunnyLibraryId: BUNNY_STREAM_LIBRARY_ID,
      })

      return {
        bunnyVideoGUID,
        signature,
        expires: expirationTime,
        libraryId: BUNNY_STREAM_LIBRARY_ID,
      }
    } catch (error: any) {
      console.error('Error in generateBunnyUploadCredentials action:', error.message, error.stack)
      throw new ConvexError(
        'Failed to prepare video for upload. Please try again later or contact support.'
      )
    }
  },
})
