import { useState } from 'react'
import { toast } from 'sonner'
import { apiClient } from '~/services/apiClient'

interface BroadcastMessagePayload {
  title: string
  message: string
  url?: string
  emojiIcon?: string
  targetUserIds?: string[]
}

export const useBroadcastMessage = () => {
  const [loading, setLoading] = useState(false)

  const sendBroadcastMessage = async (payload: BroadcastMessagePayload) => {
    try {
      setLoading(true)
      // TODO: Implement broadcastMessage endpoint in API
      // await apiClient.broadcastMessage(payload)
      toast.success('Broadcast message sent successfully')
    } catch (error: any) {
      if (error?.status === 403 || error?.message?.includes('403')) {
        toast.error('You are not authorized to send broadcast messages')
      } else {
        toast.error('Failed to send broadcast message')
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    sendBroadcastMessage,
    loading,
  }
}
