import { useFormContext } from 'react-hook-form'
import { api } from '../../../app/services/bis'
import FormInputError from '../../../components/FormInputError'
import {
  FormSection,
  FormSubsection,
  FormSubsubsection,
  InfoBox,
} from '../../../components/FormLayout'
import Help from '../../../components/Help'
import { ImagesUpload, ImageUpload } from '../../../components/ImageUpload'
import { getIdsBySlugs } from '../../../utils/helpers'
import { EventFormShape } from '../../EventForm'

const totalHoursHelp =
  'Napište kolik hodin strávili všichni účastníci a organizátoři dobrovolnickou prací. Např.: Na akci se dva dny kosila louka. Každý den se pracovalo 6 hodin a pracovalo 10 účastníků a 2 organizátoři. Všichni tedy dobrovolnickou prací strávili 2 dny x 6 hodin x 12 lidí =  144 člověkohodin.'

const WorkStep = () => {
  const { register, watch } = useFormContext<EventFormShape>()
  const { data: eventCategories } = api.endpoints.getEventCategories.useQuery()

  if (!eventCategories) return <>Loading...</>

  const isVolunteering = getIdsBySlugs(eventCategories.results, [
    'public__volunteering__only_volunteering',
    'public__volunteering__with_experience',
  ]).includes(+watch('category'))

  return (
    <FormSection>
      <FormSubsection header="Evidence práce">
        <FormSubsubsection
          required={isVolunteering}
          header="Odpracováno člověkohodin"
          help={totalHoursHelp}
        >
          <FormInputError>
            <input
              type="number"
              {...register('record.total_hours_worked', {
                required: isVolunteering && 'Toto pole je povinné',
              })}
            />
          </FormInputError>
        </FormSubsubsection>
        <FormSubsubsection
          required={isVolunteering}
          header="Komentáře k vykonané práci"
          help="Popište vykonanou dobrovolnickou práci."
        >
          <FormInputError>
            <textarea
              {...register('record.comment_on_work_done', {
                required: isVolunteering && 'Toto pole je povinné',
              })}
            />
          </FormInputError>
        </FormSubsubsection>
      </FormSubsection>
      <FormSubsection header="Evidence akce">
        <FormSubsubsection header="Fotky z akce">
          <ImagesUpload name="recordData.photos" />
        </FormSubsubsection>
        <FormSubsubsection
          header="Sken prezenční listiny"
          help="Povinné pro akce pobírající dotaci. Doporučené pro všechny ostatní."
        >
          <ImageUpload name="recordData.participant_list_scan.image" />
        </FormSubsubsection>
        <FormSubsubsection
          header="Sken dokladů"
          help="Povinné pro vybrané akce. Pokud jste mezi vybranými akcemi, bude vás ústředí HB informovat."
        >
          <ImagesUpload name="recordData.receipts" />
        </FormSubsubsection>
        <FormSubsubsection
          header="Číslo účtu k proplacení dokladů"
          help="Povinné pro vybrané akce. Pokud jste mezi vybranými akcemi, bude vás ústředí HB informovat."
        >
          {/* TODO: find or ask which field is this */}
          <input type="text" /*{/*...register('record.')* /}*/ />
        </FormSubsubsection>
        <FormSubsubsection header="Zpětná vazba">
          <InfoBox>
            Zpětná vazba od účastníků udělá vaši příští akci ještě lepší!
            Spokojení účastníci jsou tou nejlepší odměnou pro každého
            organizátora. Jejich zpětná vazba je velmi cenná a umožní vám
            reflexi toho, co se povedlo a co můžete do příště ještě vylepšit. Na
            tomto odkazu zpětnou vazbu pro účastníky lehce připravíte.
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
        </FormSubsubsection>
        <FormSubsubsection header="Závěrečná zpráva">
          <InfoBox>
            Vyplněná závěrečná zpráva o akci nám pomáhá zlepšovat podporu vám i
            dalším organizátorům. Vám zase slouží k uchování doplňkových
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
        </FormSubsubsection>
      </FormSubsection>
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
    </FormSection>
  )
}

export default WorkStep
