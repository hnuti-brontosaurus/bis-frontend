// https://docs.sentry.io/platforms/javascript/guides/react/components/errorboundary/#setting-a-fallback-function-render-props

import * as Sentry from '@sentry/react'

const ErrorBoundaryFallback: Sentry.FallbackRender = ({
  error,
  componentStack,
  resetError,
}) => (
  <>
    <div>You have encountered an error</div>
    <div>{error.toString()}</div>
    <div>{componentStack}</div>
    <button
      onClick={() => {
        /* When resetError() is called it will remove the Fallback component
        and render the Sentry ErrorBoundary's children in their initial state */
        resetError()
      }}
    >
      Click here to reset!
    </button>
  </>
)

export default ErrorBoundaryFallback
