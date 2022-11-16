import merge from 'lodash/merge'
import { FormEventHandler, useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { Overwrite } from 'utility-types'
import { api, CorrectLocation, OpportunityPayload } from '../app/services/bis'
import { ReactComponent as HandsIcon } from '../assets/hands.svg'
import { ReactComponent as HousesIcon } from '../assets/houses.svg'
import { ReactComponent as OrganizerIcon } from '../assets/organizer.svg'
import FormInputError from '../components/FormInputError'
import {
  FormSection,
  FormSubheader,
  FormSubsection,
  FullSizeElement,
  InfoBox,
  Label,
} from '../components/FormLayout'
import { IconSelect, IconSelectGroup } from '../components/IconSelect'
import { ImageUpload } from '../components/ImageUpload'
import RichTextEditor, { htmlRequired } from '../components/RichTextEditor'
import SelectLocation, { NewLocation } from '../components/SelectLocation'
import {
  useClearPersistentForm,
  usePersistentFormData,
  usePersistForm,
} from '../hooks/persistForm'
import { getIdBySlug } from '../utils/helpers'
import { required } from '../utils/validationMessages'
import styles from './OpportunityForm.module.scss'

const categoryIcons = {
  organizing: OrganizerIcon,
  collaboration: HandsIcon,
  location_help: HousesIcon,
} as const

type OpportunityCategorySlug = keyof typeof categoryIcons

export type OpportunityFormShape = Overwrite<
  OpportunityPayload,
  {
    location: NewLocation | Pick<CorrectLocation, 'id'>
  }
>

const OpportunityForm = ({
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

  const methods = useForm<OpportunityFormShape>({
    defaultValues: merge({}, initialData, savedData),
  })
  const { register, control, handleSubmit, watch, trigger, formState } = methods

  usePersistForm('opportunity', id, watch)

  const { data: opportunityCategories } =
    api.endpoints.readOpportunityCategories.useQuery({
      page: 1,
      pageSize: 1000,
    })

  const cancelPersist = useClearPersistentForm('opportunity', id)

  const categoriesList = opportunityCategories?.results
  const handleFormSubmit = handleSubmit(async data => {
    await onSubmit(data)
    cancelPersist()
  })

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
      {/* Čeho se tvá příležitost k zapojení týká? *
Organizování akcí
Příležitosti organizovat či pomáhat s pořádáním našich akcí.
SpolupráceBude tam hodně konkrétní činnosti a aktivity
        Příležitosti ke spolupráci na chodu a rozvoji Hnutí Brontosaurus.
Pomoc lokalitě
Příležitosti k pomoci dané lokalitě, která to aktuálně potřebuje.


Kontaktní osoba *
Kontaktní email *
Kontaktní telefon - nepovinné
Fotka příležitosti *
*/}
      <form onSubmit={handleFormSubmit} onReset={handleFormReset}>
        <FormSection>
          <FormSubsection
            required
            header={
              isUpdate
                ? 'Jaký je typ příležitosti?'
                : 'Jaký je typ nové příležitosti?'
            }
          >
            {/*
Čeho se tvá příležitost k zapojení týká? *
Organizování akcí
Příležitosti organizovat či pomáhat s pořádáním našich akcí.
Spolupráce
Příležitosti ke spolupráci na chodu a rozvoji Hnutí Brontosaurus.
Pomoc lokalitě
Příležitosti k pomoci dané lokalitě, která to aktuálně potřebuje.*/}
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
                        icon={Icon}
                        value={category.id}
                        {...register('category', { required })}
                      />
                    )
                  })}
              </IconSelectGroup>
            </FormInputError>
          </FormSubsection>
          <FormSubsection header="Název" required>
            <FormInputError>
              <input
                type="text"
                placeholder="name"
                {...register('name', { required })}
              />
            </FormInputError>
          </FormSubsection>
          <FormSubsection header="Datum">
            <div>
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
            </div>
          </FormSubsection>
          <FormSubsection header="Zobrazit na webu">
            <div>
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
            </div>
          </FormSubsection>
          <FormSubsection header="Místo konání" required>
            Lokalita
            <FormInputError>
              <Controller
                name="location"
                control={control}
                rules={{ required }}
                render={({ field }) => <SelectLocation {...field} />}
              />
            </FormInputError>
          </FormSubsection>
          <FullSizeElement>
            <FormSubsection header="Popis">
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
                    render={({ field }) => (
                      <RichTextEditor placeholder="introduction" {...field} />
                    )}
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
                    render={({ field }) => (
                      <RichTextEditor placeholder="description" {...field} />
                    )}
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
                    render={({ field }) => (
                      <RichTextEditor
                        placeholder="location_benefits"
                        {...field}
                      />
                    )}
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
                    render={({ field }) => (
                      <RichTextEditor
                        placeholder="personal_benefits"
                        {...field}
                      />
                    )}
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
                    render={({ field }) => (
                      <RichTextEditor placeholder="requirements" {...field} />
                    )}
                  />
                </FormInputError>
              </FullSizeElement>
            </FormSubsection>
          </FullSizeElement>
          <FormSubsection header="Fotka příležitosti" required>
            <FormInputError>
              <ImageUpload name="image" required />
            </FormInputError>
          </FormSubsection>
          <FormSubsection header="Kontaktní osoba">
            <div>
              <Label required htmlFor="contact_name">
                Jméno kontaktní osoby
              </Label>{' '}
              <FormInputError>
                <input
                  type="text"
                  id="contact_name"
                  placeholder="Jana Nováková"
                  {...register('contact_name', { required })}
                />
              </FormInputError>
            </div>
            <div>
              <Label required htmlFor="contact_email">
                Kontaktní email
              </Label>{' '}
              <FormInputError>
                <input
                  type="email"
                  id="contact_email"
                  placeholder="jana.novakova@example.com"
                  {...register('contact_email', { required })}
                />
              </FormInputError>
            </div>
            <div>
              <Label htmlFor="contact_phone">Kontaktní telefon</Label>{' '}
              <FormInputError>
                <input
                  type="tel"
                  id="contact_phone"
                  {...register('contact_phone')}
                />
              </FormInputError>
            </div>
          </FormSubsection>
          <div className={styles.actions}>
            <button className={styles.cancelAction} type="reset">
              Zrušit
            </button>
            <input
              className={styles.mainAction}
              type="submit"
              value={isUpdate ? 'Uložit změny' : 'Přidat příležitost'}
            />
          </div>
        </FormSection>
      </form>
    </FormProvider>
  )
}

export default OpportunityForm
