import { required } from 'utils/validationMessages'
import * as yup from 'yup'

yup.setLocale({
  mixed: {
    required,
    notType: ({ type }) =>
      `Zadejte ` + (type === 'number' ? 'číslo' : 'správný typ'),
  },
  number: {},
})
