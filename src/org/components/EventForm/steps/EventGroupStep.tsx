import { api } from 'app/services/bis'
import {
  FormInputError,
  FormSection,
  FormSubsection,
  IconSelect,
  IconSelectGroup,
} from 'components'
import { form as formTexts } from 'config/static/event'
import { Controller, FormProvider } from 'react-hook-form'
import { required } from 'utils/validationMessages'
import { MethodsShapes } from '..'

/*
 * Create Event Form Step for Event Category
 * In api, Category is called Group
 */
export const EventGroupStep = ({
  methods,
}: {
  methods: MethodsShapes['group']
}) => {
  const { data: groups } = api.endpoints.readEventGroups.useQuery()
  return (
    <FormProvider {...methods}>
      <form>
        <FormSection startIndex={1}>
          <FormSubsection header="Jaký je druh nové akce?">
            <FormInputError>
              <Controller
                name="group"
                control={methods.control}
                rules={{ required }}
                render={({ field }) => (
                  <IconSelectGroup>
                    {groups &&
                      [...groups.results].reverse().map(({ id, slug }) => {
                        const {
                          icon: Icon,
                          name,
                          help,
                        } = formTexts.group.options[slug]
                        return (
                          <IconSelect
                            key={id}
                            text={name}
                            help={help}
                            icon={Icon}
                            id={slug}
                            ref={field.ref}
                            name={field.name}
                            value={id}
                            checked={id === field.value}
                            onChange={e =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        )
                      })}
                  </IconSelectGroup>
                )}
              />
            </FormInputError>
          </FormSubsection>
        </FormSection>
      </form>
    </FormProvider>
  )
}
