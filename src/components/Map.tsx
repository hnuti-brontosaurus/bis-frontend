import MarkerClusterGroup from '@changey/react-leaflet-markercluster'
import * as L from 'leaflet'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
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
  coordinates: [number, number]
  type: 'new' | 'existent' | 'selected'
}

const MapClick = ({
  onClick,
}: {
  onClick?: (coordinates: L.LatLng) => void
}) => {
  const map = useMapEvents({
    click(e) {
      const ll = map.mouseEventToLatLng(e.originalEvent)
      if (onClick) onClick(ll)
    },
  })
  return null
}

const MapRefresh = () => {
  const elementRef = useRef<HTMLDivElement>(null)
  const isOnScreen = useOnScreen(elementRef)
  const map = useMap()

  useEffect(() => {
    if (isOnScreen) map.invalidateSize()
  }, [isOnScreen, map])
  return <div ref={elementRef}></div>
}

const MapFly = ({ value }: { value?: L.LatLngTuple }) => {
  const map = useMap()

  useEffect(() => {
    if (value) map.flyTo(value, Math.max(10, map.getZoom()))
  }, [value, map])
  return null
}

const Map = ({
  markers,
  selection,
  value,
  onChange,
  onSelect,
  onDeselect,
}: {
  markers: MarkerType[]
  selection: number | null
  value?: L.LatLngTuple
  onChange: (location: L.LatLngTuple) => void
  onSelect: (id: number) => void
  onDeselect: () => void
}) => {
  return (
    <MapContainer
      className={mapStyles.container}
      center={[49.82381, 15.46875]}
      zoom={6}
    >
      <TileLayer url="https://m1.mapserver.mapy.cz/turist-m/{z}-{x}-{y}" />
      <MapClick onClick={({ lat, lng }) => onChange([lat, lng])} />
      <MapRefresh />
      <MapFly value={value} />
      <MarkerClusterGroup maxClusterRadius={10}>
        {value && <Marker position={value} icon={newIcon}></Marker>}
        {markers.map(marker => {
          return (
            <Marker
              key={marker.id}
              position={marker.coordinates}
              icon={existentIcon}
              eventHandlers={{ click: () => onSelect(marker.id) }}
            ></Marker>
          )
        })}
      </MarkerClusterGroup>
    </MapContainer>
  )
}

export default Map
