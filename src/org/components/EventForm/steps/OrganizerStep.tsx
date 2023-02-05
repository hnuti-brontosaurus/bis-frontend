import { api } from 'app/services/bis'
import type {
  EventCategory,
  EventGroupCategory,
  EventIntendedForCategory,
  QualificationCategory,
  User,
  UserSearch,
} from 'app/services/bisTypes'
import {
  FormInputError,
  FormSection,
  FormSectionGroup,
  FormSubsection,
  FullSizeElement,
  InfoBox,
  InlineSection,
  Label,
  Loading,
  SelectUnknownUser,
  SelectUnknownUsers,
} from 'components'
import { useShowMessage } from 'features/systemMessage/useSystemMessage'
import { useCurrentUser } from 'hooks/currentUser'
import { get, uniqBy } from 'lodash'
import { Fragment, useCallback, useEffect } from 'react'
import { Controller, FormProvider } from 'react-hook-form'
import { getUserRoles, joinAnd } from 'utils/helpers'
import { required } from 'utils/validationMessages'
import { MethodsShapes } from '..'
import {
  canBeMainOrganizer,
  getRequiredQualifications,
} from '../../../utils/validateQualifications'

export const OrganizerStep = ({
  methods,
  mainOrganizerDependencies,
  isNotOnWeb,
}: {
  methods: MethodsShapes['organizers']
  mainOrganizerDependencies: {
    intended_for?: EventIntendedForCategory
    group?: EventGroupCategory
    category?: EventCategory
  }
  isNotOnWeb: boolean
}) => {
  const { control, watch, trigger, register, setValue, getValues } = methods
  const { data: allQualifications } = api.endpoints.readQualifications.useQuery(
    {},
  )

  const { data: currentUser } = useCurrentUser()

  const showMessage = useShowMessage()

  const getDisabledMainOrganizer = useCallback(
    (user: User | UserSearch) => {
      if ('id' in user) {
        try {
          if (
            canBeMainOrganizer(
              mainOrganizerDependencies,
              user,
              allQualifications!.results,
            )
          )
            return ''
          else return 'Unexpected Error'
        } catch (error) {
          if (error instanceof Error) return error.message
          else throw error
        }
      } else {
        return ''
      }
    },
    [allQualifications, mainOrganizerDependencies],
  )
  const getMainOrganizerLabel = useCallback(
    (user: User | UserSearch) =>
      user.display_name +
      ('id' in user
        ? ` (${
            user.qualifications
              .filter(
                q =>
                  new Date(q.valid_since) <= new Date() &&
                  new Date() <= new Date(q.valid_till),
              )
              .map(q => q.category.name)
              .join(', ') || '—'
          })`
        : ''),
    [],
  )
  /**
   * Automatically fill organizer team
   * and revalidate
   */
  useEffect(() => {
    const subscription = watch((data, { name }) => {
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
      if (methods.formState.isSubmitted) {
        if (name === 'main_organizer') trigger('other_organizers')
        if (name === 'main_organizer' || name === 'other_organizers')
          trigger('propagation.organizers')
      }
    })

    return () => subscription.unsubscribe()
  }, [methods.formState.isSubmitted, trigger, watch])

  if (!(allQualifications && currentUser))
    return <Loading>Připravujeme formulář</Loading>

  const contactPerson: User | undefined = watch('contactPersonIsMainOrganizer')
    ? watch('main_organizer')
    : watch('propagation.contact_person')

  const requiredQualifications = getRequiredQualifications(
    mainOrganizerDependencies,
  ).map(slug =>
    allQualifications.results.find(q => q.slug === slug),
  ) as QualificationCategory[]

  return (
    <FormProvider {...methods}>
      <form>
        <FormSectionGroup startIndex={isNotOnWeb ? 11 : 20}>
          <FormSection
            header="Hlavní organizátor/ka"
            required
            help="Hlavní organizátor musí mít náležité kvalifikace a za celou akci zodpovídá. Je nutné zadávat hlavního organizátora do BIS před akcí, aby měl automaticky sjednané pojištění odpovědnosti za škodu a úrazové pojištění."
          >
            <FullSizeElement>
              <InfoBox>
                Hlavní organizátor/ka pro akci{' '}
                <i>
                  {mainOrganizerDependencies.group?.name ?? '—'} &middot;{' '}
                  {mainOrganizerDependencies.category?.name ?? '—'} &middot;{' '}
                  {mainOrganizerDependencies.intended_for?.name ?? '—'}
                </i>{' '}
                {requiredQualifications.length === 0 ? (
                  <>nemusí mít žádnou kvalifikaci</>
                ) : (
                  <>
                    musí mít kvalifikaci{' '}
                    {requiredQualifications.map(({ name, slug }) => (
                      <Fragment key={slug}>
                        <i>{name}</i> nebo{' '}
                      </Fragment>
                    ))}
                    kvalifikaci nadřazenou
                  </>
                )}{' '}
                a musí mít minimálně 18 let.
              </InfoBox>
              <FormInputError>
                <Controller
                  name="main_organizer"
                  control={control}
                  rules={{
                    required,
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
                    <SelectUnknownUser
                      {...field}
                      onBirthdayError={message =>
                        showMessage({
                          type: 'error',
                          message: 'Nepodařilo se přidat uživatele',
                          detail: message,
                        })
                      }
                      getDisabled={getDisabledMainOrganizer}
                      getLabel={getMainOrganizerLabel}
                    />
                  )}
                />
              </FormInputError>
            </FullSizeElement>
          </FormSection>
          <FormSection
            header="Organizační tým"
            help="Vyberte jména dalších organizátorů. Organizátory je možné ještě připojistit na úrazové pojištění a pojištění odpovědnosti za škodu."
          >
            {/* TODO make sure that event creator adds themself here or as main organizer, so they can edit the event */}
            <FullSizeElement>
              <FormInputError>
                <Controller
                  name="other_organizers"
                  control={control}
                  render={({ field }) => (
                    <SelectUnknownUsers
                      {...field}
                      onBirthdayError={message =>
                        showMessage({
                          type: 'error',
                          message: 'Nepodařilo se přidat uživatele',
                          detail: message,
                        })
                      }
                    />
                  )}
                  rules={{
                    validate: organizers => {
                      const isMainOrganizer =
                        getValues('main_organizer')?.id === currentUser.id
                      const isOrganizer =
                        organizers.findIndex(
                          org => org.id === currentUser.id,
                        ) >= 0
                      // people with zc access can save without being in team
                      // this will be really painful though
                      // they can save event which they won't be allowed to read :(
                      // but it is a requirement
                      const isZC = getUserRoles(currentUser).includes('zc')

                      return (
                        isZC ||
                        isMainOrganizer ||
                        isOrganizer ||
                        'Musíš být v organizátorském týmu.'
                      )
                    },
                  }}
                />
              </FormInputError>
            </FullSizeElement>
            {!isNotOnWeb && (
              <FormSubsection
                header="Těší se na Tebe..."
                onWeb
                required
                help="Takto se organizační tým zobrazí na webu. Pole můžeš nechat vyplněno automaticky, nebo změnit podle potřeby."
              >
                <FullSizeElement>
                  <FormInputError>
                    <input
                      type="text"
                      {...register('propagation.organizers', { required })}
                    />
                  </FormInputError>
                </FullSizeElement>
              </FormSubsection>
            )}
          </FormSection>
          {!isNotOnWeb && (
            <>
              <FormSection header="Kontaktní osoba" required onWeb>
                <label className="checkboxLabel">
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
                        render={({ field }) => (
                          <SelectUnknownUser
                            {...field}
                            onBirthdayError={message =>
                              showMessage({
                                type: 'error',
                                message: 'Nepodařilo se přidat uživatele',
                                detail: message,
                              })
                            }
                          />
                        )}
                      />
                    </FormInputError>
                  </FullSizeElement>
                )}
                <FormSubsection
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
                </FormSubsection>
              </FormSection>
            </>
          )}
        </FormSectionGroup>
      </form>
    </FormProvider>
  )
}
