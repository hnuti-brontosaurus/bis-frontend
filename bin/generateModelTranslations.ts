import fs from 'fs/promises'
import { lowerFirst } from 'lodash'
import * as YAML from 'yaml'

type RawModel = {
  name: string
  name_plural: string
  fields: {
    [key: string]: string | string[] | { [key: string]: string }
  }
}

export type Model = Readonly<
  {
    _name: RawModel['name']
    _name_plural: RawModel['name_plural']
  } & RawModel['fields']
>

const generate = async () => {
  const yamlTranslations = await (
    await fetch(
      'https://raw.githubusercontent.com/lamanchy/bis/master/backend/translation/model_translations.yaml',
    )
  ).text()

  const raw = YAML.parse(yamlTranslations)

  const modelEntries: [string, Model][] = Object.entries(raw).map(
    ([name, model]) => {
      const raw = model as RawModel
      return [
        lowerFirst(name),
        {
          _name: raw.name,
          _name_plural: raw.name,
          ...raw.fields,
        },
      ]
    },
  )

  await fs.writeFile(
    'src/utils/translations.ts',
    modelEntries
      .map(
        ([name, value]) =>
          `export const ${name} = ${JSON.stringify(value)} as const;\n\n`,
      )
      .join(''),
  )

  console.log('it works!')
}

generate()

export {}
