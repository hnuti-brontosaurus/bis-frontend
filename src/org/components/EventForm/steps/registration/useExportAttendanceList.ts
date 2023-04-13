import { useAppSelector } from 'app/hooks'
import { selectAuthToken } from 'features/auth/authSlice'
import { useState } from 'react'

/**
 * Export attendance list from api
 * We don't use rtk-query because we don't want to cache the whole file
 */
export const useExportAttendanceList = () => {
  const token = useAppSelector(selectAuthToken)
  const [isLoading, setIsLoading] = useState(false)

  const exportAttendanceList = async ({
    eventId,
    format,
  }: {
    eventId: number
    format: 'pdf' | 'xlsx'
  }) => {
    setIsLoading(true)
    const response = await fetch(
      `${
        process.env.REACT_APP_API_BASE_URL ?? '/api/'
      }frontend/events/${eventId}/get_attendance_list/?formatting=${format}`,
      {
        // Make request to API endpoint
        method: 'GET',
        headers: { authorization: `Token ${token}` },
      },
    )

    const blob = await response.blob() // Get response data as blob
    const url = globalThis.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url // Set the link's href attribute to the download URL
    link.download = `ucastnicka_listina_${eventId}.${format}` // Set the filename and extension of the downloaded file
    document.body.appendChild(link) // Add the link to the document body
    link.click() // Click the link to start the download
    document.body.removeChild(link)
    setIsLoading(false)
  }

  return [exportAttendanceList, { isLoading }] as const
}
