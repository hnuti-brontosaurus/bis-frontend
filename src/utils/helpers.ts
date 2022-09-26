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
