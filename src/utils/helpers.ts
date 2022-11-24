import isEmpty from 'lodash/isEmpty'
import padStart from 'lodash/padStart'
import { FieldErrorsImpl, FieldValues, UseFormReturn } from 'react-hook-form'
import { Event, User } from '../app/services/testApi'

export function getIdBySlug<S extends string>(
  objects: { id: number; slug: S }[],
  slug: S,
): number {
  return objects.find(obj => obj.slug === slug)?.id ?? -1
}
export function getIdsBySlugs<S extends string>(
  objects: { id: number; slug: S }[],
  slugs: S[],
): number[] {
  return slugs.map(slug => getIdBySlug(objects, slug))
}

export const requireBoolean = {
  validate: (value: boolean | null | undefined) => {
    return value === true || value === false || 'Toto pole je povinné!'
  },
}

export const file2base64 = async (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      resolve(addFilename(reader.result as string, file.name))
    }
    reader.onerror = e => reject(e)
  })

const addFilename = (url: string, filename: string) => {
  const [data, ...rest] = url.split(';')
  return [
    data,
    `filename=${getFilenameWithoutExtension(filename)}`,
    ...rest,
  ].join(';')
}

const getFilenameFromUrl = (url: string): string =>
  url.split('/').pop() as string

const getFilenameWithoutExtension = (filename: string): string =>
  filename.substring(0, filename.lastIndexOf('.')) || filename

/*
https://stackoverflow.com/a/20285053

fetch image and convert it to base64
*/
export const toDataURL = async (url: string): Promise<string> => {
  const response = await fetch(
    process.env.REACT_APP_CORS_PROXY
      ? process.env.REACT_APP_CORS_PROXY + url
      : url,
  )
  const blob = await response.blob()
  const dataURL = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })

  return addFilename(
    dataURL,
    getFilenameWithoutExtension(getFilenameFromUrl(url)),
  )
}

/**
 * get event status
 * draft - event is going to be edited
 * open - event is ready to be advertised, in progress, and not finished
 * finished - event has finished, and its record is filled
 * closed - too much time has passed and the event can only be viewed
 *
 * TODO this is unfinished. We don't have info about draft and finished
 */
export const getEventStatus = (
  event: Event,
): 'draft' | 'inProgress' | 'finished' | 'closed' => {
  if (shouldBeFinishedUntil(event) < Date.now()) return 'closed'
  if (event.record) return 'finished'
  return 'inProgress'
}

// event should be finished until February next year
const shouldBeFinishedUntil = (event: Event): number => {
  const eventEnd = new Date(event.end)
  eventEnd.getFullYear()

  let finishUntil = new Date(0)
  finishUntil.setFullYear(eventEnd.getFullYear() + 1)
  finishUntil.setMonth(1) // this means February (months are zero-based)
  finishUntil.setDate(1)

  return finishUntil.getTime()
}

export const isOrganizer = (user: Pick<User, 'roles'>): boolean =>
  Boolean(user.roles.find(role => ['organizer', 'admin'].includes(role.slug)))

export const splitDateTime = (datetime: string): [string, string] => {
  const [date] = datetime.split('T')
  const d = new Date(datetime)
  const time = `${padStart(String(d.getHours()), 2, '0')}:${padStart(
    String(d.getMinutes()),
    2,
    '0',
  )}`
  return [date, time]
}

export const joinDateTime = (date: string, time: string = ''): string => {
  const [rawHours, rawMinutes] = time.split(':')
  const ddRegexp = /^\d\d$/
  const hours = ddRegexp.test(rawHours) ? rawHours : '00'
  const minutes = ddRegexp.test(rawMinutes) ? rawMinutes : '00'

  return `${date}T${hours}:${minutes}`
}

// A little function which prepares react-hook-forms errors for stringifying
// in particular, it removes circular references caused by error.ref
export const pickErrors = (errors: FieldErrorsImpl) => {
  if ('message' in errors && typeof errors.message === 'string') {
    delete errors.ref
  } else {
    for (const key in errors) {
      if (key in errors) {
        pickErrors(errors[key] as any)
      }
    }
  }
  return errors
}

export const hasFormError = <T extends FieldValues>(
  methods: UseFormReturn<T>,
): boolean => !isEmpty(methods.formState.errors)

/**
 * Take array of strings and return string
 * element0, element1, element2, element3 a element4
 */
export const joinAnd = (values: string[]): string => {
  const formatter = new Intl.ListFormat('cs', {
    style: 'long',
    type: 'conjunction',
  })
  return formatter.format(values)
}

/**
 * Make nicely formatted date range
 * i.e. don't repeat year and month and day when it's the same
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatRange
 */
export const formatDateRange = (startDate: string, endDate: string) => {
  const dateTimeFormat = new Intl.DateTimeFormat('cs', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  return dateTimeFormat.formatRange(new Date(startDate), new Date(endDate))
}

export const formatDateTime = (datetime: string): string => {
  const dateTimeFormat = new Intl.DateTimeFormat('cs', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })

  return dateTimeFormat.format(new Date(datetime))
}
