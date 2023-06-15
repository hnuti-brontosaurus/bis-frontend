# Deployment

## Deployment to development server https://dev.bis.brontosaurus.cz

Make a commit to https://github.com/hnuti-brontosaurus/bis which includes `#deploy`. It works with every branch, including feature branches. When the app builds and tests pass, it gets deployed to [development server](https://dev.bis.brontosaurus.cz)

So, e.g. you can update its frontend submodule, and make a commit with message `chore: update frontend #deploy`. In any case, please use commit messages consistent with current backend commit style.

### Detailed steps to deploy new frontend version to development server

1. have github repository [hnuti-brontosaurus/bis-frontend](https://github.com/hnuti-brontosaurus/bis-frontend/) updated with your changes
1. clone [hnuti-brontosaurus/bis](https://github.com/hnuti-brontosaurus/bis) onto your computer, including submodules (or update it to latest version with `git pull`)
   ```bash
   git clone --recurse-submodules https://github.com/hnuti-brontosaurus/bis.git
   ```
1. go to `frontend` folder
   `cd bis/frontend`
1. update the frontend submodule
   ```bash
   git pull
   ```
1. go back to `bis`, commit the changes, and push them to remote master
   ```bash
   cd ..
   git add frontend
   git commit -m "chore: update frontend #deploy"
   git push
   ```

## Deployment to production server

When commit in https://github.com/hnuti-brontosaurus/bis is tagged with tag `v*.*.*`, a production build gets created. Then an administrator has to confirm the deployment.

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
