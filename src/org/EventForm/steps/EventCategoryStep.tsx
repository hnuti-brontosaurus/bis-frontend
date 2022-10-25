import { Controller, useFormContext } from 'react-hook-form'
import { api } from '../../../app/services/bis'
import { ReactComponent as OneTreeIcon } from '../../../assets/one-tree.svg'
import { ReactComponent as TentIcon } from '../../../assets/tent.svg'
import { ReactComponent as ThreeTreesIcon } from '../../../assets/three-trees.svg'
import FormInputError from '../../../components/FormInputError'
import { IconSelect, IconSelectGroup } from '../../../components/IconSelect'
import { FormShape } from '../../EventForm'

const groupIcons = {
  weekend_event: ThreeTreesIcon,
  other: OneTreeIcon,
  camp: TentIcon,
}

type EventGroupSlug = keyof typeof groupIcons

// Create Event Form Step for Event Category
// In api, Category is called Group

const EventCategoryStep = () => {
  const { control } = useFormContext<FormShape>()
  const { data: groups, isLoading: isEventGroupsLoading } =
    api.endpoints.getEventGroups.useQuery()
  return (
    <fieldset>
      <header>1. Jaký je typ nové akce?</header>
      <FormInputError>
        <Controller
          name="group"
          control={control}
          rules={{
            required: 'Toto pole je povinné!',
          }}
          render={({ field }) => (
            <IconSelectGroup>
              {groups &&
                groups.results!.map(({ id, name, slug }) => {
                  const Icon = groupIcons[slug as EventGroupSlug]
                  return (
                    <IconSelect
                      key={id}
                      text={name}
                      icon={Icon}
                      id={slug}
                      ref={field.ref}
                      name={field.name}
                      value={id}
                      checked={id === field.value}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  )
                })}
            </IconSelectGroup>
          )}
        />
      </FormInputError>
    </fieldset>
  )
}

export default EventCategoryStep
