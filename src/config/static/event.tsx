import { ReactComponent as OneTreeIcon } from 'assets/one-tree.svg'
import { ReactComponent as TentIcon } from 'assets/tent.svg'
import { ReactComponent as ThreeTreesIcon } from 'assets/three-trees.svg'

export const form = {
  group: {
    options: {
      other: {
        icon: OneTreeIcon,
        name: (
          <>
            Jednodenní akce,
            <br />
            Akce bez adresáře
          </>
        ),
        help: (
          <>
            Akce trvající 1 den a méně.
            <br />
            Akce bez povinného adresáře jsou speciální akce, kde nelze vyplňovat
            prezenční listinu např. dlouhodobé výstavy, velké akce pro
            veřejnost…
          </>
        ),
      },
      weekend_event: {
        icon: ThreeTreesIcon,
        name: (
          <>
            Víkendovka,
            <br />
            Akce s adresářem,
            <br />
            Brďo schůzky
          </>
        ),
        help: 'Víkendovky jsou akce trvající 2-5 dnů',
      },
      camp: {
        icon: TentIcon,
        name: 'Tábor',
        help: 'Tábory jsou akce konající se 6 a více dní',
      },
    },
  },
  propagation: {
    is_shown_on_web: {
      help: 'Pokud zaškrtnete ano, akce se zobrazí na webu www.brontosaurus.cz. Volbu ne zaškrtněte pouze jedná-li se o interní akci HB nebo interní akci Brďa.',
    },
  },
  registrationMethod: {
    help: (
      <>
        Způsoby přihlášení na vaši akci na www.brontosaurus.cz, které se zobrazí
        po kliknutí na tlačítko “chci jet”:
        <ul>
          <li>
            Standardní přihláška na brontowebu (doporučujeme!) - Je jednotná pro
            celé HB. Do této přihlášky si můžete přidat vlastní otázky. Vyplněné
            údaje se pak rovnou zobrazí v BIS, což tobě i kanceláři ulehčí
            práci.
          </li>
          <li>
            Jiná elektronická přihláška - Při přihlašování budou zájemci rovnou
            přesměrování na tvoji přihlášku. V tomto případě se ale přihlášení
            lidé v BIS nezobrazí.
          </li>
          <li>
            Registrace není potřeba, stačí přijít - Zobrazí se jako text u tvojí
            akce na webu.
          </li>
          <li>
            Máme bohužel plno, zkuste jinou z našich akcí - Zobrazí se jako text
            u tvojí akce na webu.
          </li>
        </ul>
      </>
    ),
  },
  registration: {
    questionnaire: {
      help: 'Zde můžeš připsat svoje doplňující otevřené otázky pro účastníky, které se zobrazí u standardní přihlášky na webu. Kromě tvých otázek se standardní přihláška ptá na jméno, datum narození, telefon a email účastníka.',
      introduction: {
        help: 'Text který se zobrazí na začátku dotazníku.',
      },
      after_submit_text: {
        help: 'Text který se zobrazí poté, co zájemkyně/zájemce odešle formulář.',
      },
    },
  },
}
