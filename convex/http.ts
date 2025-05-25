// convex/http.ts
import { httpRouter } from 'convex/server'
import { signReplykeTokenEndpoint } from './replykeAuthHttp' // Import the httpAction
import { httpAction } from './_generated/server'

const http = httpRouter()

// Route for getting the Replyke token
http.route({
  path: '/signReplykeToken', // This is the path your client will call
  method: 'POST', // Or "GET", depending on how you call it from the client
  handler: signReplykeTokenEndpoint,
})

// CORS Pre-flight OPTIONS request handler for the /signReplykeToken endpoint
http.route({
  path: '/signReplykeToken',
  method: 'OPTIONS',
  handler: httpAction(async (_, request) => {
    // Ensure CLIENT_ORIGIN is set in your Convex dashboard environment variables
    const clientOrigin = process.env.CLIENT_ORIGIN || '*' // Default to * if not set, but be specific in prod
    return new Response(null, {
      headers: new Headers({
        'Access-Control-Allow-Origin': clientOrigin,
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', // Match your actual methods
        'Access-Control-Allow-Headers': 'Authorization, Content-Type', // What client sends
        'Access-Control-Max-Age': '86400', // Cache pre-flight response for 1 day
        Vary: 'Origin',
      }),
    })
  }),
})

// Convex expects the router to be the default export of `convex/http.js`.
export default http
