import { Controller, FormProvider } from 'react-hook-form'
import { api } from '../../../app/services/bis'
import {
  EventCategory,
  EventGroupCategory,
  EventIntendedForCategory,
} from '../../../app/services/testApi'
import FormInputError from '../../../components/FormInputError'
import {
  FormSection,
  FormSubsection,
  FullSizeElement,
  InlineSection,
  Label,
} from '../../../components/FormLayout'
import Loading from '../../../components/Loading'
import SelectUsers, { SelectUser } from '../../../components/SelectUsers'
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
  const { control, watch, register } = methods
  const { data: allQualifications } = api.endpoints.readQualifications.useQuery(
    {},
  )

  const [readUser] = api.endpoints.getUser.useLazyQuery()

  if (!allQualifications) return <Loading>Připravujeme formulář</Loading>

  return (
    <FormProvider {...methods}>
      <form>
        <FormSection>
          <FormSubsection header="Hlavní organizátor/ka">
            <FullSizeElement>
              <FormInputError>
                <Controller
                  name="main_organizer"
                  control={control}
                  rules={{
                    required: 'Toto pole je povinné!',
                    validate: async () => {
                      try {
                        const userId = watch('main_organizer')
                        if (!userId) return 'Toto pole je povinné!'
                        const user = await readUser({ id: userId }).unwrap()
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
                    <SelectUser
                      {...field}
                      transform={user => ({
                        label: `${user.display_name} (${user.qualifications
                          .filter(
                            q =>
                              new Date(q.valid_since) <= new Date() &&
                              new Date() <= new Date(q.valid_till),
                          )
                          .map(q => q.category.name)
                          .join(', ')})`,
                        value: user.id,
                        disabled: !canBeMainOrganizer2(
                          mainOrganizerDependencies,
                          user,
                          allQualifications.results,
                        ),
                      })}
                    />
                  )}
                />
              </FormInputError>
            </FullSizeElement>
          </FormSubsection>
          <FormSubsection header="Organizátorský tým">
            {/* TODO make sure that event creator adds themself here or as main organizer, so they can edit the event */}
            <FullSizeElement>
              <FormInputError>
                <Controller
                  name="other_organizers"
                  control={control}
                  render={({ field }) => <SelectUsers {...field} />}
                />
              </FormInputError>
            </FullSizeElement>
          </FormSubsection>
          <FormSubsection header="Kontaktní osoba">
            <label>
              <input type="checkbox" /> stejná jako hlavní organizátor
            </label>
            {/* TODO if checkbox is checked, autofill, or figure out what happens */}
            <FullSizeElement>
              <FormInputError>
                <Controller
                  name="propagation.contact_person"
                  control={control}
                  render={({ field }) => <SelectUser {...field} />}
                />
              </FormInputError>
            </FullSizeElement>
            {/*
                TODO figure out what happens with name when contact person is filled
                maybe fill when not already filled
                */}
            <InlineSection>
              <Label required htmlFor="propagation.contact_name">
                Jméno kontaktní osoby
              </Label>
              <FormInputError>
                <input
                  type="text"
                  id="propagation.contact_name"
                  {...register('propagation.contact_name', {
                    required,
                  })}
                />
              </FormInputError>
            </InlineSection>
            <InlineSection>
              <Label required htmlFor="propagation.contact_email">
                Kontaktní email
              </Label>
              <FormInputError>
                <input
                  id="propagation.contact_email"
                  type="email"
                  {...register('propagation.contact_email', {
                    required,
                  })}
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
                  {...register('propagation.contact_phone', {})}
                />
              </FormInputError>
            </InlineSection>
          </FormSubsection>
        </FormSection>
      </form>
    </FormProvider>
  )
}

export default OrganizerStep
