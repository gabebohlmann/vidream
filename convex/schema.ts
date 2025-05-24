// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  tasks: defineTable({
    // Your existing table
    text: v.string(),
    isCompleted: v.boolean(),
  }),
  videos: defineTable({
    userId: v.string(), // To associate video with a user (Clerk user ID)
    title: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    visibility: v.union(
      // Enforce specific values
      v.literal('public'),
      v.literal('private'),
      v.literal('unlisted')
    ),
    bunnyLibraryId: v.optional(v.string()), // Store Bunny.net Library ID used
    bunnyVideoGUID: v.optional(v.string()), // Store the GUID from Bunny Stream after upload
    playbackUrl: v.optional(v.string()), // Optional: Store direct HLS/DASH URL
    thumbnailUrl: v.optional(v.string()),
    duration: v.optional(v.number()), // in seconds
    processingStatus: v.optional(
      v.union(
        v.literal('pending_upload'),
        v.literal('uploading'),
        v.literal('processing'),
        v.literal('finished'),
        v.literal('failed')
      )
    ),
    // Add other fields as needed: views, likes, category, etc.
  })
    .index('by_userId', ['userId']) // Example index
    .index('by_visibility', ['visibility']),
  // You might also want a table for user-specific Bunny Stream API keys if managing them per user,
  // or a secure way to store your main library API key for backend use.
})
