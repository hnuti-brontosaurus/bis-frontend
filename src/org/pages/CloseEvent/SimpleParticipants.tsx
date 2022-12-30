import { EventContact } from 'app/services/bisTypes'
import { Button, FormInputError, InlineSection } from 'components'
import { ChangeEventHandler } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { FaTrash } from 'react-icons/fa'
import { normalizeKeys } from 'utils/helpers'
import * as validationMessages from 'utils/validationMessages'
import * as xlsx from 'xlsx'
import type { ParticipantsStepFormShape } from './CloseEventForm'

export const SimpleParticipants = () => {
  const { control, register } = useFormContext<ParticipantsStepFormShape>()
  const peopleFields = useFieldArray({ control, name: 'record.contacts' })
  const handleUpload: ChangeEventHandler<HTMLInputElement> = e => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.readAsBinaryString(file)
      reader.onload = () => {
        const wb = xlsx.read(reader.result, { type: 'binary' })
        const json = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
        const normalizedJson = json.map(entry =>
          normalizeKeys<EventContact>(entry as { [key: string]: string }, {
            first_name: ['jméno', 'first-name', 'first_name', 'given_name'],
            last_name: ['příjmení', 'last-name', 'last_name', 'family_name'],
            email: ['email', 'e-mail', 'mail'],
            phone: ['telefon', 'phone', 'mobil'],
          }),
        )
        peopleFields.append(normalizedJson)
      }
    }
  }
  return (
    <div>
      <Button
        type="button"
        onClick={() =>
          peopleFields.prepend({
            first_name: '',
            last_name: '',
          })
        }
      >
        Přidat
      </Button>
      <input type="file" onChange={handleUpload} />
      <ul>
        {peopleFields.fields.map((item, i) => (
          <li key={item.id}>
            <InlineSection>
              <FormInputError>
                <input
                  type="text"
                  placeholder="Jméno*"
                  {...register(`record.contacts.${i}.first_name` as const, {
                    required: validationMessages.required,
                  })}
                />
              </FormInputError>
              <FormInputError>
                <input
                  type="text"
                  placeholder="Příjmení*"
                  {...register(`record.contacts.${i}.last_name` as const, {
                    required: validationMessages.required,
                  })}
                />
              </FormInputError>
              <FormInputError>
                <input
                  type="email"
                  placeholder="E-mail"
                  {...register(`record.contacts.${i}.email` as const)}
                />
              </FormInputError>
              <FormInputError>
                <input
                  type="tel"
                  placeholder="Telefon"
                  {...register(`record.contacts.${i}.phone` as const)}
                />
              </FormInputError>
              <Button type="button" onClick={() => peopleFields.remove(i)}>
                <FaTrash />
              </Button>
            </InlineSection>
          </li>
        ))}
      </ul>
    </div>
  )
}
