# Style guide and best practices for this project

## React

For best practices, refer to documentation of [React](https://reactjs.org/) and [Create React App](https://create-react-app.dev/)

These best practices are preferred when in conflict with practices of this project

## Naming conventions

### Files and folders

- follow the conventions that are already used throughout the project
- files that export react components should be named with `PascalCase.tsx`, so should be named organizing folders and stylesheets with the same name. e.g. `..../PascalCase/PascalCase.module.scss`
- typescript files that don't export react components (e.g. helpers, hooks, api, config) should be named with `camelCase.ts`
- other files (assets, docs, generic stylesheets) can be named with `kebab-case.svg`

### Variables

In Typescript, we name variables with `camelCase` or `PascalCase`.

In this project, some object properties are named by `snake_case`. We do that to simplify dealing with data returned from api. Otherwise this practice should be avoided in favor of `camelCase` and `PascalCase`.

## Exports and imports

- write and export only one react component per file
- don't use default exports
- use absolute paths for imports when possible

## Styles

We style components using [css modules](https://github.com/css-modules/css-modules) with [scss](https://sass-lang.com/)

- css module should be placed in the same folder as the component it belongs to, and be named `ComponentName.module.scss`
- other stylesheets should be placed in `src/styles`
