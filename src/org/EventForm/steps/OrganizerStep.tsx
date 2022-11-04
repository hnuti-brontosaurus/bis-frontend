import { Controller, useFormContext } from 'react-hook-form'
import { api } from '../../../app/services/bis'
import {
  EventCategory,
  EventGroupCategory,
  EventIntendedForCategory,
} from '../../../app/services/testApi'
import FormInputError from '../../../components/FormInputError'
import { FormSection, FormSubsection } from '../../../components/FormLayout'
import Loading from '../../../components/Loading'
import SelectUsers, { SelectUser } from '../../../components/SelectUsers'
import { EventFormShape } from '../../EventForm'
import {
  canBeMainOrganizer,
  canBeMainOrganizer2,
} from './validateMainOrganizer'

const OrganizerStep = () => {
  const { control, watch } = useFormContext<EventFormShape>()
  const { data: categories } = api.endpoints.getEventCategories.useQuery()
  const { data: groups } = api.endpoints.getEventGroups.useQuery()
  const { data: intendedFor } = api.endpoints.getIntendedFor.useQuery()
  const { data: allQualifications } = api.endpoints.readQualifications.useQuery(
    {},
  )

  const [readUser] = api.endpoints.getUser.useLazyQuery()

  if (!(groups && allQualifications && categories))
    return <Loading>Připravujeme formulář</Loading>

  return (
    <>
      <FormSection>
        <FormSubsection header="Hlavní organizátor/ka">
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
                      {
                        intended_for: intendedFor?.results.find(
                          c => c.id === +watch('intended_for'),
                        ) as EventIntendedForCategory,
                        group: groups.results.find(
                          g => g.id === +watch('group'),
                        ) as EventGroupCategory,
                        category: categories.results.find(
                          c => c.id === +watch('category'),
                        ) as EventCategory,
                      },
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
                      {
                        intended_for: intendedFor?.results.find(
                          c => c.id === +watch('intended_for'),
                        ) as EventIntendedForCategory,
                        group: groups.results.find(
                          g => g.id === +watch('group'),
                        ) as EventGroupCategory,
                        category: categories.results.find(
                          c => c.id === +watch('category'),
                        ) as EventCategory,
                      },
                      user,
                      allQualifications.results,
                    ),
                  })}
                />
              )}
            />
          </FormInputError>
        </FormSubsection>
        <FormSubsection header="Organizátorský tým">
          {/* TODO make sure that event creator adds themself here or as main organizer, so they can edit the event */}
          <FormInputError>
            <Controller
              name="other_organizers"
              control={control}
              render={({ field }) => <SelectUsers {...field} />}
            />
          </FormInputError>
        </FormSubsection>
      </FormSection>
    </>
  )
}

export default OrganizerStep
