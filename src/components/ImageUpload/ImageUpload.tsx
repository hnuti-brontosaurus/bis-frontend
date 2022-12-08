import get from 'lodash/get'
import { ChangeEvent, forwardRef, useEffect, useState } from 'react'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { FaPencilAlt, FaPlus, FaTimes } from 'react-icons/fa'
import { file2base64 } from '../../utils/helpers'
import * as messages from '../../utils/validationMessages'
import styles from './ImageUpload.module.scss'

export const UncontrolledImageUpload = forwardRef<
  HTMLInputElement,
  {
    name: string
    value?: string
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
    onBlur: any
  }
>(({ name, value, onChange, onBlur }, ref) => {
  const [internalState, setInternalState] = useState<string>('')

  const actualValue = value ?? internalState
  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const value = file ? await file2base64(file) : ''
    setInternalState(value)
    onChange({ ...e, target: { ...e.target, value, type: 'text' } })
  }

  return (
    <label>
      <input
        // ref={ref}
        style={{ display: 'none' }}
        type="file"
        accept="image/*"
        name={name}
        onChange={handleChange}
      />
      {actualValue ? (
        <div className={styles.imageWrapper}>
          <img src={actualValue} alt="" className={styles.image} />
          <div className={styles.editOverlay}>
            <FaPencilAlt size={26} />
          </div>
        </div>
      ) : (
        <div className={styles.addButton}>
          <FaPlus size={26} />
        </div>
      )}
    </label>
  )
})

export const ImageUpload = ({
  name,
  required,
}: {
  name: string
  required?: boolean
}) => {
  const { control } = useFormContext()
  return (
    <Controller
      name={name}
      rules={{ required: required && messages.required }}
      control={control}
      render={({ field }) => <UncontrolledImageUpload {...field} />}
    />
  )
}

export const ImagesUpload = ({
  name,
  image = 'image',
}: {
  name: string
  image?: string
}) => {
  const { control, watch, getValues } = useFormContext()
  const imageFields = useFieldArray({
    control,
    name,
  })

  useEffect(() => {
    // when there is no empty image, add empty image (add button)
    // somehow, watch doesn't always trigger at the beginning, therefore we add it also here
    const values = getValues(name)
    if (
      !values ||
      values.length === 0 ||
      values.length ===
        (values as { [image: string]: string }[]).filter(obj =>
          Boolean(obj[image]),
        ).length
    )
      imageFields.append({ [image]: '' })
    // when images change, check that there is always one empty
    const subscription = watch((data /*, { name, type }*/) => {
      const values = get(data, name)
      if (
        !values ||
        values.length === 0 ||
        values.length ===
          (values as { [image: string]: string }[]).filter(obj =>
            Boolean(obj[image]),
          ).length
      )
        imageFields.append({ [image]: '' })
    })

    return () => subscription.unsubscribe()
  }, [watch, imageFields, getValues, name, image])

  return (
    <ul className={styles.imageList}>
      {imageFields.fields.map((item, index) => {
        return (
          <li key={item.id} className={styles.imageItem}>
            <Controller
              name={`${name}.${index}.${image}`}
              control={control}
              render={({ field }) => <UncontrolledImageUpload {...field} />}
            />
            {watch(`${name}.${index}.${image}`) && (
              <button
                className={styles.removeButton}
                type="button"
                onClick={() => imageFields.remove(index)}
              >
                <FaTimes />
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
