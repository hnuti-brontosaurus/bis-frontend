/**
 * This button imports data from excel
 */
import { ChangeEventHandler, ReactNode } from 'react'
import { normalizeKeys } from 'utils/helpers'
import * as xlsx from 'xlsx'
import styles from './ImportExcelButton.module.scss'

export interface ImportExcelButtonProps<T extends {}> {
  // keyMap is a config which says how to map columns in imported document (keyMap values) onto imported object (keyMap keys)
  keyMap: Record<keyof T, string[]>
  children: ReactNode
  onUpload: (data: T[]) => void
}

export const ImportExcelButton = <T extends {}>({
  keyMap,
  children,
  onUpload,
}: ImportExcelButtonProps<T>) => {
  const handleUpload: ChangeEventHandler<HTMLInputElement> = async e => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.readAsBinaryString(file)
      reader.onload = () => {
        const wb = xlsx.read(reader.result, { type: 'binary' })
        const json = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
        const normalizedJson = json
          .map(entry =>
            normalizeKeys<T>(entry as { [key: string]: string }, keyMap),
          )
          // ignore rows that imported nothing
          .filter(row => Object.keys(keyMap).some(key => row[key as keyof T]))
        onUpload(normalizedJson)
      }
    }
  }
  return (
    <label className={styles.importButton}>
      {children}
      <input
        type="file"
        accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
        onChange={handleUpload}
      />
    </label>
  )
}

// we need to export to later import it with React.lazy
// eslint-disable-next-line import/no-default-export
export default ImportExcelButton
