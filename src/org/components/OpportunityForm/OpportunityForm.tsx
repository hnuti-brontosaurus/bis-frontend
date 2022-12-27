import { api } from 'app/services/bis'
import type { Location, OpportunityPayload } from 'app/services/bisTypes'
import { ReactComponent as HandsIcon } from 'assets/hands.svg'
import { ReactComponent as HousesIcon } from 'assets/houses.svg'
import { ReactComponent as OrganizerIcon } from 'assets/organizer.svg'
import {
  Actions,
  Button,
  FormInputError,
  FormSection,
  FormSectionGroup,
  FormSubheader,
  FullSizeElement,
  htmlRequired,
  IconSelect,
  IconSelectGroup,
  ImageUpload,
  InfoBox,
  InlineSection,
  Label,
  NewLocation,
  RichTextEditor,
  SelectLocation,
} from 'components'
import { useShowMessage } from 'features/systemMessage/useSystemMessage'
import { useCurrentUser } from 'hooks/currentUser'
import {
  useClearPersistentForm,
  usePersistentFormData,
  usePersistForm,
} from 'hooks/persistForm'
import merge from 'lodash/merge'
import { FormEventHandler, ReactNode, useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { Overwrite } from 'utility-types'
import { getIdBySlug } from 'utils/helpers'
import * as translations from 'utils/translations'
import { validationErrors2Message } from 'utils/validationErrors'
import { required } from 'utils/validationMessages'
import styles from './OpportunityForm.module.scss'

const categoryIcons = {
  organizing: OrganizerIcon,
  collaboration: HandsIcon,
  location_help: HousesIcon,
} as const

type OpportunityCategorySlug = keyof typeof categoryIcons

const categoryDetails: Record<OpportunityCategorySlug, ReactNode> = {
  organizing: 'Příležitosti organizovat či pomáhat s pořádáním našich akcí.',
  collaboration:
    'Příležitosti ke spolupráci na chodu a rozvoji Hnutí Brontosaurus.',
  location_help:
    'Příležitosti k pomoci dané lokalitě, která to aktuálně potřebuje.',
}

export type OpportunityFormShape = Overwrite<
  OpportunityPayload,
  { location: NewLocation | Location }
>

export const OpportunityForm = ({
  initialData,
  onSubmit,
  onCancel,
  isUpdate,
  id,
}: {
  initialData?: Partial<OpportunityFormShape>
  onSubmit: (data: OpportunityFormShape) => Promise<void>
  onCancel: () => void
  isUpdate?: boolean
  id: string
}) => {
  // hack to select initial category correctly (id has to be string when using register, but we pretend it's number, to satisfy TypeScript)
  if (initialData?.category) {
    initialData.category = String(initialData.category) as unknown as number
  }

  const savedData = usePersistentFormData('opportunity', id)

  const showMessage = useShowMessage()

  const methods = useForm<OpportunityFormShape>({
    defaultValues: merge({}, initialData, savedData),
  })
  const { register, control, handleSubmit, watch, trigger, formState } = methods

  usePersistForm('opportunity', id, watch)

  // when contact info isn't specified, the contact info of the opportunity creator (current user) is used
  const { data: defaultContactPerson } = useCurrentUser()

  const { data: opportunityCategories } =
    api.endpoints.readOpportunityCategories.useQuery({
      page: 1,
      pageSize: 1000,
    })

  const cancelPersist = useClearPersistentForm('opportunity', id)

  const categoriesList = opportunityCategories?.results
  const handleFormSubmit = handleSubmit(
    async data => {
      await onSubmit(data)
      cancelPersist()
    },
    errors => {
      showMessage({
        type: 'error',
        message: 'Opravte, prosím, chyby ve formuláři',
        detail: validationErrors2Message(
          errors,
          translations.opportunity,
          translations.generic,
        ),
      })
    },
  )

  const handleFormReset: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault()
    // reset form
    // reset(initialData) // it doesn't reset empty form but triggers watch
    // clear persisted changes
    cancelPersist()
    // and do whatever is necessary upstream
    onCancel()
  }

  const isCollaboration =
    opportunityCategories &&
    getIdBySlug(opportunityCategories.results, 'collaboration') ===
      +watch('category')

  // when switching to or from collaboration, and if form was already validated, revalidate form
  // in order to update error messages on location_benefits
  useEffect(() => {
    if (formState.isSubmitted) trigger('location_benefits')
  }, [isCollaboration, formState.isSubmitted, trigger])

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleFormSubmit} onReset={handleFormReset}>
        <FormSectionGroup className="opportunitySection">
          <FormSection
            required
            header={'Čeho se tvá příležitost k zapojení týká?'}
          >
            <FormInputError name="category">
              <IconSelectGroup color="blue">
                {categoriesList &&
                  categoriesList.map(category => {
                    const Icon =
                      categoryIcons[category.slug as OpportunityCategorySlug]
                    return (
                      <IconSelect
                        id={category.slug}
                        key={category.slug}
                        text={category.name}
                        detail={
                          categoryDetails[
                            category.slug as OpportunityCategorySlug
                          ]
                        }
                        icon={Icon}
                        value={category.id}
                        {...register('category', { required })}
                      />
                    )
                  })}
              </IconSelectGroup>
            </FormInputError>
          </FormSection>
          <FormSection header="Název" required>
            <FormInputError>
              <input
                type="text"
                placeholder="name"
                {...register('name', { required })}
              />
            </FormInputError>
          </FormSection>
          <FormSection header="Datum">
            <InlineSection>
              <Label required htmlFor="start">
                Od
              </Label>{' '}
              <FormInputError>
                <input
                  type="date"
                  id="start"
                  placeholder="start"
                  {...register('start', { required })}
                />
              </FormInputError>{' '}
              <Label required htmlFor="end">
                Do
              </Label>{' '}
              <FormInputError>
                <input
                  type="date"
                  id="end"
                  placeholder="end"
                  {...register('end', { required })}
                />
              </FormInputError>
            </InlineSection>
          </FormSection>
          <FormSection header="Zobrazit na webu">
            <InlineSection>
              <Label required htmlFor="on_web_start">
                Od
              </Label>{' '}
              <FormInputError>
                <input
                  type="date"
                  id="on_web_start"
                  placeholder="onWebStart"
                  {...register('on_web_start', { required })}
                />
              </FormInputError>{' '}
              <Label required htmlFor="on_web_end">
                Do
              </Label>{' '}
              <FormInputError>
                <input
                  type="date"
                  id="on_web_end"
                  placeholder="onWebEnd"
                  {...register('on_web_end', { required })}
                />
              </FormInputError>
            </InlineSection>
          </FormSection>
          <FormSection header="Místo konání" required>
            Lokalita
            <FormInputError>
              <Controller
                name="location"
                control={control}
                rules={{ required }}
                render={({ field }) => <SelectLocation {...field} />}
              />
            </FormInputError>
          </FormSection>
          <FullSizeElement>
            <FormSection header="Popis">
              <FullSizeElement>
                <FormSubheader required>Představení příležitosti</FormSubheader>
                <InfoBox>
                  Krátce vysvětli význam činnosti a její přínos, aby přilákala
                  zájemce.
                </InfoBox>
                <FormInputError isBlock>
                  <Controller
                    name="introduction"
                    control={control}
                    rules={{
                      required,
                      validate: {
                        required: htmlRequired(required),
                      },
                    }}
                    render={({ field }) => <RichTextEditor {...field} />}
                  />
                </FormInputError>
              </FullSizeElement>
              <FullSizeElement>
                <FormSubheader required>Popis činnosti</FormSubheader>
                <InfoBox>
                  Přibliž konkrétní činnosti a aktivity, které budou součástí
                  příležitosti.
                </InfoBox>
                <FormInputError isBlock>
                  <Controller
                    name="description"
                    control={control}
                    rules={{
                      required,
                      validate: {
                        required: htmlRequired(required),
                      },
                    }}
                    render={({ field }) => <RichTextEditor {...field} />}
                  />
                </FormInputError>
              </FullSizeElement>
              <FullSizeElement>
                <FormSubheader required={!isCollaboration}>
                  Přínos pro lokalitu
                </FormSubheader>
                {/*u typu “spolupráce” nepovinná, u ostatních typů povinná*/}
                <InfoBox>Popiš dopad a přínos činnosti pro dané místo.</InfoBox>
                {/*nebude u spolupráce*/}
                <FormInputError isBlock>
                  <Controller
                    name="location_benefits"
                    control={control}
                    rules={{
                      required: !isCollaboration && required,
                      validate: {
                        required: htmlRequired(!isCollaboration && required),
                      },
                    }}
                    render={({ field }) => <RichTextEditor {...field} />}
                  />
                </FormInputError>
              </FullSizeElement>
              <FullSizeElement>
                <FormSubheader required>Co mi to přinese?</FormSubheader>
                <InfoBox>
                  Uveď konkrétní osobní přínos do života z realizace této
                  příležitosti.
                </InfoBox>
                <FormInputError isBlock>
                  <Controller
                    name="personal_benefits"
                    control={control}
                    rules={{
                      required,
                      validate: {
                        required: htmlRequired(required),
                      },
                    }}
                    render={({ field }) => <RichTextEditor {...field} />}
                  />
                </FormInputError>
              </FullSizeElement>
              <FullSizeElement>
                <FormSubheader>Co potřebuji ke spolupráci</FormSubheader>
                <InfoBox>
                  Napiš dovednosti, zkušenosti či vybavení potřebné k zapojení
                  do příležitosti.
                </InfoBox>
                {/* optional */}
                <FormInputError isBlock>
                  <Controller
                    name="requirements"
                    control={control}
                    render={({ field }) => <RichTextEditor {...field} />}
                  />
                </FormInputError>
              </FullSizeElement>
            </FormSection>
          </FullSizeElement>
          <FormSection header="Fotka příležitosti" required>
            <FormInputError>
              <ImageUpload name="image" required />
            </FormInputError>
          </FormSection>
          <FormSection
            header="Kontaktní osoba"
            help="Pokud necháš kontaktní údaje prázdné, použije se Tvé jméno/email/telefon."
          >
            <InlineSection>
              <Label htmlFor="contact_name">Jméno kontaktní osoby</Label>{' '}
              <FormInputError>
                <input
                  type="text"
                  id="contact_name"
                  {...register('contact_name')}
                  placeholder={
                    defaultContactPerson &&
                    (defaultContactPerson.nickname
                      ? `${defaultContactPerson.nickname} (${defaultContactPerson.first_name} ${defaultContactPerson.last_name})`
                      : `${defaultContactPerson.first_name} ${defaultContactPerson.last_name}`)
                  }
                />
              </FormInputError>
            </InlineSection>
            <InlineSection>
              <Label htmlFor="contact_email">Kontaktní email</Label>{' '}
              <FormInputError>
                <input
                  type="email"
                  id="contact_email"
                  placeholder={defaultContactPerson?.email ?? undefined}
                  {...register('contact_email')}
                />
              </FormInputError>
            </InlineSection>
            <InlineSection>
              <Label htmlFor="contact_phone">Kontaktní telefon</Label>{' '}
              <FormInputError>
                <input
                  type="tel"
                  id="contact_phone"
                  {...register('contact_phone')}
                  placeholder={defaultContactPerson?.phone}
                />
              </FormInputError>
            </InlineSection>
          </FormSection>
          <Actions>
            <Button light className={styles.cancelAction} type="reset">
              Zrušit
            </Button>
            <Button success className={styles.mainAction} type="submit">
              {isUpdate ? 'Uložit změny' : 'Přidat příležitost'}
            </Button>
          </Actions>
        </FormSectionGroup>
      </form>
    </FormProvider>
  )
}
