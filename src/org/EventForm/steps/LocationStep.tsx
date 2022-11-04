import type { LatLngTuple } from 'leaflet'
import { createContext } from 'react'
import { Controller, useFormContext, UseFormReturn } from 'react-hook-form'
import FormInputError from '../../../components/FormInputError'
import { FormSection, FormSubsection } from '../../../components/FormLayout'
import SelectLocation from '../../../components/SelectLocation'
import { required } from '../../../utils/validationMessages'
import { EventFormShape } from '../../EventForm'

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
  const { control } = useFormContext<EventFormShape>()

  return (
    <FormSection>
      <FormSubsection header="Lokace" required>
        <FormInputError>
          <Controller
            name="location"
            control={control}
            rules={{ required }}
            render={({ field }) => <SelectLocation {...field} />}
          />
        </FormInputError>
      </FormSubsection>
    </FormSection>
  )
}

export default LocationStep
