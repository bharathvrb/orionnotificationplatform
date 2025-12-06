# CloudFoundry URI Guide

## Default URI Format

Based on your `manifest.yml`, the app name is: **`onp-onboard-ui`**

The CloudFoundry URI will typically be:

```
https://onp-onboard-ui.{your-domain}
```

## Common CloudFoundry Domains

### Pivotal Cloud Foundry (PCF)
```
https://onp-onboard-ui.cfapps.io
```
or
```
https://onp-onboard-ui.run.pivotal.io
```

### IBM Cloud Foundry
```
https://onp-onboard-ui.us-south.cf.appdomain.cloud
```
(Region may vary: us-south, eu-gb, eu-de, etc.)

### SAP BTP (Business Technology Platform)
```
https://onp-onboard-ui.cfapps.{region}.hana.ondemand.com
```

### Custom/Enterprise CloudFoundry
```
https://onp-onboard-ui.{your-company-domain}.com
```

## How to Find Your Actual URI

### Method 1: After Deployment
After running `cf push`, CloudFoundry will display the route:
```bash
$ cf push
...
routes:
   onp-onboard-ui.cfapps.io
...
```

### Method 2: Check App Info
```bash
cf app onp-onboard-ui
```
This will show the routes/URIs assigned to your app.

### Method 3: List Routes
```bash
cf routes
```
Shows all routes in your space.

## Setting a Custom Route/URI

### Option 1: Update manifest.yml

Add a `routes` section to your `manifest.yml`:

```yaml
---
applications:
  - name: onp-onboard-ui
    memory: 256M
    disk_quota: 512M
    instances: 1
    buildpack: nodejs_buildpack
    command: npm start
    routes:
      - route: onp-onboard-ui.your-custom-domain.com
    env:
      NODE_ENV: production
      NPM_CONFIG_PRODUCTION: false
    stack: cflinuxfs4
```

### Option 2: Use cf push with route flag

```bash
cf push onp-onboard-ui -d your-domain.com --hostname onp-onboard-ui
```

### Option 3: Map route after deployment

```bash
cf map-route onp-onboard-ui your-domain.com --hostname onp-onboard-ui
```

## Example: Complete manifest.yml with Custom Route

```yaml
---
applications:
  - name: onp-onboard-ui
    memory: 256M
    disk_quota: 512M
    instances: 1
    buildpack: nodejs_buildpack
    command: npm start
    routes:
      - route: onp-onboard-ui.cfapps.io
      - route: onp.yourcompany.com  # Custom domain
    env:
      NODE_ENV: production
      NPM_CONFIG_PRODUCTION: false
    stack: cflinuxfs4
```

## Multiple Routes

You can assign multiple routes to the same app:

```yaml
routes:
  - route: onp-onboard-ui.cfapps.io
  - route: onp.cfapps.io
  - route: onboard.yourcompany.com
```

All routes will point to the same application.

## Finding Your Domain

1. **Check your CloudFoundry organization/space:**
   ```bash
   cf target
   ```

2. **List available domains:**
   ```bash
   cf domains
   ```

3. **Check your CloudFoundry provider documentation** for the default domain format.

## After Deployment

Once deployed, you can access your app at:
- The default route: `https://onp-onboard-ui.{domain}`
- Any custom routes you've configured

## Troubleshooting

If the URI doesn't work:
1. Check app status: `cf app onp-onboard-ui`
2. Check routes: `cf routes`
3. View logs: `cf logs onp-onboard-ui --recent`
4. Verify the app is running: `cf apps`

