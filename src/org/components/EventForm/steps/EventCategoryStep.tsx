import { api } from 'app/services/bis'
import { ReactComponent as OneTreeIcon } from 'assets/one-tree.svg'
import { ReactComponent as TentIcon } from 'assets/tent.svg'
import { ReactComponent as ThreeTreesIcon } from 'assets/three-trees.svg'
import {
  FormInputError,
  FormSection,
  FormSubsection,
  IconSelect,
  IconSelectGroup,
} from 'components'
import { ReactNode } from 'react'
import { Controller, FormProvider } from 'react-hook-form'
import { MethodsShapes } from '..'

type EventGroupSlug = 'weekend_event' | 'other' | 'camp'

type IconType = React.FunctionComponent<
  React.SVGProps<SVGSVGElement> & {
    title?: string | undefined
  }
>

const groupConfig: Record<
  EventGroupSlug,
  { icon: IconType; name: ReactNode; help: ReactNode }
> = {
  weekend_event: {
    icon: ThreeTreesIcon,
    name: (
      <>
        Víkendovka,
        <br />
        Akce s adresářem,
        <br />
        Brďo schůzky
      </>
    ),
    help: 'Víkendovky jsou akce trvající 2-5 dnů',
  },
  other: {
    icon: OneTreeIcon,
    name: (
      <>
        Jednodenní akce,
        <br />
        Akce bez adresáře
      </>
    ),
    help: 'Akce trvající 1 den a méně. Akce bez povinné prezenční listiny jsou speciální akce, kde nelze vyplňovat prezenční listinu např. dlouhodobé výstavy, velké akce pro veřejnost…',
  },
  camp: {
    icon: TentIcon,
    name: 'Tábory',
    help: 'Tábory jsou akce konající se 6 a více dní',
  },
}

// Create Event Form Step for Event Category
// In api, Category is called Group

export const EventCategoryStep = ({
  methods,
}: {
  methods: MethodsShapes['category']
}) => {
  const { data: groups } = api.endpoints.readEventGroups.useQuery()
  return (
    <FormProvider {...methods}>
      <form>
        <FormSection startIndex={1}>
          <FormSubsection header="Jaký je typ nové akce?">
            <FormInputError>
              <Controller
                name="group"
                control={methods.control}
                rules={{
                  required: 'Toto pole je povinné!',
                }}
                render={({ field }) => (
                  <IconSelectGroup>
                    {groups &&
                      [...groups.results].reverse().map(({ id, slug }) => {
                        const {
                          icon: Icon,
                          name,
                          help,
                        } = groupConfig[slug as EventGroupSlug]
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
