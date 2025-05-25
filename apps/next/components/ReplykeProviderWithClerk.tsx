// apps/next/components/ReplykeProviderWithClerk.tsx
'use client'

import { useEffect, useState, ReactNode } from 'react'
import { ReplykeProvider } from '@replyke/react-js'
import { useUser as useUserClerk, useAuth as useAuthClerk } from '@clerk/nextjs'
import { useConvexAuth } from 'convex/react'

// Remove: import { ConvexHttpClient } from 'convex/browser';

interface ReplykeProviderWithClerkProps {
  children: ReactNode
}

export default function ReplykeProviderWithClerk({ children }: ReplykeProviderWithClerkProps) {
  const { user: userClerk } = useUserClerk()
  const { getToken } = useAuthClerk()
  const { isAuthenticated: isConvexAuthenticated } = useConvexAuth()

  const [signedReplykeToken, setSignedReplykeToken] = useState<string | null>(null)
  const [isLoadingToken, setIsLoadingToken] = useState(true)

  const replykeProjectId = process.env.NEXT_PUBLIC_REPLYKE_PROJECT_ID

  if (!replykeProjectId) {
    console.error('Missing NEXT_PUBLIC_REPLYKE_PROJECT_ID in your environment variables.')
    return <>{children}</>
  }

  useEffect(() => {
    const generateAndSetReplykeToken = async () => {
      if (userClerk && isConvexAuthenticated) {
        setIsLoadingToken(true)
        try {
          const clerkToken = await getToken({ template: 'convex' }) // Clerk token for Convex
          if (!clerkToken) {
            console.error('Failed to retrieve Clerk token for Convex.')
            setSignedReplykeToken(null)
            setIsLoadingToken(false)
            return
          }

          // Construct the full URL for your Convex HTTP endpoint
          // NEXT_PUBLIC_CONVEX_URL should be like "https://your-project.convex.cloud"
          // HTTP endpoints are on ".site"
          const convexCloudUrl = process.env.NEXT_PUBLIC_CONVEX_URL
          if (!convexCloudUrl) {
            console.error('Missing NEXT_PUBLIC_CONVEX_URL')
            setIsLoadingToken(false)
            return
          }
          const convexSiteUrl = convexCloudUrl.replace('.cloud', '.site')
          const endpointUrl = `${convexSiteUrl}/signReplykeToken` // Matches path in http.ts

          const response = await fetch(endpointUrl, {
            method: 'POST', // Or 'GET', matching your http.route method
            headers: {
              Authorization: `Bearer ${clerkToken}`,
              // 'Content-Type': 'application/json', // If you were sending a JSON body
            },
            // body: JSON.stringify({ examplePayload: "data" }), // If sending a body
          })

          if (!response.ok) {
            const errorText = await response.text()
            console.error(
              'Error response from /signReplykeToken endpoint:',
              response.status,
              errorText
            )
            throw new Error(`Server error fetching Replyke token: ${response.status}`)
          }

          const token = await response.text() // Assuming the token is returned as plain text

          if (token) {
            setSignedReplykeToken(token)
          } else {
            console.error('Received no signed token from Convex HTTP endpoint.')
            setSignedReplykeToken(null)
          }
        } catch (error) {
          console.error('Error fetching Replyke signed token:', error)
          setSignedReplykeToken(null)
        } finally {
          setIsLoadingToken(false)
        }
      } else {
        setSignedReplykeToken(null)
        setIsLoadingToken(false)
      }
    }

    generateAndSetReplykeToken()
  }, [userClerk, getToken, isConvexAuthenticated])

  if (isLoadingToken && userClerk) {
    return <div>Loading Replyke Auth...</div>
  }

  return (
    <ReplykeProvider projectId={replykeProjectId} signedToken={signedReplykeToken}>
      {children}
    </ReplykeProvider>
  )
}
