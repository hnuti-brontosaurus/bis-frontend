import MarkerClusterGroup from '@changey/react-leaflet-markercluster'
import { api } from 'app/services/bis'
import markerNew from 'assets/map-marker-new.svg'
import markerSelected from 'assets/map-marker-selected.svg'
import markerExistent from 'assets/map-marker.svg'
import { Button } from 'components'
import {
  useShowApiErrorMessage,
  useShowMessage,
} from 'features/systemMessage/useSystemMessage'
import * as L from 'leaflet'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaSearchLocation } from 'react-icons/fa'
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import useOnScreen from '../../hooks/onScreen'
import styles from './Map.module.scss'

const iconSize = [20, 20] as L.PointTuple

const newIcon = L.icon({
  iconUrl: markerNew,
  iconSize,
})

const selectedIcon = L.icon({
  iconUrl: markerSelected,
  iconSize,
})

const existentIcon = L.icon({
  iconUrl: markerExistent,
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

const MapFlyBounds = ({ value }: { value?: L.LatLngBoundsLiteral }) => {
  const map = useMap()

  useEffect(() => {
    if (value) map.flyToBounds(value)
  }, [value, map])
  return null
}

export type ClearBounds = {
  north: number
  south: number
  east: number
  west: number
}

export const Map = ({
  className,
  markers,
  selection,
  value,
  onChange,
  onSelect,
  onDeselect,
  onChangeBounds,
  onError,
}: {
  className?: string
  markers: MarkerType[]
  selection?: MarkerType
  value?: L.LatLngTuple
  onChange: (location: L.LatLngTuple) => void
  onSelect: (id: number) => void
  onDeselect: () => void
  onChangeBounds?: (bounds: ClearBounds) => void
  onError?: (error: Error) => void
}) => {
  const [flyPosition, setFlyPosition] = useState<L.LatLngTuple>()
  const [flyBounds, setFlyBounds] = useState<L.LatLngBoundsLiteral>()

  useEffect(() => {
    if (selection?.coordinates) setFlyPosition(selection.coordinates)
  }, [selection?.id])

  useEffect(() => {
    if (value) setFlyPosition(value)
  }, [value])

  const showMessage = useShowMessage()

  const searchMethods = useForm<{
    query: string
  }>()
  const { register, handleSubmit, formState, reset } = searchMethods

  const [searchOSMLocation, { isLoading: isSearching, error }] =
    api.endpoints.searchLocationOSM.useLazyQuery()

  useShowApiErrorMessage(error)

  const handleSearchFormSubmit = handleSubmit(async (data, e) => {
    if (data.query.length > 2) {
      try {
        const foundLocations = await searchOSMLocation(data.query).unwrap()

        if (foundLocations.length === 0) {
          showMessage({ type: 'error', message: 'Místo nenalezeno' })
        }

        setFlyBounds(foundLocations[0].boundingbox as L.LatLngBoundsLiteral)
        reset({ query: '' })
      } catch (error) {
        onError?.(error as Error)
      }
    }
  })

  return (
    <>
      <MapContainer
        className={className}
        center={[49.82381, 15.46875]}
        zoom={6}
      >
        <TileLayer url="https://mapserver.mapy.cz/turist-m/{z}-{x}-{y}" />
        <MapEvents
          onClick={({ lat, lng }) => onChange([lat, lng])}
          onMoveEnd={onChangeBounds}
        />
        <MapRefresh onRefresh={bounds => onChangeBounds?.(bounds)} />
        <MapFly value={flyPosition} />
        <MapFlyBounds value={flyBounds} />
        <MarkerClusterGroup maxClusterRadius={20}>
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
      <form
        className={styles.searchForm}
        id="osm-place-query"
        onSubmit={handleSearchFormSubmit}
      >
        <fieldset disabled={formState.isSubmitting || isSearching}>
          <input
            form="osm-place-query"
            type="text"
            placeholder="Najít na mapě (OpenStreetMap)"
            {...register('query')}
          />
          <Button plain type="submit" form="osm-place-query">
            <FaSearchLocation />
          </Button>
        </fieldset>
      </form>
    </>
  )
}
