import { yupResolver } from '@hookform/resolvers/yup'
import { skipToken } from '@reduxjs/toolkit/dist/query'
import classNames from 'classnames'
import {
  ClearBounds,
  FormInputError,
  InlineSection,
  Label,
  Map,
  MarkerType,
  SelectObject,
} from 'components'
import { LatLngTuple } from 'leaflet'
import merge from 'lodash/merge'
import { FocusEvent, forwardRef, useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm, UseFormReturn } from 'react-hook-form'
import { Overwrite } from 'utility-types'
import * as yup from 'yup'
import { api, CorrectLocation } from '../../app/services/bis'
import { required } from '../../utils/validationMessages'
import styles from './SelectLocation.module.scss'

export type NewLocation = Overwrite<
  Pick<CorrectLocation, 'gps_location' | 'name' | 'address' | 'description'>,
  { gps_location?: Omit<Required<CorrectLocation>['gps_location'], 'type'> }
>

const newLocationSchema: yup.ObjectSchema<NewLocation> = yup.object({
  name: yup.string().trim().required(),
  gps_location: yup
    .object({
      coordinates: yup
        .tuple([
          yup.number().required().min(-180).max(180),
          yup.number().required().min(-90).max(90),
        ])
        .required(),
    })
    .required(),
  address: yup.string(),
  description: yup.string(),
})

export type SelectedOrNewLocation = NewLocation | Pick<CorrectLocation, 'id'>

export const SelectLocation = forwardRef<
  any,
  {
    value: SelectedOrNewLocation | null
    onChange: (location: SelectedOrNewLocation | null) => void
  }
>(({ value, onChange }, ref) => {
  const [isEditing, setIsEditing] = useState(false)
  const [bounds, setBounds] = useState<ClearBounds>()

  const { data: locations, isLoading } = api.endpoints.readLocations.useQuery(
    bounds ? { pageSize: 5000 } : skipToken,
  )

  const newLocationMethods = useForm<NewLocation>({
    resolver: yupResolver(newLocationSchema),
  })

  const locationsWithGPS = useMemo(
    () =>
      (locations?.results ?? []).filter(
        location => location?.gps_location?.coordinates,
      ),
    [locations],
  )
  const { data: selectedLocation } = api.endpoints.readLocation.useQuery(
    value && 'id' in value
      ? {
          id: value.id,
        }
      : skipToken,
  )

  // here we hold the coordinates of new location in map
  const [newLocationCoordinates, setNewLocationCoordinates] = useState<
    LatLngTuple | undefined
  >()

  useEffect(() => {
    if (!newLocationCoordinates)
      newLocationMethods.setValue('gps_location', undefined)
    else {
      newLocationMethods.setValue(
        'gps_location.coordinates.0',
        newLocationCoordinates[1],
      )
      newLocationMethods.setValue(
        'gps_location.coordinates.1',
        newLocationCoordinates[0],
      )
      newLocationMethods.trigger('gps_location')
    }
  }, [newLocationCoordinates, newLocationMethods])

  const actuallySelectedLocation =
    value && 'id' in value ? selectedLocation : value?.name ? value : undefined

  const markers: MarkerType[] = useMemo(() => {
    const markers: MarkerType[] = locationsWithGPS.map(location => ({
      type: 'existent',
      id: location.id,
      name: location.name,
      // api has coordinates switched, so we switch them, and we'll have to switch back when saving
      coordinates: [
        ...(location.gps_location?.coordinates as [number, number]),
      ].reverse() as LatLngTuple,
    }))

    if (value && 'id' in value) {
      // api has coordinates switched, so we switch them, and we'll have to switch back when saving
      const selectedMarker = markers.find(
        marker => Number(marker.id) === Number(value.id),
      )

      if (selectedMarker) {
        selectedMarker.type = 'selected'
      } else if (selectedLocation?.gps_location?.coordinates) {
        const [lng, lat] = selectedLocation.gps_location.coordinates
        const coordinates = [lat, lng] as LatLngTuple

        markers.push({
          type: 'selected',
          name: selectedLocation.name,
          coordinates,
          id: selectedLocation.id,
        })
      }
    } else if (!isEditing && value?.name && value?.gps_location?.coordinates) {
      markers.push({
        type: 'selected',
        name: value.name,
        coordinates: [
          value.gps_location.coordinates[1],
          value.gps_location.coordinates[0],
        ],
        id: -1,
      })
    }

    return markers
  }, [locationsWithGPS, value, selectedLocation, isEditing])

  const selection = useMemo(
    () => markers.find(marker => marker.type === 'selected'),
    [markers],
  )

  const handleSelect = (id: number) => {
    setIsEditing(false)
    onChange({ id })
  }

  // do this when CreateLocation is finished
  const handleFinish = (location?: NewLocation) => {
    setIsEditing(false)
    if (location) onChange(location)
  }

  return (
    <div>
      Vyber lokalitu podle názvu
      <br />
      <SelectObject<CorrectLocation>
        className={classNames(styles.aboveMap, styles.fullWidth)}
        value={(value as CorrectLocation) ?? undefined}
        onChange={onChange}
        getLabel={location => location.name}
        placeholder="Název"
        search={api.endpoints.readLocations}
        ref={ref}
      />
      <br />
      nebo Vyber lokalitu na mapě
      <hr />
      <input type="text" placeholder="Najít adresu na mapě (TODO later)" />
      <br />
      {isLoading && (
        <div>
          <small>Načítáme lokality</small>
        </div>
      )}
      <Map
        markers={markers}
        selection={selection}
        value={isEditing ? newLocationCoordinates : undefined}
        onChange={coordinates => {
          if (isEditing) {
            setNewLocationCoordinates(coordinates)
          }
        }}
        onSelect={handleSelect}
        onChangeBounds={bounds => setBounds(bounds)}
        onDeselect={() => {}}
      />
      {!isEditing ? (
        <>
          nebo{' '}
          <button type="button" onClick={() => setIsEditing(true)}>
            {newLocationMethods.formState.isDirty
              ? 'Pokračuj ve vytváření nové lokality'
              : 'Vytvoř novou lokalitu'}
          </button>
        </>
      ) : (
        <div>Kliknutím do mapy můžeš vybrat GPS</div>
      )}
      {isEditing ? (
        <CreateLocation
          methods={newLocationMethods}
          onChangeCoordinates={coords => setNewLocationCoordinates(coords)}
          onFinish={handleFinish}
        />
      ) : (
        <ViewLocation location={actuallySelectedLocation} />
      )}
    </div>
  )
})

