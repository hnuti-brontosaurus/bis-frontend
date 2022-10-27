import { useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
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
import { useCurrentUser } from '../hooks/currentUser'
import { file2base64, getIdBySlug } from '../utils/helpers'
import styles from './CreateOpportunity.module.scss'

const required = 'Toto pole je povinné!'

const categoryIcons = {
  organizing: OrganizerIcon,
  collaboration: HandsIcon,
  location_help: HousesIcon,
} as const

type OpportunityCategorySlug = keyof typeof categoryIcons

const CreateOpportunity = () => {
  const { data: currentUser, isLoading: isCurrentUserLoading } =
    useCurrentUser()

  const navigate = useNavigate()

  const {
    data: opportunityCategories,
    isLoading: isReadingOpportunityCategories,
  } = api.endpoints.readOpportunityCategories.useQuery({
    page: 1,
    pageSize: 1000,
  })

  const categoriesList = opportunityCategories?.results

  const methods = useForm<OpportunityPayload>()
  const { register, handleSubmit, control, watch, trigger, formState } = methods

  const handleFormSubmit = handleSubmit(data => {
    const newData = {
      ...data,
      // TODO: pridat pridavani lokace
      location: 1223,
    }
    if (currentUser)
      createOpportunity({ userId: currentUser.id, opportunity: newData })
  })

  const handleCancel = () => {
    // TODO do whatever we need to do to clear the form, when it's persistent
    // perhaps also ask for a confirmation
    navigate('/org/prilezitosti')
  }

  const [createOpportunity, { isLoading: isSavingOpportunity }] =
    api.endpoints.createOpportunity.useMutation()

  const isCollaboration =
    opportunityCategories &&
    getIdBySlug(opportunityCategories.results, 'collaboration') ===
      +watch('category')

  // when switching to or from collaboration, and if form was already validated, revalidate form
  // in order to update error messages on location_benefits
  useEffect(() => {
    if (formState.isDirty) trigger('location_benefits')
  }, [isCollaboration, formState.isDirty, trigger])

  if (!opportunityCategories) return <>Loading</>

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Nová příležitost</h1>
      {/* Čeho se tvá příležitost k zapojení týká? *
Organizování akcí
Příležitosti organizovat či pomáhat s pořádáním našich akcí.
Spolupráce
        Příležitosti ke spolupráci na chodu a rozvoji Hnutí Brontosaurus.
Pomoc lokalitě
Příležitosti k pomoci dané lokalitě, která to aktuálně potřebuje.


Kontaktní osoba *
Kontaktní email *
Kontaktní telefon - nepovinné
Fotka příležitosti *
*/}
      <FormProvider {...methods}>
        <form onSubmit={handleFormSubmit}>
          <FormSection>
            <FormSubsection required header="Jaký je typ nové příležitosti?">
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
                  <FormSubheader required>
                    Představení příležitosti
                  </FormSubheader>
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
                  <InfoBox>
                    Popiš dopad a přínos činnosti pro dané místě.
                  </InfoBox>
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
              {/* TODO: copied code */}
              <FormInputError>
                <Controller
                  name="image"
                  rules={{ required }}
                  control={control}
                  render={({ field }) => (
                    <label>
                      <input
                        style={{ display: 'none' }}
                        type="file"
                        {...field}
                        value=""
                        onChange={async e => {
                          const file = e.target.files?.[0]
                          field.onChange(file ? await file2base64(file) : '')
                        }}
                      />
                      {watch('image') ? (
                        <img src={watch('image')} alt="" />
                      ) : (
                        <span>+</span>
                      )}
                    </label>
                  )}
                />
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
                onClick={handleCancel}
              >
                Zrušit
              </button>
              <input
                className={styles.mainAction}
                type="submit"
                value="Přidat příležitost"
              />
            </div>
          </FormSection>
        </form>
      </FormProvider>
    </div>
  )
}

export default CreateOpportunity
