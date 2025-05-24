// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // Your other tables (e.g., tasks) might be here
  // tasks: defineTable({
  //   text: v.string(),
  //   isCompleted: v.boolean(),
  // }),
  videos: defineTable({
    userId: v.string(), // Clerk User ID, to associate video with a user
    title: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    visibility: v.union(v.literal('public'), v.literal('private'), v.literal('unlisted')),

    // Bunny Stream related fields
    bunnyLibraryId: v.optional(v.string()), // The Bunny Library ID used for this video
    bunnyVideoGUID: v.optional(v.string()), // The GUID from Bunny Stream after video object creation

    // Status and Playback details (updated after upload & processing)
    processingStatus: v.optional(
      v.union(
        v.literal('pending_upload'), // Initial state before any interaction with Bunny
        v.literal('credentials_generated'), // Bunny video object created, TUS credentials ready
        v.literal('uploading'), // Client has started TUS upload
        v.literal('processing'), // Bunny is processing/transcoding the video
        v.literal('finished'), // Processing complete, video is streamable
        v.literal('failed_upload'), // TUS upload failed
        v.literal('failed_processing') // Bunny processing failed
      )
    ),
    playbackUrl: v.optional(v.string()), // e.g., HLS manifest URL from Bunny
    thumbnailUrl: v.optional(v.string()), // Thumbnail URL from Bunny
    duration: v.optional(v.number()), // Video duration in seconds

    // Optional: Add timestamps for creation and updates
    // createdAt: v.number(), // v.optional(v.number()) if you set it manually
    // updatedAt: v.optional(v.number()),

    // Add other fields as needed: views, likes, category, etc.
  })
    .index('by_userId', ['userId']) // Index for querying videos by user
    .index('by_visibility', ['visibility']) // Index for querying by visibility
    .index('by_processingStatus', ['processingStatus']), // Index for videos by status
})
