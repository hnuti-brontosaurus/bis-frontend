import qualificationGuide from 'assets/Průvodce-kvalifikacemi.pdf'
import { ReactNode } from 'react'

export const QualificationGuideDownload = ({
  children,
}: {
  children: ReactNode
}) => {
  return (
    <a target="_blank" rel="noopener noreferrer" href={qualificationGuide}>
      {children}
    </a>
  )
}

// export default to be able to lazy load
// eslint-disable-next-line import/no-default-export
export default QualificationGuideDownload
