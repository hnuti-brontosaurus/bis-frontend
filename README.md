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
- `REACT_APP_CORS_PROXY` A proxy which adds CORS headers to images, including trailing slash (default none)

## Running locally with a remote proxy

`REACT_APP_API_BASE_URL="https://bis.proxy.mrkvon.org/https://dev.bis.lomic.cz/api/" REACT_APP_CORS_PROXY="https://bis.proxy.mrkvon.org/" yarn start`

## Running locally with a local proxy

### Set up the proxy

In a new terminal run:

1. `git clone https://github.com/mrkvon/rdf-proxy.git`
1. `cd rdf-proxy`
1. `git switch cors-anywhere`
1. `yarn`
1. `yarn proxy`

And the proxy will run on `http://localhost:8080` and you can do `http://localhost:8080/https://example.com/whatever`

### Run the app

Use the command: `REACT_APP_API_BASE_URL="http://localhost:8080/https://dev.bis.lomic.cz/api/" REACT_APP_CORS_PROXY="http://localhost:8080/" yarn start`
