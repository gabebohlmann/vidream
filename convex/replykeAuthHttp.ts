// convex/replykeAuthHttp.ts
// NO "use node"; directive here. This runs in the default Convex JS environment.

import { httpAction } from './_generated/server'
import { internal } from './_generated/api' // To call internal.replykeNodeActions.internalSignReplykeToken

export const signReplykeTokenEndpoint = httpAction(async (ctx, request) => {
  // 1. Authenticate the request (e.g., using Clerk token from Authorization header)
  const identity = await ctx.auth.getUserIdentity()

  if (!identity) {
    return new Response('Unauthorized: No user identity found.', {
      status: 401,
      headers: {
        // CORS headers for error response
        'Access-Control-Allow-Origin': process.env.CLIENT_ORIGIN || '*', // Use your client origin
        Vary: 'origin',
      },
    })
  }

  const { subject, email, name, pictureUrl } = identity
  // You might have other user details in `identity` or `identity.customClaims` to pass

  try {
    // 2. Call the internal Node.js action to sign the token
    const signedToken = await ctx.runAction(internal.replykeNodeActions.internalSignReplykeToken, {
      subject,
      email,
      name,
      pictureUrl,
      // Pass other necessary details here
    })

    // 3. Return the signed token in the response
    return new Response(signedToken, {
      status: 200,
      headers: new Headers({
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': process.env.CLIENT_ORIGIN || '*', // Use your client origin
        Vary: 'origin',
      }),
    })
  } catch (error: any) {
    console.error('Error in HTTP action while trying to get Replyke token:', error)
    return new Response(error.message || 'Internal Server Error during token generation.', {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': process.env.CLIENT_ORIGIN || '*',
        Vary: 'origin',
      },
    })
  }
})
