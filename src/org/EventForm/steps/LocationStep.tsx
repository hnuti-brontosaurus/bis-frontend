import { skipToken } from '@reduxjs/toolkit/dist/query'
import type { LatLngTuple } from 'leaflet'
import { createContext, useEffect, useMemo, useState } from 'react'
import { Controller, useFormContext, UseFormReturn } from 'react-hook-form'
import { api } from '../../../app/services/bis'
import type { Location } from '../../../app/services/testApi'
import FormInputError from '../../../components/FormInputError'
import { FormSection, FormSubsection } from '../../../components/FormLayout'
import Map, { ClearBounds, MarkerType } from '../../../components/Map'
import { SelectByQuery } from '../../../components/SelectUsers'
import { FormShape } from '../../EventForm'
import styles from './LocationStep.module.scss'

type GPSInputContextType = {
  gps?: LatLngTuple
  setGps: (gps: LatLngTuple) => void
  methods?: UseFormReturn<{ gps: string }>
}

export const GPSInputContext = createContext<GPSInputContextType>({
  setGps: () => {},
})

const LocationStep = ({
  i,
  currentGPS,
  onCurrentGPSChange,
  gpsInputMethods,
}: {
  i: number
  currentGPS?: LatLngTuple
  onCurrentGPSChange: (gps: LatLngTuple) => void
  gpsInputMethods: UseFormReturn<{ gps: string }>
}) => {
  // TODO let's deal with indexing the fields later
  // maybe hardcode it, or do some smart component or hook...
  const { watch, control, setValue } = useFormContext<FormShape>()

  const [bounds, setBounds] = useState<ClearBounds>()

  const { data: locations, isLoading } = api.endpoints.readLocations.useQuery(
    bounds
      ? {
          pageSize: 5000,
        }
      : skipToken,
  )

  const locationsWithGPS = useMemo(
    () =>
      (locations?.results ?? []).filter(
        location => location?.gps_location?.coordinates,
      ),
    [locations],
  )

  const locationId = watch('location')

  const { data: selectedLocation } = api.endpoints.readLocation.useQuery(
    locationId
      ? {
          id: locationId,
        }
      : skipToken,
  )

  const actuallySelectedLocation = locationId ? selectedLocation : undefined

  useEffect(() => {
    if (
      actuallySelectedLocation &&
      !actuallySelectedLocation?.gps_location?.coordinates
    ) {
      setIsEditing(true)
      setValue('locationData', actuallySelectedLocation)
    } else {
      setIsEditing(false)
      setValue('locationData', undefined)
    }
  }, [actuallySelectedLocation, setValue])

  const markers: MarkerType[] = useMemo(() => {
    const markers: MarkerType[] = locationsWithGPS.map(location => ({
      type: 'existent',
      id: location.id,
      // api has coordinates switched, so we switch them, and we'll have to switch back when saving
      coordinates: [
        ...(location.gps_location?.coordinates as [number, number]),
      ].reverse() as LatLngTuple,
    }))

    if (locationId) {
      // api has coordinates switched, so we switch them, and we'll have to switch back when saving
      const selectedMarker = markers.find(marker => marker.id === locationId)
      if (selectedMarker) {
        selectedMarker.type = 'selected'
      } else if (selectedLocation?.gps_location?.coordinates) {
        const [lng, lat] = selectedLocation.gps_location.coordinates
        const coordinates = [lat, lng] as LatLngTuple

        markers.push({
          type: 'selected',
          coordinates,
          id: selectedLocation.id,
        })
      }
    }

    return markers
  }, [selectedLocation, locationsWithGPS, locationId])

  const selection: MarkerType | undefined = useMemo(() => {
    if (locationId && selectedLocation?.gps_location?.coordinates) {
      // api has coordinates switched, so we switch them, and we'll have to switch back when saving
      const [lng, lat] = selectedLocation.gps_location.coordinates
      const coordinates = [lat, lng] as LatLngTuple
      return {
        type: 'selected',
        coordinates,
        id: selectedLocation.id,
      }
    }
  }, [selectedLocation, locationId])

  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (currentGPS && isEditing) {
      setValue('locationData.gps_location.coordinates.1', currentGPS[0])
      setValue('locationData.gps_location.coordinates.0', currentGPS[1])
    }
  }, [currentGPS, setValue, isEditing])

  return (
    <FormSection>
      <FormSubsection header="Lokace">
        Najdi lokaci (zadej název nebo GPS):
        <FormInputError>
          <Controller
            name="location"
            control={control}
            render={({ field: { ref, ...field } }) => (
              <SelectByQuery
                className={styles.aboveMap}
                {...field}
                placeholder="Název"
                queryRead={api.endpoints.readLocation}
                querySearch={api.endpoints.readLocations}
                transform={(location: Location) => ({
                  label: location.name,
                  value: location.id,
                })}
                customRef={ref}
              />
            )}
          />
        </FormInputError>
        <FormInputError formMethods={gpsInputMethods}>
          <input
            form="gpsInputForm"
            type="text"
            placeholder="GPS (50.01234, 14.98765)"
            {...gpsInputMethods.register('gps', {
              required: true,
              pattern: /^\d+(\.\d+)?\s*,?\s+\d+(\.\d+)?$/,
            })}
          />
        </FormInputError>
        <div>
          <Map
            markers={markers}
            selection={selection}
            value={currentGPS}
            onChange={onCurrentGPSChange}
            onSelect={id => setValue('location', id)}
            onChangeBounds={bounds => setBounds(bounds)}
            onDeselect={() => {}}
          />
        </div>
        {isEditing ? (
          <EditLocation onFinish={() => setIsEditing(false)} />
        ) : (
          <>
            <ViewLocation
              location={watch('locationData') ?? actuallySelectedLocation}
            />
            {actuallySelectedLocation ? (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true)
                  setValue('locationData', actuallySelectedLocation)
                }}
              >
                upravit
              </button>
            ) : (
              <button type="button" onClick={() => setIsEditing(true)}>
                vytvořit
              </button>
            )}
          </>
        )}
      </FormSubsection>
    </FormSection>
  )
}

