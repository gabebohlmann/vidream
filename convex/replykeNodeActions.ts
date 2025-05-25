// convex/replykeNodeActions.ts
'use node' // Important: For Node.js runtime

import { internalAction } from './_generated/server'
import { v } from 'convex/values'
import jwt from 'jsonwebtoken'

export const internalSignReplykeToken = internalAction({
  args: {
    // Define arguments you'll pass from the HTTP action
    // These typically come from the authenticated user's identity
    subject: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    pictureUrl: v.optional(v.string()),
    // Add any other userData fields Replyke might use from your Clerk identity
  },
  handler: async (ctx, args) => {
    const replykeProjectId = process.env.REPLYKE_PROJECT_ID
    const replykePrivateKeyBase64 = process.env.REPLYKE_PROJECT_PRIVATE_KEY

    if (!replykeProjectId || !replykePrivateKeyBase64) {
      console.error('Replyke project ID or private key is not set in Convex environment variables.')
      throw new Error('Server configuration error for Replyke token signing.')
    }

    const privateKeyPem = Buffer.from(replykePrivateKeyBase64, 'base64').toString('utf-8')

    const payload = {
      sub: args.subject, // Clerk User ID
      iss: replykeProjectId, // Your Replyke Project ID
      aud: 'replyke.com', // Audience, always 'replyke.com'
      userData: {
        email: args.email,
        name: args.name,
        avatar: args.pictureUrl,
        // username: args.username, // If you have it
      },
    }

    const signedToken = jwt.sign(payload, privateKeyPem, {
      algorithm: 'RS256',
      expiresIn: '5m', // Short-lived token
    })

    return signedToken
  },
})
