import { yupResolver } from '@hookform/resolvers/yup'
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query'
import { FC } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { User, UserSearch } from '../../../../app/services/testApi'
import BirthdayInput, {
  birthdayValidation,
} from '../../../../components/BirthdayInput'
import { Button } from '../../../../components/Button'
import ErrorBox, { ObjectWithStrings } from '../../../../components/ErrorBox'
import FormInputError from '../../../../components/FormInputError'
import { InlineSection, Label } from '../../../../components/FormLayout'
import Loading from '../../../../components/Loading'
import styles from './NewApplicationModal.module.scss'

const validationSchemaBirthdate = yup.object().shape({
  birthday: birthdayValidation.required('povinne'),
})

interface IBirthdayInputCheck {
  defaultBirthday?: string | null
  onSubmitBD: (a: any, b: any) => void
  result: UserSearch
  erroredSearchId: string | undefined
  inlineUserError: any
  retrievedUser: User | null | undefined
  retrievedUserIsUsed: boolean
  setCheckAndAdd: (arg: boolean) => void
  isSavingEventApplication: boolean
}

const BirthdayInputCheck: FC<IBirthdayInputCheck> = ({
  defaultBirthday,
  onSubmitBD,
  result,
  erroredSearchId,
  inlineUserError,
  retrievedUser,
  retrievedUserIsUsed,
  setCheckAndAdd,
  isSavingEventApplication,
}) => {
  const methodsBirthdate = useForm<{ birthday: string }>({
    resolver: yupResolver(validationSchemaBirthdate),
    defaultValues: {
      birthday: defaultBirthday || '',
    },
  })

  const {
    control: controlBirthdate,
    handleSubmit: handleSubmitBirthdate,
    formState: { errors: errorsBirthdate },
  } = methodsBirthdate

  return (
    <form
      onSubmit={handleSubmitBirthdate(data =>
        onSubmitBD(data, {
          ...result,
          searchId: result._search_id,
        }),
      )}
    >
      <InlineSection>
        <Label required>Datum narození</Label>
        <FormInputError>
          <Controller
            control={controlBirthdate}
            name="birthday"
            render={({ field }) => <BirthdayInput {...field} />}
          />
        </FormInputError>
      </InlineSection>
      {erroredSearchId === result._search_id && (
        <ErrorBox
          // TODO: move this handling to errorbox
          error={
            (inlineUserError &&
              (inlineUserError as FetchBaseQueryError)
                .data) as ObjectWithStrings
          }
        />
      )}

      {!(
        retrievedUser &&
        retrievedUser._search_id === result._search_id &&
        retrievedUserIsUsed
      ) && (
        <Button
          className={styles.birthsdayButton}
          plain
          type="submit"
          onClick={() => setCheckAndAdd(true)}
        >
          zkontroluj a přidej{' '}
        </Button>
      )}
      {retrievedUser &&
      retrievedUser._search_id === result._search_id &&
      retrievedUserIsUsed ? (
        !isSavingEventApplication ? (
          <Button className={styles.birthsdayButton} plain type="submit">
            přidej k účastníkům
          </Button>
        ) : (
          <Loading>...</Loading>
        )
      ) : (
        <Button className={styles.birthsdayButton} plain type="submit">
          zkontroluj
        </Button>
      )}
    </form>
  )
}

export default BirthdayInputCheck