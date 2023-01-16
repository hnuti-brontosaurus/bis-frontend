import qualificationGuide from 'assets/Průvodce-kvalifikacemi.pdf'
import { ExternalButtonLink } from 'components'
import { ReactNode } from 'react'

export const QualificationGuideDownload = ({
  children,
}: {
  children: ReactNode
}) => {
  return (
    <ExternalButtonLink
      secondary
      target="_blank"
      rel="noopener noreferrer"
      href={qualificationGuide}
    >
      {children}
    </ExternalButtonLink>
  )
}

// export default to be able to lazy load
// eslint-disable-next-line import/no-default-export
export default QualificationGuideDownload