export default LocationStep

const EditLocation = ({ onFinish }: { onFinish: () => void }) => {
  const { register, trigger, setValue } = useFormContext<FormShape>()

  return (
    <>
      <div>
        Název:{' '}
        <FormInputError>
          <input
            type="text"
            {...register('locationData.name', { required: true })}
          />
        </FormInputError>
      </div>
      <div>
        Adresa: <input type="text" {...register('locationData.address')} />
      </div>
      <div>
        Popis: <textarea {...register('locationData.description')} />
      </div>
      <div>
        GPS:{' '}
        <FormInputError>
          <input
            type="text"
            placeholder="50.01234567"
            {...register('locationData.gps_location.coordinates.1', {
              required: true,
            })}
          />
        </FormInputError>{' '}
        <FormInputError>
          <input
            type="text"
            placeholder="14.98765432"
            {...register('locationData.gps_location.coordinates.0', {
              required: true,
            })}
          />
        </FormInputError>
      </div>
      <div>
        <button
          type="button"
          onClick={() => {
            setValue('locationData', undefined)
            onFinish()
          }}
        >
          zrušit
        </button>{' '}
        <button
          type="button"
          onClick={async () => {
            if (await trigger('locationData')) {
              onFinish()
            }
          }}
        >
          ok
        </button>
      </div>
    </>
  )
}

const ViewLocation = ({ location }: { location?: Omit<Location, 'id'> }) => {
  return (
    <>
      <div>Název: {location?.name}</div>
      <div>Popis: {location?.description}</div>
      <div>
        GPS: {location?.gps_location?.coordinates?.[1]}{' '}
        {location?.gps_location?.coordinates?.[0]}
      </div>
    </>
  )
}
