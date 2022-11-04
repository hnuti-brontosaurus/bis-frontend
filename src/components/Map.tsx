import MarkerClusterGroup from '@changey/react-leaflet-markercluster'
import * as L from 'leaflet'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import useOnScreen from '../hooks/onScreen'
import blueCircle from './circle_dark_blue.svg'
import greenCircle from './circle_green.svg'
import redCircle from './circle_red.svg'
import mapStyles from './Map.module.scss'

const iconSize = [20, 20] as L.PointTuple

const newIcon = L.icon({
  iconUrl: blueCircle,
  iconSize,
})

const selectedIcon = L.icon({
  iconUrl: greenCircle,
  iconSize,
})

const existentIcon = L.icon({
  iconUrl: redCircle,
  iconSize,
})

export type MarkerType = {
  id: number
  name: string
  coordinates: [number, number]
  type: 'new' | 'existent' | 'selected'
}

const MapEvents = ({
  onClick,
  onMoveEnd,
}: {
  onClick?: (coordinates: L.LatLng) => void
  onMoveEnd?: (bounds: ClearBounds) => void
}) => {
  const map = useMapEvents({
    click(e) {
      const ll = map.mouseEventToLatLng(e.originalEvent)
      if (onClick) onClick(ll)
    },
    moveend(e) {
      onMoveEnd?.(getClearBounds(map))
    },
  })
  return null
}

const getClearBounds = (map: L.Map): ClearBounds => {
  const bounds = map.getBounds()
  return {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    west: bounds.getWest(),
    east: bounds.getEast(),
  }
}

const MapRefresh = ({
  onRefresh,
}: {
  onRefresh: (bounds: ClearBounds) => void
}) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const isOnScreen = useOnScreen(elementRef)
  const map = useMap()

  const bounds = useMemo(() => {
    return getClearBounds(map)
  }, [map])

  useEffect(() => {
    if (isOnScreen) {
      map.invalidateSize()
      onRefresh(bounds)
    }
  }, [isOnScreen, map, onRefresh, bounds])
  return <div ref={elementRef}></div>
}

const MapFly = ({ value }: { value?: L.LatLngTuple }) => {
  const map = useMap()

  useEffect(() => {
    if (value) map.flyTo(value, Math.max(10, map.getZoom()))
  }, [value, map])
  return null
}

export type ClearBounds = {
  north: number
  south: number
  east: number
  west: number
}

const Map = ({
  markers,
  selection,
  value,
  onChange,
  onSelect,
  onDeselect,
  onChangeBounds,
}: {
  markers: MarkerType[]
  selection?: MarkerType
  value?: L.LatLngTuple
  onChange: (location: L.LatLngTuple) => void
  onSelect: (id: number) => void
  onDeselect: () => void
  onChangeBounds?: (bounds: ClearBounds) => void
}) => {
  const [flyPosition, setFlyPosition] = useState<L.LatLngTuple>()

  useEffect(() => {
    if (selection?.coordinates) setFlyPosition(selection.coordinates)
  }, [selection?.id])

  useEffect(() => {
    if (value) setFlyPosition(value)
  }, [value])

  return (
    <>
      <MapContainer
        className={mapStyles.container}
        center={[49.82381, 15.46875]}
        zoom={6}
      >
        <TileLayer url="https://m1.mapserver.mapy.cz/turist-m/{z}-{x}-{y}" />
        <MapEvents
          onClick={({ lat, lng }) => onChange([lat, lng])}
          onMoveEnd={onChangeBounds}
        />
        <MapRefresh onRefresh={bounds => onChangeBounds?.(bounds)} />
        <MapFly value={flyPosition} />
        <MarkerClusterGroup maxClusterRadius={10}>
          {value && <Marker position={value} icon={newIcon}></Marker>}
          {markers.map(marker => {
            return (
              <Marker
                key={marker.id}
                title={marker.name}
                position={marker.coordinates}
                icon={marker.id === selection?.id ? selectedIcon : existentIcon}
                eventHandlers={{ click: () => onSelect(marker.id) }}
              ></Marker>
            )
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </>
  )
}

export default Map
