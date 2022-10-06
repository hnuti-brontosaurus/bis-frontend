import { skipToken } from '@reduxjs/toolkit/dist/query'
import type { LatLngTuple } from 'leaflet'
import { createContext } from 'react'
import { Controller, useFormContext, UseFormReturn } from 'react-hook-form'
import { api } from '../../../app/services/bis'
import type { Location } from '../../../app/services/testApi'
import FormInputError from '../../../components/FormInputError'
import Map, { MarkerType } from '../../../components/Map'
import { SelectByQuery } from '../../../components/SelectUsers'
import { FormShape } from '../../EventForm'

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
  const { watch, control } = useFormContext<FormShape>()

  const locationId = watch('location')

  const { data: selectedLocation } = api.endpoints.readLocation.useQuery(
    locationId
      ? {
          id: locationId,
        }
      : skipToken,
  )

  const markers: MarkerType[] = []

  if (selectedLocation && selectedLocation.gps_location)
    markers.push({
      type: 'selected',
      coordinates: selectedLocation.gps_location.coordinates as LatLngTuple,
      id: selectedLocation.id,
    })

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
      <input
        form="gpsInputForm"
        type="text"
        placeholder="GPS"
        {...gpsInputMethods.register('gps')}
      />
      <div>
        <Map
          markers={markers}
          selection={null}
          onSelect={() => {}}
          onDeselect={() => {}}
          value={currentGPS}
          onChange={onCurrentGPSChange}
        />
      </div>
      <div>Název: {selectedLocation?.name}</div>
      <div>Popis: {selectedLocation?.description}</div>
      <div>GPS: {JSON.stringify(selectedLocation?.gps_location)}</div>
      <div>
        Patron: {selectedLocation?.patron?.first_name}{' '}
        {selectedLocation?.patron?.last_name}
      </div>
    </div>
  )
}

export default LocationStep
