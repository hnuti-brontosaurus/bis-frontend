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
}
