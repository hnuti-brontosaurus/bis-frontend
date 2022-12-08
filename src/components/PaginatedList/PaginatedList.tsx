import classNames from 'classnames'
import { Pagination } from 'components'
import { useSearchParamsState } from 'hooks/searchParamsState'
import { FC } from 'react'

/**
 * It's unscalable, because we have to provide all the data at the beginning
 * So when there are many items to list, we have to download them all at once
 */
export const UnscalablePaginatedList = <T,>({
  data,
  table,
  className,
  pageSize = 10,
}: {
  data: T[]
  table: FC<{ data: T[] }>
  className?: string
  pageSize?: number
}) => {
  const [page, setPage] = useSearchParamsState('s', 1, Number)
  const Table = table

  const tableData = data.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className={classNames(className)}>
      <Table data={tableData} />
      <Pagination
        page={page}
        pages={Math.max(1, Math.ceil((data.length as number) / pageSize))}
        onPageChange={setPage}
      />
    </div>
  )
}
