import { FC, useEffect } from 'react'
import { useForm } from 'react-hook-form'

const Pagination: FC<{
  page: number
  pages: number
  onPageChange: (next: number) => void
}> = ({ page, pages, onPageChange }) => {
  const { register, handleSubmit } = useForm<{
    page: number
  }>()

  const handleFormSubmit = handleSubmit(({ page }) => {
    onPageChange(page)
  })

  useEffect(() => {})

  if (pages <= 1) return null

  return (
    <>
      {page} {pages}
      <form onSubmit={handleFormSubmit}>
        <input
          type="number"
          {...register('page', {
            required: true,
            min: 1,
            max: pages,
          })}
        />
        <input type="submit" value="běž" />
      </form>
    </>
  )
}

export default Pagination
