import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import {
  BrowserRouter,
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import App from './App'
import { persistor, store } from './app/store'
import ErrorBoundaryFallback from './ErrorBoundaryFallback'
import './index.css'
import reportWebVitals from './reportWebVitals'

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      ),
    }),
  ],
  enabled:
    Boolean(process.env.REACT_APP_SENTRY_DSN) &&
    process.env.NODE_ENV !== 'development',
  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
})

const container = document.getElementById('root')!
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={ErrorBoundaryFallback}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
