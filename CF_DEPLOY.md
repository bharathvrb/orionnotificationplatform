# CloudFoundry Deployment Guide

## Yes, CloudFoundry supports npm! 

CloudFoundry uses the **Node.js buildpack** which automatically:
- Detects Node.js applications
- Runs `npm install` to install dependencies
- Runs `npm run build` (if present) to build the application
- Runs `npm start` to start the application

## Deployment Steps

### Prerequisites
1. Install CloudFoundry CLI: `cf --version`
2. Login to your CloudFoundry instance:
   ```bash
   cf login -a <api-endpoint>
   ```

### Deploy the Application

1. **Push the application:**
   ```bash
   cf push
   ```
   This will use the `manifest.yml` file automatically.

2. **Or push with specific options:**
   ```bash
   cf push onp-onboard-ui -f manifest.yml
   ```

### How It Works

1. **Buildpack Detection**: CloudFoundry detects `package.json` and uses the Node.js buildpack
2. **Dependencies**: Runs `npm install` (installs both dependencies and devDependencies because `NPM_CONFIG_PRODUCTION: false`)
3. **Build**: Runs `npm run build` which executes `tsc -b && vite build`
4. **Start**: Runs `npm start` which serves the built files using `vite preview`

### Configuration Files

- **manifest.yml**: CloudFoundry deployment configuration
- **.cfignore**: Files to exclude from upload (similar to .gitignore)
- **package.json**: Contains build and start scripts

### Environment Variables

The app uses the `PORT` environment variable (set by CloudFoundry) to determine which port to listen on.

### Customization

To customize the deployment, edit `manifest.yml`:
- Change `memory` allocation
- Adjust `instances` for scaling
- Modify `disk_quota` if needed
- Update `name` to match your app name

### Troubleshooting

1. **Check build logs:**
   ```bash
   cf logs onp-onboard-ui --recent
   ```

2. **SSH into the app:**
   ```bash
   cf ssh onp-onboard-ui
   ```

3. **View app status:**
   ```bash
   cf app onp-onboard-ui
   ```

### Notes

- The buildpack automatically runs `npm install` and `npm run build`
- The `start` script uses `vite preview` to serve the static files
- Make sure your `dist/` folder is built correctly before deployment
- The app will be available at the route assigned by CloudFoundry

