# Deployment

## Deployment to github pages

### Deployment variables

- `URL` - where the app will live (must be domain name without `https://` and without trailing slash)
- `API` - base url for api, especially useful when on different domain; it should be set up to allow CORS (optional)
- `CORS_PROXY` - proxy to fix CORS issues with images (optional)

### Deployment secrets

- `DEPLOY_GH_PAGES_SSH_KEY` - Private key for pushing to the target repo. The target repo itself has to have the public key added
- `SENTRY_DSN` - Sentry setup
