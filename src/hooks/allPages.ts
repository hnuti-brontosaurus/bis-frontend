import { ApiEndpointQuery } from '@reduxjs/toolkit/dist/query/core/module'
import { QueryHooks } from '@reduxjs/toolkit/dist/query/react/buildHooks'
import { EndpointDefinitions, QueryDefinition } from '@reduxjs/toolkit/query'
import { useEffect, useState } from 'react'
import { PaginatedList } from '../app/services/bis'
import { AdministrationUnit } from '../app/services/bisTypes'

export function useAllPages<
  Q extends QueryDefinition<
    { page: number },
    any,
    any,
    PaginatedList<any>,
    any
  >,
  D extends EndpointDefinitions,
>(
  query: ApiEndpointQuery<Q, D> & QueryHooks<Q>,
  params: Parameters<typeof query['initiate']>[0][] = [], //TODO this is broken
) {
  const [getStuff, status] = query.useLazyQuery()

  const [stuff, setStuff] = useState<AdministrationUnit[]>([])
  const [isFinished, setIsFinished] = useState(false)

  useEffect(() => {
    ;(async () => {
      let isNext = true
      let i = 1
      setStuff([])
      while (isNext) {
        const data = await getStuff({ page: i++ } as any, true).unwrap()
        const results = data.results ?? []
        isNext = Boolean(data.next)
        setStuff(stuff =>
          [...stuff, ...results].filter(
            (item, i, all) => all.findIndex(a => a.id === item.id) === i,
          ),
        )
      }
      setIsFinished(true)
    })()
  }, [getStuff])

  return [stuff, status, isFinished] as const
}
