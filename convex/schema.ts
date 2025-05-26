// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  videos: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    visibility: v.union(v.literal('public'), v.literal('private'), v.literal('unlisted')),

    bunnyLibraryId: v.optional(v.string()),
    bunnyVideoGUID: v.optional(v.string()),

    processingStatus: v.optional(
      v.union(
        v.literal('pending_upload'),
        v.literal('credentials_generated'),
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

    // --- New Replyke Fields ---
    replykeEntityId: v.optional(v.string()), // Main ID from Replyke
    replykeEntityShortId: v.optional(v.string()), // Short ID from Replyke (for URLs)
    replykeForeignId: v.optional(v.string()), // Storing the convexVideoId used as foreignId in Replyke
    // --- End New Replyke Fields ---
  })
    .index('by_userId', ['userId'])
    .index('by_visibility', ['visibility'])
    .index('by_processingStatus', ['processingStatus'])
    // Optional: Index for finding video by Replyke's foreignId if needed
    .index('by_replykeForeignId', ['replykeForeignId']),
})