const CreateLocation = ({
  formId = 'create-location',
  methods,
  onChangeCoordinates,
  onFinish,
}: {
  formId?: string
  methods: UseFormReturn<NewLocation>
  onChangeCoordinates: (coords: LatLngTuple | undefined) => void
  onFinish: (location?: NewLocation) => void
}) => {
  const { onBlur: blurLatitude, ...registerLatitude } = methods.register(
    'gps_location.coordinates.1',
    { required },
  )
  const { onBlur: blurLongitude, ...registerLongitude } = methods.register(
    'gps_location.coordinates.0',
    { required },
  )

  const handleGPSBlur = (e: FocusEvent<HTMLInputElement, Element>) => {
    const rawCoordinates = methods.getValues('gps_location.coordinates')
    const areCoordinatesNumeric = rawCoordinates.every(
      a => !isNaN(parseInt(a as unknown as string)),
    )
    if (areCoordinatesNumeric) {
      const coordinates = [...rawCoordinates]
        .reverse()
        .map(a => Number(a)) as LatLngTuple
      onChangeCoordinates(coordinates)
    } else {
      onChangeCoordinates(undefined)
    }
  }

  const handleConfirm = methods.handleSubmit(data => onFinish(data))

  const handleCancel = () => {
    methods.reset({})
    onFinish()
  }

  return (
    <div className={styles.container}>
      <FormProvider {...methods}>
        <InlineSection>
          <Label htmlFor="location.name" required>
            Název:
          </Label>
          <FormInputError>
            <input
              id="location.name"
              type="text"
              form={formId}
              {...methods.register('name', { required })}
            />
          </FormInputError>
        </InlineSection>
        <InlineSection>
          <Label htmlFor="location.gps" required>
            GPS:
          </Label>
          <FormInputError>
            <input
              type="text"
              id="location.gps"
              placeholder="50.01234567"
              form={formId}
              {...registerLatitude}
              onBlur={e => {
                handleGPSBlur(e)
                blurLatitude(e)
              }}
            />
          </FormInputError>
          N{' '}
          <FormInputError>
            <input
              type="text"
              placeholder="14.98765432"
              form={formId}
              {...registerLongitude}
              onBlur={e => {
                handleGPSBlur(e)
                blurLongitude(e)
              }}
            />
          </FormInputError>
          E
        </InlineSection>
        <InlineSection>
          <Label htmlFor="location.address">Adresa:</Label>{' '}
          <FormInputError>
            <input
              type="text"
              id="location.address"
              form={formId}
              {...methods.register('address')}
            />
          </FormInputError>
        </InlineSection>
        <InlineSection>
          <Label htmlFor="location.description">Popis:</Label>
          <FormInputError>
            <textarea
              id="location.description"
              form={formId}
              {...methods.register('description')}
            />
          </FormInputError>
        </InlineSection>
        <InlineSection>
          <input
            type="reset"
            value="zrušit"
            form={formId}
            onClick={handleCancel}
          />
          <input
            type="submit"
            value="ok"
            form={formId}
            onClick={handleConfirm}
          />
        </InlineSection>
      </FormProvider>
    </div>
  )
}
const ViewLocation = ({ location }: { location?: NewLocation }) => {
  return (
    <>
      <div>Název: {location?.name}</div>
      <div>
        GPS: {location?.gps_location?.coordinates?.[1]}{' '}
        {location?.gps_location?.coordinates?.[0]}
      </div>
      <div>Adresa: {location?.address}</div>
      <div>Popis: {location?.description}</div>
    </>
  )
}

export const useCreateOrSelectLocation = () => {
  const [createLocation] = api.endpoints.createLocation.useMutation()

  const createOrSelectLocation = async (
    location: NewLocation | Pick<CorrectLocation, 'id'>,
  ) => {
    if (!location) {
      return null
    } else if ('id' in location) {
      return location.id
    } else {
      // create new location
      const newLocation = await createLocation(
        merge({}, location, {
          patron: null,
          contact_person: null,
          gps_location: {
            type: 'Point',
          },
        }) as unknown as Omit<CorrectLocation, 'id'>,
      ).unwrap()
      return newLocation.id
    }
  }

  return createOrSelectLocation
}
