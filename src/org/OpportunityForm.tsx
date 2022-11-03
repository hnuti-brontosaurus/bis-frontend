import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { api, OpportunityPayload } from '../app/services/bis'
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
import { getIdBySlug } from '../utils/helpers'
import { required } from '../utils/validationMessages'
import styles from './OpportunityForm.module.scss'

const categoryIcons = {
  organizing: OrganizerIcon,
  collaboration: HandsIcon,
  location_help: HousesIcon,
} as const

type OpportunityCategorySlug = keyof typeof categoryIcons

const OpportunityForm = ({
  initialData,
  onSubmit,
  onCancel,
  isUpdate,
}: {
  initialData?: Partial<OpportunityPayload>
  onSubmit: (data: OpportunityPayload) => void
  onCancel: () => void
  isUpdate?: boolean
}) => {
  // hack to select initial category correctly (id has to be string when using register)
  if (initialData?.category) {
    initialData.category = String(initialData.category) as unknown as number
  }

  const methods = useForm<OpportunityPayload>({
    defaultValues: initialData,
  })
  const { register, handleSubmit, watch, trigger, formState } = methods

  const { data: opportunityCategories } =
    api.endpoints.readOpportunityCategories.useQuery({
      page: 1,
      pageSize: 1000,
    })

  const categoriesList = opportunityCategories?.results
  const handleFormSubmit = handleSubmit(data => {
    onSubmit(data)
  })

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
      <form onSubmit={handleFormSubmit}>
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
            {/*TODO: this input is just a placeholder for something better*/}
            <FormInputError>
              <input {...register('location', { required })} />
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
                  <textarea
                    placeholder="introduction"
                    {...register('introduction', { required })}
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
                  <textarea
                    placeholder="description"
                    {...register('description', {
                      required,
                    })}
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
                  <textarea
                    placeholder="location_benefits"
                    {...register('location_benefits', {
                      required: !isCollaboration && required,
                    })}
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
                  <textarea
                    placeholder="personal_benefits"
                    {...register('personal_benefits', { required })}
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
                  <textarea
                    placeholder="requirements"
                    {...register('requirements')}
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
            <button
              className={styles.cancelAction}
              type="button"
              onClick={onCancel}
            >
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
