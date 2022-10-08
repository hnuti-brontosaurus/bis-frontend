import { skipToken } from '@reduxjs/toolkit/dist/query'
import type { LatLngTuple } from 'leaflet'
import { createContext, useEffect, useState } from 'react'
import { Controller, useFormContext, UseFormReturn } from 'react-hook-form'
import { api } from '../../../app/services/bis'
import type { Location } from '../../../app/services/testApi'
import FormInputError from '../../../components/FormInputError'
import Map, { MarkerType } from '../../../components/Map'
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

  const locationId = watch('location')

  const { data: selectedLocation } = api.endpoints.readLocation.useQuery(
    locationId
      ? {
          id: locationId,
        }
      : skipToken,
  )

  const actuallySelectedLocation = locationId ? selectedLocation : undefined

  const markers: MarkerType[] = []
  let selection: MarkerType | undefined = undefined

  const [isEditing, setIsEditing] = useState(false)

  if (selectedLocation?.gps_location?.coordinates) {
    // api has coordinates switched, so we switch them, and we'll have to switch back when saving
    const [lng, lat] = selectedLocation.gps_location.coordinates
    const coordinates = [lat, lng] as LatLngTuple
    markers.push({
      type: 'selected',
      coordinates,
      id: selectedLocation.id,
    })

    if (locationId)
      selection = {
        type: 'selected',
        coordinates,
        id: selectedLocation.id,
      }
  }

  useEffect(() => {
    if (currentGPS && isEditing) {
      setValue('locationData.gps_location.coordinates.1', currentGPS[0])
      setValue('locationData.gps_location.coordinates.0', currentGPS[1])
    }
  }, [currentGPS, setValue, isEditing])

  return (
    <div>
      <header>{i}. Lokace</header>
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
          {actuallySelectedLocation ? null : (
            <button type="button" onClick={() => setIsEditing(true)}>
              vytvořit
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default LocationStep

const EditLocation = ({ onFinish }: { onFinish: () => void }) => {
  const { register, trigger, setValue } = useFormContext<FormShape>()

  return (
    <>
      Název:{' '}
      <FormInputError>
        <input
          type="text"
          {...register('locationData.name', { required: true })}
        />
      </FormInputError>
      Adresa: <input type="text" {...register('locationData.address')} />
      Popis: <textarea {...register('locationData.description')} />
      <input
        type="text"
        placeholder="50.01234567"
        {...register('locationData.gps_location.coordinates.1')}
      />{' '}
      <input
        type="text"
        placeholder="14.98765432"
        {...register('locationData.gps_location.coordinates.0')}
      />
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
            setValue('location', undefined)
            onFinish()
          }
        }}
      >
        ok
      </button>
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
      <div>
        Patron: {location?.patron?.first_name} {location?.patron?.last_name}
      </div>
    </>
  )
}
