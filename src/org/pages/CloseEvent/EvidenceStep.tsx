import { api } from 'app/services/bis'
import {
  FormInputError,
  FormSection,
  FormSectionGroup,
  FormSubsection,
  Help,
  ImagesUpload,
  ImageUpload,
  InfoBox,
  Loading,
} from 'components'
import { form as formTexts } from 'config/static/closeEvent'
import { FormProvider, UseFormReturn } from 'react-hook-form'
import { required } from 'utils/validationMessages'
import { EvidenceStepFormShape } from './CloseEventForm'

export const EvidenceStep = ({
  isVolunteering,
  methods,
}: {
  isVolunteering: boolean
  methods: UseFormReturn<EvidenceStepFormShape, any>
}) => {
  const { data: eventCategories } = api.endpoints.readEventCategories.useQuery()

  const { register } = methods

  if (!eventCategories) return <Loading>Připravujeme formulář</Loading>

  return (
    <FormProvider {...methods}>
      <form>
        <FormSectionGroup startIndex={2}>
          <FormSection header="Evidence práce">
            <FormSubsection
              required={isVolunteering}
              header="Odpracováno člověkohodin"
              help={formTexts.record.total_hours_worked.help}
            >
              <FormInputError>
                <input
                  type="number"
                  {...register('record.total_hours_worked', {
                    required: isVolunteering && required,
                  })}
                />
              </FormInputError>
            </FormSubsection>
            <FormSubsection
              required={isVolunteering}
              header="Komentáře k vykonané práci"
              help="Popište vykonanou dobrovolnickou práci."
            >
              <FormInputError>
                <textarea
                  {...register('record.comment_on_work_done', {
                    required: isVolunteering && required,
                  })}
                />
              </FormInputError>
            </FormSubsection>
          </FormSection>
          <FormSection header="Evidence akce">
            <FormSubsection header="Fotky z akce" help={formTexts.photos.help}>
              <ImagesUpload name="photos" image="photo" />
            </FormSubsection>
            <FormSubsection
              header="Sken prezenční listiny"
              help="Povinné pro akce pobírající dotaci. Doporučené pro všechny ostatní."
            >
              <ImageUpload name="record.attendance_list" />
            </FormSubsection>
          </FormSection>
          <FormSection header="Finance">
            <FormSubsection
              header="Sken dokladů"
              help="Povinné pro vybrané akce. Pokud jste mezi vybranými akcemi, bude vás ústředí HB informovat."
            >
              <ImagesUpload name="receipts" image="receipt" />
            </FormSubsection>
            <FormSubsection
              header="Číslo účtu k proplacení dokladů"
              help="Povinné pro vybrané akce. Pokud jste mezi vybranými akcemi, bude vás ústředí HB informovat."
            >
              {/* TODO: find or ask which field is this */}
              <input type="text" {...register('finance.bank_account_number')} />
            </FormSubsection>
          </FormSection>
          <FormSection header="Zpětná vazba">
            <InfoBox>
              Zpětná vazba od účastníků udělá vaši příští akci ještě lepší!
              Spokojení účastníci jsou tou nejlepší odměnou pro každého
              organizátora. Jejich zpětná vazba je velmi cenná a umožní vám
              reflexi toho, co se povedlo a co můžete do příště ještě vylepšit.
              Na tomto odkazu zpětnou vazbu pro účastníky lehce připravíte.
            </InfoBox>
            <div>
              <Help>
                Přihlašte se univerzálním heslem “vyplnto” nebo heslem vaší
                organizační jednotky.
              </Help>{' '}
              <a
                href="https://zpetna-vazba.brontosaurus.cz/login.php"
                target="__blank"
                rel="noopener noreferrer"
              >
                Připravit zpětnou vazbu
              </a>
            </div>
          </FormSection>
          <FormSection header="Závěrečná zpráva">
            <InfoBox>
              Vyplněná závěrečná zpráva o akci nám pomáhá zlepšovat podporu vám
              i dalším organizátorům. Vám zase slouží k uchování doplňkových
              informací a usnadní plánování příští akce!
            </InfoBox>
            <div>
              <Help>
                Přihlašte se univerzálním heslem “vyplnto” nebo heslem vaší
                organizační jednotky.
              </Help>{' '}
              <a
                href="https://zpetna-vazba.brontosaurus.cz/login.php"
                target="__blank"
                rel="noopener noreferrer"
              >
                Vyplnit závěrečnou zprávu
              </a>
            </div>
          </FormSection>
          {/* Údaje , které je třeba zadat po akci:
Počet účastníků celkem *
Z toho počet účastníků do 26 let * 
Bylo by super, pokud by se počet účastníků do 26 let vyplňoval automaticky. 

EVIDENCE AKCE
 Odkaz na fotky z akce - (help?: Nahrajte odkaz na uložiště s fotkami z akce. Fotky z vaší akce velmi pomůžou při propagaci HB a několik se jich posílá poskytovatelům dotací jako důkaz, že akce proběhla. Jako uložiště můžete použít google photos, leteckou poštu, uložto….) 
Nahrát sken prezenční listiny (help?: Povinné pro akce pobírající dotaci. Doporučené pro všechny ostatní.)
Nahrát sken dokladů (help?: Povinné pro vybrané akce. Pokud jste mezi vybranými akcemi, bude vás ústředí HB informovat.)
číslo účtu k proplacení dokladů (help?: Povinné pro vybrané akce. Pokud jste mezi vybranými akcemi, bude vás ústředí HB informovat.)


 
Zpětná vazba od účastníků udělá vaši příští akci ještě lepší! Spokojení účastníci jsou tou nejlepší odměnou pro každého organizátora. Jejich zpětná vazba je velmi cenná a umožní vám reflexi toho, co se povedlo a co můžete do příště ještě vylepšit. Na tomto odkazu zpětnou vazbu pro účastníky lehce připravíte. (help?: Přihlašte se univerzálním heslem “vyplnto” nebo heslem vaší organizační jednotky. )
(https://zpetna-vazba.brontosaurus.cz/login.php)
Vyplněná závěrečná zpráva o akci nám pomáhá zlepšovat podporu vám i dalším organizátorům. Vám zase  slouží k uchování doplňkových informací a usnadní plánování příští akce!
  (help?: Přihlašte se univerzálním heslem “vyplnto” nebo heslem vaší organizační jednotky. )
(https://zpetna-vazba.brontosaurus.cz/login.php).


Do budoucna: Hodnocení servisu ústředí *****
        Možnost poslat follow up email - rozkliknu nabídku - zobrazí se text, který org může upravit - pošle se email všem účastníkům. Text musí být editovatelný kanceláří, aby tam mohli přidávat aktuální pozvánky na akci */}
        </FormSectionGroup>
      </form>
    </FormProvider>
  )
}
