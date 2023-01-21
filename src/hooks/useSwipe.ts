import { useCallback, useEffect, useRef, useState } from 'react'

interface SwipeOptions {
  minDistance?: number
  allowDiagonal?: boolean
}

export const useSwipe = (
  onSwipe: (direction: string) => void,
  options?: SwipeOptions,
) => {
  const ref = useRef<HTMLDivElement>(null)
  const [xDown, setXDown] = useState<number>()
  const [yDown, setYDown] = useState<number>()
  const { minDistance = 50, allowDiagonal = false } = options || {}

  const handleTouchStart = useCallback((event: TouchEvent) => {
    setXDown(event.touches[0].clientX)
    setYDown(event.touches[0].clientY)
  }, [])

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!xDown || !yDown) {
        return
      }

      const xUp = event.touches[0].clientX
      const yUp = event.touches[0].clientY

      const xDiff = xDown - xUp
      const yDiff = yDown - yUp

      if (Math.abs(xDiff) < minDistance && Math.abs(yDiff) < minDistance) {
        return
      }
      if (!allowDiagonal && Math.abs(xDiff) !== Math.abs(yDiff)) {
        return
      }

      if (Math.abs(xDiff) > Math.abs(yDiff)) {
        /*most significant*/
        if (xDiff > 0) {
          /* left swipe */
          onSwipe('left')
        } else {
          /* right swipe */
          onSwipe('right')
        }
      } else {
        if (yDiff > 0) {
          /* up swipe */
          onSwipe('up')
        } else {
          /* down swipe */
          onSwipe('down')
        }
      }
      /* reset values */
      setXDown(undefined)
      setYDown(undefined)
    },
    [onSwipe, minDistance, allowDiagonal, xDown, yDown],
  )

  useEffect(() => {
    const element = ref.current
    if (!element) return
    element.addEventListener('touchstart', handleTouchStart, false)
    element.addEventListener('touchmove', handleTouchMove, false)

    return () => {
      element.removeEventListener('touchstart', handleTouchStart, false)
      element.removeEventListener('touchmove', handleTouchMove, false)
    }
  }, [handleTouchStart, handleTouchMove])

  return ref
}
