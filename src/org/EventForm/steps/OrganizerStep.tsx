import { get, uniqBy } from 'lodash'
import { useCallback, useEffect } from 'react'
import { Controller, FormProvider } from 'react-hook-form'
import { api } from '../../../app/services/bis'
import type {
  EventCategory,
  EventGroupCategory,
  EventIntendedForCategory,
  User,
} from '../../../app/services/bisTypes'
import FormInputError from '../../../components/FormInputError'
import {
  FormSection,
  FormSubsection,
  FormSubsubsection,
  FullSizeElement,
  InlineSection,
  Label,
} from '../../../components/FormLayout'
import Loading from '../../../components/Loading'
import {
  SelectFullUser,
  SelectFullUsers,
} from '../../../components/SelectUsers'
import { useCurrentUser } from '../../../hooks/currentUser'
import { joinAnd } from '../../../utils/helpers'
import { required } from '../../../utils/validationMessages'
import { MethodsShapes } from '../../EventForm'
import {
  canBeMainOrganizer,
  canBeMainOrganizer2,
} from './validateMainOrganizer'

const OrganizerStep = ({
  methods,
  mainOrganizerDependencies,
}: {
  methods: MethodsShapes['organizers']
  mainOrganizerDependencies: {
    intended_for?: EventIntendedForCategory
    group?: EventGroupCategory
    category?: EventCategory
  }
}) => {
  const { control, watch, trigger, register, setValue, getValues } = methods
  const { data: allQualifications } = api.endpoints.readQualifications.useQuery(
    {},
  )

  const { data: currentUser } = useCurrentUser()

  const getDisabledMainOrganizer = useCallback(
    (user: User) =>
      !canBeMainOrganizer2(
        mainOrganizerDependencies,
        user,
        allQualifications!.results,
      ),
    [allQualifications, mainOrganizerDependencies],
  )
  const getMainOrganizerLabel = useCallback(
    (user: User) =>
      `${user.display_name} (${
        user.qualifications
          .filter(
            q =>
              new Date(q.valid_since) <= new Date() &&
              new Date() <= new Date(q.valid_till),
          )
          .map(q => q.category.name)
          .join(', ') || 'bez kvalifikace'
      })`,
    [],
  )
  /**
   * Automatically fill organizer team
   */
  useEffect(() => {
    const subscription = watch((data, { name, value }) => {
      if (name === 'main_organizer' || name === 'other_organizers') {
        const mainOrganizer = get(data, 'main_organizer')
        const otherOrganizers = get(data, 'other_organizers', [])

        const team = uniqBy([mainOrganizer, ...otherOrganizers], 'id').filter(
          org => Boolean(org),
        ) as User[]

        const teamString = joinAnd(
          team.map(org => org.nickname || org.first_name),
        )

        if (get(data, 'propagation.organizers') !== teamString)
          setValue('propagation.organizers', teamString)
      }
    })
    return subscription.unsubscribe
  }, [getValues, setValue, watch])

  // trigger validation of organizer team when main_organizer is changed
  // to check whether current user is in the team
  useEffect(() => {
    const subscription = watch((data, { name }) => {
      if (name === 'main_organizer' && methods.formState.isSubmitted)
        trigger('other_organizers')
    })

    return () => subscription.unsubscribe()
  }, [methods.formState.isSubmitted, trigger, watch])

  if (!(allQualifications && currentUser))
    return <Loading>Připravujeme formulář</Loading>

  const contactPerson: User | undefined = watch('contactPersonIsMainOrganizer')
    ? watch('main_organizer')
    : watch('propagation.contact_person')

  return (
    <FormProvider {...methods}>
      <form>
        <FormSection startIndex={20}>
          <FormSubsection
            header="Hlavní organizátor/ka"
            required
            help="Hlavní organizátor musí mít náležité kvalifikace a za celou akci zodpovídá. Je nutné zadávat hlavního organizátora do BIS před akcí, aby měl automaticky sjednané pojištění odpovědnosti za škodu a úrazové pojištění."
          >
            <FullSizeElement>
              <FormInputError>
                <Controller
                  name="main_organizer"
                  control={control}
                  rules={{
                    required: 'Toto pole je povinné!',
                    validate: async user => {
                      try {
                        return canBeMainOrganizer(
                          mainOrganizerDependencies,
                          user,
                          allQualifications.results,
                        )
                      } catch (e) {
                        if (e instanceof Error) return e.message
                        else return 'Exception...'
                      }
                    },
                  }}
                  render={({ field }) => (
                    <SelectFullUser
                      {...field}
                      getDisabled={getDisabledMainOrganizer}
                      getLabel={getMainOrganizerLabel}
                    />
                  )}
                />
              </FormInputError>
            </FullSizeElement>
          </FormSubsection>
          <FormSubsection
            header="Organizační tým"
            help="Vyberte jména dalších organizátorů. Organizátory je možné ještě připojistit na úrazové pojištění a pojištění odpovědnosti za škodu."
          >
            {/* TODO make sure that event creator adds themself here or as main organizer, so they can edit the event */}
            <FullSizeElement>
              <FormInputError>
                <Controller
                  name="other_organizers"
                  control={control}
                  render={({ field }) => <SelectFullUsers {...field} />}
                  rules={{
                    validate: organizers => {
                      const isMainOrganizer =
                        getValues('main_organizer')?.id === currentUser.id
                      const isOrganizer =
                        organizers.findIndex(
                          org => org.id === currentUser.id,
                        ) >= 0

                      return (
                        isMainOrganizer ||
                        isOrganizer ||
                        'Musíš být v organizátorském týmu.'
                      )
                    },
                  }}
                />
              </FormInputError>
            </FullSizeElement>
            <FormSubsubsection
              header="Těší se na Tebe..."
              onWeb
              required
              help="Takto se organizační tým zobrazí na webu. Pole můžeš nechat vyplněno automaticky, nebo změnit podle potřeby."
            >
              <FullSizeElement>
                <FormInputError>
                  <input type="text" {...register('propagation.organizers')} />
                </FormInputError>
              </FullSizeElement>
            </FormSubsubsection>
          </FormSubsection>
          <FormSubsection header="Kontaktní osoba" required onWeb>
            <label>
              <input
                type="checkbox"
                {...register('contactPersonIsMainOrganizer')}
              />{' '}
              stejná jako hlavní organizátor
            </label>
            {!watch('contactPersonIsMainOrganizer') && (
              <FullSizeElement>
                <FormInputError>
                  <Controller
                    name="propagation.contact_person"
                    control={control}
                    rules={{ required }}
                    render={({ field }) => <SelectFullUser {...field} />}
                  />
                </FormInputError>
              </FullSizeElement>
            )}
            <FormSubsubsection
              header="Kontaktní údaje"
              help="Pokud necháš kontaktní údaje prázdné, použije se jméno/email/telefon kontaktní osoby."
            >
              <InlineSection>
                <Label htmlFor="propagation.contact_name">
                  Jméno kontaktní osoby
                </Label>
                <FormInputError>
                  <input
                    type="text"
                    id="propagation.contact_name"
                    {...register('propagation.contact_name')}
                    placeholder={
                      contactPerson &&
                      (contactPerson.nickname
                        ? `${contactPerson.nickname} (${contactPerson.first_name} ${contactPerson.last_name})`
                        : `${contactPerson.first_name} ${contactPerson.last_name}`)
                    }
                  />
                </FormInputError>
              </InlineSection>
              <InlineSection>
                <Label htmlFor="propagation.contact_email">
                  Kontaktní email
                </Label>
                <FormInputError>
                  <input
                    id="propagation.contact_email"
                    type="email"
                    {...register('propagation.contact_email')}
                    placeholder={contactPerson?.email ?? undefined}
                  />
                </FormInputError>
              </InlineSection>
              <InlineSection>
                <Label htmlFor="propagation.contact_phone">
                  Kontaktní telefon
                </Label>
                <FormInputError>
                  <input
                    id="propagation.contact_phone"
                    type="tel"
                    {...register('propagation.contact_phone')}
                    placeholder={contactPerson?.phone}
                  />
                </FormInputError>
              </InlineSection>
            </FormSubsubsection>
          </FormSubsection>
        </FormSection>
      </form>
    </FormProvider>
  )
}

export default OrganizerStep
