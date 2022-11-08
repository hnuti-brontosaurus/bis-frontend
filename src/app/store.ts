import {
  Action,
  combineReducers,
  configureStore,
  createListenerMiddleware,
  Reducer,
  ThunkAction,
} from '@reduxjs/toolkit'
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import authReducer from '../features/auth/authSlice'
import formReducer from '../features/form/formSlice'
import systemMessageReducer from '../features/systemMessage/systemMessageSlice'
import uiReducer from '../features/ui/uiSlice'
import { api } from './services/bis'
// import { emptySplitApi } from './services/emptyApi'

const persistConfig = {
  key: 'auth',
  version: 1,
  storage,
}

const listenerMiddleware = createListenerMiddleware()

listenerMiddleware.startListening({
  matcher: api.endpoints.logout.matchFulfilled,
  effect: async (action, listenerApi) => {
    await resetStore()
  },
})

const persistedAuthReducer = persistReducer(persistConfig, authReducer)
const persistedFormReducer = persistReducer(
  { ...persistConfig, key: 'form' },
  formReducer,
)

const appReducer = combineReducers({
  // [emptySplitApi.reducerPath]: emptySplitApi.reducer,
  [api.reducerPath]: api.reducer,
  auth: persistedAuthReducer,
  ui: uiReducer,
  systemMessage: systemMessageReducer,
  form: persistedFormReducer,
})

const rootReducer: Reducer<RootState> = (state, action) => {
  if (api.endpoints.logout.matchFulfilled(action)) {
    state = {} as RootState
  }

  return appReducer(state, action)
}

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .prepend(listenerMiddleware.middleware)
      .concat(api.middleware),
})

export const persistor = persistStore(store)

export const resetStore = async () => {
  await persistor.purge()
  await persistor.flush()
}

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof appReducer>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
