declare module '@changey/react-leaflet-markercluster'

declare module 'react-tooltip-lite' {
  import { ReactNode } from 'react'
  import { TooltipProps as Props } from 'react-tooltip-lite'

  export interface TooltipProps extends Props {
    children: ReactNode
  }
}
