import { useEffect } from 'react'
import { UseFormWatch } from 'react-hook-form'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  actions,
  PersistentFormType,
  selectFormByTypeAndId,
} from '../features/form/formSlice'
import { useDebouncedDispatch } from '../hooks/debouncedDispatch'

export const usePersistentFormData = (type: PersistentFormType, id: string) => {
  const savedData = useAppSelector(state =>
    selectFormByTypeAndId(state, type, id),
  )
  return savedData
}

export const usePersistForm = (
  type: PersistentFormType,
  id: string,
  ...watches: UseFormWatch<any>[]
) => {
  const debouncedDispatch = useDebouncedDispatch()

  // whenever the form changes, save it to redux
  // this is to persist the form
  for (const watch of watches) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const subscription = watch((data, asdf) => {
        debouncedDispatch(
          actions.saveForm({
            id,
            type,
            data,
          }),
        )
      })

      return () => subscription.unsubscribe()
    }, [watch, debouncedDispatch, id, type])
  }
}

export const useClearPersistentForm = (
  type: PersistentFormType,
  id: string,
) => {
  const dispatch = useAppDispatch()
  const clear = () => {
    dispatch(
      actions.removeForm({
        id,
        type,
      }),
    )
  }

  return clear
}
