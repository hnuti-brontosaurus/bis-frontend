import { merge } from 'lodash'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Overwrite } from 'utility-types'
import { api, UserPayload } from '../app/services/bis'
import { User } from '../app/services/testApi'
import { Button } from '../components/Button'
import FormInputError from '../components/FormInputError'
import {
  Actions,
  FormSection,
  FormSubsection,
  InlineSection,
  Label,
} from '../components/FormLayout'
import Loading from '../components/Loading'
import { useShowMessage } from '../features/systemMessage/useSystemMessage'
import { useCurrentUser } from '../hooks/currentUser'
import styles from './ViewProfile.module.scss'

type UserForm = Overwrite<User, { sex: number }>

const data2form = (user: User): UserForm => {
  return merge({}, user, { sex: user.sex ? user.sex.id : 0 })
}

const form2payload = (data: UserForm): Partial<UserPayload> => {
  return merge({}, data, { sex: Number(data.sex) || null })
}

const EditProfile = () => {
  const { user } = useOutletContext<{ user: User }>()
  const { data: currentUser } = useCurrentUser()
  const navigate = useNavigate()

  const showMessage = useShowMessage()

  const [isSaving, setIsSaving] = useState(false)

  // fetch data for form
  const { data: sexes } = api.endpoints.readSexes.useQuery({})

  const [updateUser] = api.endpoints.updateUser.useMutation()

  const methods = useForm<UserForm>({ defaultValues: data2form(user) })
  const { register } = methods

  const handleSubmit = methods.handleSubmit(async data => {
    try {
      setIsSaving(true)
      await updateUser({
        id: user.id,
        patchedUser: form2payload(data),
      }).unwrap()
      showMessage({ type: 'success', message: 'Změny byly úspěšně uloženy' })
      navigate('..')
    } catch (error) {
      showMessage({ type: 'error', message: 'Něco se nepovedlo' })
    } finally {
      setIsSaving(false)
    }
  })

  if (!sexes) return <Loading>Připravujeme formulář</Loading>

  if (isSaving) return <Loading>Ukládáme změny</Loading>

  return (
    <div>
      <header className={styles.header}>
        {currentUser?.id === user.id
          ? 'Upravit můj profil'
          : `Upravit profil uživatele ${user.display_name}`}
      </header>
      <form onSubmit={handleSubmit}>
        <FormProvider {...methods}>
          <FormSection>
            <FormSubsection header="Osobní údaje">
              <InlineSection>
                <Label>Jméno</Label>
                <FormInputError>
                  <input type="text" {...register('first_name')} />
                </FormInputError>
              </InlineSection>
              <InlineSection>
                <Label>Příjmení</Label>
                <FormInputError>
                  <input type="text" {...register('last_name')} />
                </FormInputError>
              </InlineSection>
              <InlineSection>
                <Label>Přezdívka</Label>
                <FormInputError>
                  <input type="text" {...register('nickname')} />
                </FormInputError>
              </InlineSection>
              <InlineSection>
                <Label>Datum narození</Label>
                <FormInputError>
                  <input type="text" {...register('birthday')} />
                </FormInputError>
              </InlineSection>
              <InlineSection>
                <Label>Pohlaví</Label>
                <FormInputError>
                  <select {...register('sex')}>
                    <option value={0}>Neuvedeno</option>
                    {sexes.results.map(sex => (
                      <option key={sex.slug} value={sex.id}>
                        {sex.name}
                      </option>
                    ))}
                  </select>
                </FormInputError>
              </InlineSection>
            </FormSubsection>
            <FormSubsection header="Kontaktní údaje">
              telefon, emaily, adresa, kontaktní adresa
            </FormSubsection>
            <FormSubsection header="Blízká osoba">asdf</FormSubsection>
          </FormSection>
          <Actions>
            <Button type="reset">Zrušit</Button>
            <Button success type="submit">
              Uložit
            </Button>
          </Actions>
        </FormProvider>
      </form>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}

export default EditProfile
