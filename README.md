# App for Brontosaurus information system

## Configuration

Configuration is done with environment variables. These variables should never contain secrets. After build, they'll be hardcoded in build files and therefore easily discoverable. They serve exclusively to set up configuration constants

To run the app in development version

```
REACT_APP_VAR1="something" REACT_APP_VAR2="something_else" yarn start
```

To build the app

```
REACT_APP_VAR1="something" REACT_APP_VAR2="something_else" yarn build
```

- `REACT_APP_API_BASE_URL` API base url, including trailing slash (default `/api/`)
- `REACT_APP_SENTRY_DSN` a dsn for Sentry setup
