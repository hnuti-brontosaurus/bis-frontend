import { get } from 'lodash'
import type { FieldErrorsImpl, FieldPath, FieldValues } from 'react-hook-form'
import { pickErrors } from './helpers'

export const formatValidationErrors = <FormShape extends FieldValues>(
  errors: FieldErrorsImpl<FormShape>,
  fieldNames: Partial<
    Record<FieldPath<FormShape>, string | Readonly<string[]>>
  > = {},
): string => {
  const pathsWithMessages = getErrorPaths(
    pickErrors(errors) as NestedObject,
  ).map(path => [get(fieldNames, path) ?? path, get(errors, [path, 'message'])])
  return JSON.stringify(pathsWithMessages, null, 2)
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
