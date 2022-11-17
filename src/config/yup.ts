import * as yup from 'yup'
import { required } from '../utils/validationMessages'

yup.setLocale({
  mixed: {
    required,
    notType: ({ type }) =>
      `Zadejte ` + (type === 'number' ? 'číslo' : 'správný typ'),
  },
  number: {},
})
