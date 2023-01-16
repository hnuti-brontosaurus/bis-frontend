import { Button } from 'components'
import React, { Suspense } from 'react'

const QualificationGuideDownload = React.lazy(
  () => import('./QualificationGuideDownload'),
)

export const QualificationGuide = () => {
  return (
    <div>
      <header>Jakou kvalifikaci musí mít hlavní organizátor/ka?</header>
      <Suspense
        fallback={
          <Button secondary isLoading>
            Číst průvodce
          </Button>
        }
      >
        <QualificationGuideDownload>Číst průvodce</QualificationGuideDownload>
      </Suspense>
    </div>
  )
}
