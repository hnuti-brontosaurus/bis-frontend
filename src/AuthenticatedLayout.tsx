import { FC, ReactNode } from 'react'
import Header from './Header'

const AuthenticatedLayout: FC<{ isLogo?: boolean; children: ReactNode }> = ({
  isLogo = true,
  children,
}) => {
  return (
    <div>
      <Header />
      {children}
    </div>
  )
}

export default AuthenticatedLayout
