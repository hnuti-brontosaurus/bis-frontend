import { Button, FormInputError, InlineSection } from 'components'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { FaTrash } from 'react-icons/fa'
import * as validationMessages from 'utils/validationMessages'
import type { ParticipantsStepFormShape } from './CloseEventForm'

export const SimpleParticipants = () => {
  const { control, register } = useFormContext<ParticipantsStepFormShape>()
  const peopleFields = useFieldArray({ control, name: 'record.contacts' })
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
                <input type="email" placeholder="E-mail" />
              </FormInputError>
              <FormInputError>
                <input type="tel" placeholder="Telefon" />
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
