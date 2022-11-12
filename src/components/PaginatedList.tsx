import classNames from 'classnames'
import { FC } from 'react'
import { useSearchParamsState } from '../hooks/searchParamsState'
import styles from './PaginatedList.module.scss'
import Pagination from './Pagination'

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
    <div className={classNames(styles.container, className)}>
      <Table data={tableData} />
      <Pagination
        page={page}
        pages={Math.ceil((data.length as number) / pageSize)}
        onPageChange={setPage}
      />
    </div>
  )
}
