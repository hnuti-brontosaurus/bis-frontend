# Deployment

## Deployment to github pages

Currently, we have a [development deployment](https://github.com/hnuti-brontosaurus/bis-frontend-build-dev) which gets built on every commit/merge to main.

You could also make a production deployment which would get build on every merge to e.g. production branch. To do this, copy and edit workflow [deploy-dev.yml](../.github/workflows/deploy-dev.yml) accordingly. You'll also need to set up the environment variables and secrets for the new environment:

### Deployment variables

- `URL` - where the app will live (must be domain name without `https://` and without trailing slash)
- `API` - base url for api, especially useful when on different domain; it should be set up to allow CORS (optional)
- `CORS_PROXY` - proxy to fix CORS issues with images (optional)

### Deployment secrets

- `DEPLOY_GH_PAGES_SSH_KEY` - Private key for pushing to the target repo. The target repo itself has to have the public key added
- `SENTRY_DSN` - Sentry setup
