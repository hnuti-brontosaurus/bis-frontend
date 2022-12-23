import { get } from 'lodash'
import type { FieldErrorsImpl, FieldValues } from 'react-hook-form'
import { pickErrors } from './helpers'

export type ModelTranslations = Readonly<{
  [key: string]: string | Readonly<string[]> | ModelTranslations | undefined
  _name?: string
  _name_plural?: string
}>

export type GenericTranslations = { [key: string]: string }

const getFieldName = (
  path: string,
  fieldNames: ModelTranslations,
  genericNames: GenericTranslations,
): string => {
  // try to get translation from model
  const model = get(fieldNames, path)
  // try to get translation from generic translations
  const generic = get(genericNames, path.split('.').pop() as string)
  // prefer model translation, then generic, and last raw path
  if (typeof model === 'string') return model
  else if (Array.isArray(model)) return model[0]
  else return generic ?? path
}

export const validationErrors2Message = <FormShape extends FieldValues>(
  errors: FieldErrorsImpl<FormShape>,
  fieldNames: ModelTranslations = {},
  genericNames: GenericTranslations = {},
): string => {
  const namesWithMessages = getErrorPaths(
    pickErrors(errors) as NestedObject,
  ).map(path => [
    getFieldName(path, fieldNames, genericNames),
    get(errors, [path, 'message'].join('.')),
  ])

  let output = ''

  namesWithMessages.forEach(([name, message]) => {
    output += `${name}: ${message}\n`
  })

  return output
}

type NestedObject =
  | {
      [key: string]: NestedObject | number | string
    }
  | (number | string)[]

export const getObjectPaths = <O extends NestedObject>(obj: O): string[] =>
  Object.entries(obj)
    .map(([key, value]) => {
      if (typeof value === 'object')
        return getObjectPaths(value).map(path => `${key}.${path}`)
      else return key
    })
    .flat()

export const getErrorPaths = <O extends NestedObject>(obj: O): string[] =>
  getObjectPaths(obj)
    .map(a => {
      const split = a.split('.')
      const last = split.pop()
      if (last === 'message') return split.join('.')
      else return ''
    })
    .filter(a => Boolean(a))
