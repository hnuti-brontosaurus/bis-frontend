import { UserPayload } from 'app/services/bisTypes'
import spreadsheetTemplate from 'assets/templates/Vzor_import účastníků.xlsx'
import { ExternalButtonLink, ImportExcelButton, StyledModal } from 'components'
import { useShowMessage } from 'features/systemMessage/useSystemMessage'
import { useState } from 'react'
import { Overwrite } from 'utility-types'
import {
  ConfirmedUser,
  ImportParticipantsList,
} from './ImportParticipantsList/ImportParticipantsList'

export type UserImport = Overwrite<
  Omit<UserPayload, 'pronoun' | 'subscribed_to_newsletter' | 'all_emails'>,
  {
    health_insurance_company: string
    address: string
    contact_address: string
  }
>

export const ImportParticipants = ({
  onConfirm,
}: {
  onConfirm: (data: ConfirmedUser[]) => Promise<void>
}) => {
  const [importParticipantsModalOpen, setImportParticipantsModalOpen] =
    useState(false)

  const [importParticipantsData, setImportParticipantsData] =
    useState<UserImport[]>()

  const showMessage = useShowMessage()

  const handleConfirm = async (data: ConfirmedUser[]) => {
    try {
      await onConfirm(data)
      showMessage({
        message: 'Import se povedl',
        type: 'success',
      })
      setImportParticipantsModalOpen(false)
    } catch (e) {
      // just catch the error
    }
  }

  const handleCancel = () => {
    setImportParticipantsModalOpen(false)
    setImportParticipantsData(undefined)
  }

  const handleImportParticipants = async (data: UserImport[]) => {
    setImportParticipantsData(
      data.filter(
        ({ first_name, last_name, birthday }) =>
          first_name || last_name || birthday,
      ),
    )
    setImportParticipantsModalOpen(true)
  }

  return (
    <>
      <StyledModal
        title="Import účastnic a účastníků"
        open={importParticipantsModalOpen}
        onClose={handleCancel}
      >
        <ImportParticipantsList
          data={importParticipantsData}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </StyledModal>
      <ImportExcelButton<UserImport>
        keyMap={{
          first_name: 0,
          last_name: 1,
          birthday: 2,
          email: 3,
          phone: 4,
          address: 5,
          contact_address: 6,
          health_insurance_company: 7,
          health_issues: 8,
          close_person: {
            first_name: 9,
            last_name: 10,
            email: 11,
            phone: 12,
          },
          birth_name: 13,
          nickname: 14,
        }}
        headerRows={2}
        onUpload={handleImportParticipants}
      >
        Importovat z excelu
      </ImportExcelButton>
      <ExternalButtonLink tertiary small href={spreadsheetTemplate}>
        (vzor .xlsx)
      </ExternalButtonLink>
    </>
  )
}
