import classnames from 'classnames'
import React, { FC, ReactNode } from 'react'
import Tooltip from 'react-tooltip-lite'
import styles from './TableCellIconButton.module.scss'

interface CustomTableColumnProps {
  icon: FC<React.SVGProps<SVGSVGElement>>
  action?: () => void
  className?: string
  children?: ReactNode
  color?: string
  glowColor?: string
  tooltipContent?: ReactNode
  disabled?: boolean
}

export const TableCellIconButton: FC<
  CustomTableColumnProps & React.HTMLAttributes<HTMLTableDataCellElement>
> = props => {
  const {
    icon: Icon,
    action,
    className,
    color,
    glowColor,
    children,
    tooltipContent,
    disabled,
    ...rest
  } = props

  function handleIconClick(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) {
    e.stopPropagation()
    if (typeof action === 'function') {
      action()
    }
  }

  return (
    <td
      className={classnames(className, disabled && styles.disabledCell)}
      {...rest}
    >
      <Tooltip
        useDefaultStyles
        content={tooltipContent}
        tagName="span"
        hoverDelay={tooltipContent ? 500 : 100000000}
      >
        <span className={styles.binIconContainer} onClick={handleIconClick}>
          <Icon className={styles.iconHead} style={{ color }} />
          <span
            className={styles.circle}
            style={{ backgroundColor: glowColor }}
          ></span>
        </span>
        {children}
      </Tooltip>
    </td>
  )
}
