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
    `filename=${filename.substring(0, filename.lastIndexOf('.')) || filename}`,
    ...rest,
  ].join(';')
}
