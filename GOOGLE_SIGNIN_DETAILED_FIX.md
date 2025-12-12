# Detailed Google Sign-In DEVELOPER_ERROR Fix

## Step-by-Step Verification

### Step 1: Verify Your GoogleSignin.configure() Code

Check your React Native code where you configure Google Sign-In. It should look like this:

```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // ⚠️ MUST be Web Client ID
  offlineAccess: true, // Optional
});
```

**CRITICAL:** You MUST use the **Web Client ID**, NOT the Android Client ID!

### Step 2: Get the Correct Client IDs from Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. You should see TWO OAuth 2.0 Client IDs:
   - **Android client** (for package name/SHA-1)
   - **Web client** (for `webClientId` in code)

**Copy the Web Client ID** - it looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`

### Step 3: Verify Package Name Match

**In your React Native project:**

1. Check `android/app/build.gradle`:
   ```gradle
   android {
       defaultConfig {
           applicationId "com.aapthamithra.app" // ← This must match exactly
       }
   }
   ```

2. Check Google Cloud Console:
   - Go to **Credentials** → Your **Android OAuth Client**
   - The **Package name** must match EXACTLY (case-sensitive, no spaces)

### Step 4: Verify SHA-1 Fingerprint

**Get SHA-1 (if you haven't already):**

```bash
cd android
./gradlew signingReport
```

Look for output like:
```
Variant: debug
Config: debug
Store: ~/.android/debug.keystore
Alias: AndroidDebugKey
SHA1: AA:BB:CC:DD:EE:FF:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE
```

**In Google Cloud Console:**
1. Go to **Credentials** → Your **Android OAuth Client**
2. Under **SHA-1 certificate fingerprints**, verify your SHA-1 is listed
3. If not, add it and **SAVE**

### Step 5: Check google-services.json

**Location:** `android/app/google-services.json`

**Verify it contains:**
- Your correct package name
- Your project number
- Client information

**If missing or incorrect:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Your apps**
4. Download `google-services.json` for Android
5. Replace the file in `android/app/`

### Step 6: Verify Android Dependencies

**Check `android/app/build.gradle`:**

```gradle
dependencies {
    // ... other dependencies
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
    // Make sure google-services plugin is applied
}

// At the bottom of the file:
apply plugin: 'com.google.gms.google-services'
```

**Check `android/build.gradle`:**

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

### Step 7: Clean and Rebuild

**IMPORTANT:** After any configuration change, you MUST clean and rebuild:

```bash
# Stop Metro bundler if running

# Clean Android build
cd android
./gradlew clean
cd ..

# Clear Metro cache
rm -rf node_modules
npm install
# OR if using yarn: yarn install

# Clear watchman (if installed)
watchman watch-del-all

# Start fresh
npx react-native start --reset-cache

# In another terminal, rebuild
npx react-native run-android
```

### Step 8: Verify OAuth Consent Screen

1. Go to Google Cloud Console
2. Navigate to **APIs & Services** → **OAuth consent screen**
3. Ensure:
   - App is in **Testing** or **Production** mode
   - Test users are added (if in Testing mode)
   - Scopes are configured

### Step 9: Check for Common Mistakes

❌ **Using Android Client ID for webClientId**
```typescript
// WRONG:
webClientId: '123456789-android.apps.googleusercontent.com'

// CORRECT:
webClientId: '123456789-web.apps.googleusercontent.com'
```

❌ **Package name mismatch**
- Check for typos
- Check case sensitivity
- Check for extra spaces

❌ **SHA-1 not saved**
- After adding SHA-1, you MUST click **SAVE** in Google Cloud Console
- Wait a few minutes for changes to propagate

❌ **Using wrong keystore**
- Debug builds use `~/.android/debug.keystore`
- Release builds use your release keystore
- Add SHA-1 for BOTH if testing both

### Step 10: Test with Logs

Add detailed logging to see the exact error:

```typescript
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

try {
  await GoogleSignin.hasPlayServices();
  const userInfo = await GoogleSignin.signIn();
  console.log('User Info:', userInfo);
} catch (error: any) {
  console.log('Error code:', error.code);
  console.log('Error message:', error.message);
  if (error.code === statusCodes.SIGN_IN_CANCELLED) {
    console.log('User cancelled the login flow');
  } else if (error.code === statusCodes.IN_PROGRESS) {
    console.log('Sign in is in progress');
  } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
    console.log('Play services not available');
  } else {
    console.log('Other error:', error);
  }
}
```

## Quick Verification Checklist

Run through this checklist:

- [ ] Using **Web Client ID** (not Android Client ID) in `webClientId`
- [ ] Package name in `build.gradle` matches Google Cloud Console exactly
- [ ] SHA-1 fingerprint added to Google Cloud Console Android OAuth Client
- [ ] Clicked **SAVE** after adding SHA-1
- [ ] `google-services.json` exists in `android/app/`
- [ ] `google-services.json` has correct package name
- [ ] Cleaned build: `./gradlew clean`
- [ ] Cleared Metro cache: `--reset-cache`
- [ ] Rebuilt app completely
- [ ] OAuth consent screen is configured
- [ ] Test user added (if app is in Testing mode)

## Still Not Working?

If you've verified all the above:

1. **Double-check Client ID:**
   - In Google Cloud Console, copy the Web Client ID again
   - Make sure there are no extra spaces or characters
   - Verify it ends with `.apps.googleusercontent.com`

2. **Try creating a new OAuth Client:**
   - Sometimes recreating the client helps
   - Delete old one and create new with same package name and SHA-1

3. **Check app is using correct keystore:**
   ```bash
   # Verify which keystore is being used
   cd android
   ./gradlew signingReport
   ```

4. **Wait for propagation:**
   - Google Cloud Console changes can take 5-10 minutes to propagate
   - Wait and try again

5. **Check AndroidManifest.xml:**
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   ```

6. **Verify Google Sign-In API is enabled:**
   - Google Cloud Console → **APIs & Services** → **Library**
   - Search for "Google Sign-In API"
   - Ensure it's **ENABLED**

## Need More Help?

Share these details:
1. Your `GoogleSignin.configure()` code (with client ID redacted)
2. Package name from `build.gradle`
3. Whether SHA-1 is added in Google Cloud Console
4. Error message from logs (run with `npx react-native log-android`)

