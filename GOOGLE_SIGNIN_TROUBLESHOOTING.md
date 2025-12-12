# Google Sign-In DEVELOPER_ERROR Troubleshooting Guide

## Common Causes of DEVELOPER_ERROR

The `DEVELOPER_ERROR` in React Native Google Sign-In typically occurs due to configuration mismatches between your app and Google Cloud Console.

## Step-by-Step Fix

### 1. Verify SHA-1 Fingerprint (Android)

The SHA-1 fingerprint must be registered in Google Cloud Console.

#### Get Your SHA-1 Fingerprint:

**For Debug Build:**
```bash
# On macOS/Linux
cd android
./gradlew signingReport

# Or using keytool
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**For Release Build:**
```bash
keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
```

#### Add SHA-1 to Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your **OAuth 2.0 Client ID** (Android type)
5. Click **Edit**
6. Under **SHA-1 certificate fingerprints**, click **+ ADD FINGERPRINT**
7. Paste your SHA-1 fingerprint
8. Click **Save**

### 2. Verify Package Name

Ensure your Android package name matches exactly:

**Check in `android/app/build.gradle`:**
```gradle
android {
    defaultConfig {
        applicationId "com.yourapp.packagename"  // Must match Google Cloud Console
    }
}
```

**In Google Cloud Console:**
- Go to **Credentials** → Your Android OAuth Client
- Verify the **Package name** matches exactly (case-sensitive)

### 3. Verify OAuth Client ID Configuration

**Check your Google Sign-In configuration:**

```typescript
// In your React Native code
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID', // From Google Cloud Console
  // For Android, you can also use:
  // offlineAccess: true,
});
```

**Get the correct Client IDs:**
1. Go to Google Cloud Console → **Credentials**
2. Find your **OAuth 2.0 Client IDs**:
   - **Web client** (for `webClientId`)
   - **Android client** (package name must match)

### 4. Check google-services.json (Android)

Ensure `google-services.json` is properly configured:

**Location:** `android/app/google-services.json`

**Verify:**
- File exists in the correct location
- Contains your correct package name
- Contains your correct SHA-1 fingerprints
- Downloaded from Firebase Console (if using Firebase) or Google Cloud Console

### 5. Rebuild the App

After making changes:

```bash
# Clean build
cd android
./gradlew clean

# Rebuild
cd ..
npx react-native run-android
```

### 6. Verify Google Sign-In Package Installation

**Check if package is properly installed:**

```bash
npm list @react-native-google-signin/google-signin
```

**If not installed:**
```bash
npm install @react-native-google-signin/google-signin
cd ios && pod install  # For iOS
```

### 7. Check Android Configuration

**In `android/app/build.gradle`:**

```gradle
dependencies {
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
}
```

**In `android/build.gradle`:**

```gradle
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

**In `android/settings.gradle`:**

```gradle
include ':app'
```

### 8. Verify Internet Permissions

**In `android/app/src/main/AndroidManifest.xml`:**

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

## Quick Checklist

- [ ] SHA-1 fingerprint added to Google Cloud Console
- [ ] Package name matches exactly (case-sensitive)
- [ ] `webClientId` is correct (Web OAuth Client ID)
- [ ] `google-services.json` exists and is correct
- [ ] App rebuilt after configuration changes
- [ ] Google Sign-In package is installed
- [ ] Internet permission is granted

## Common Mistakes

1. **Using wrong Client ID type:**
   - Use **Web Client ID** for `webClientId`
   - Don't use Android Client ID for `webClientId`

2. **SHA-1 mismatch:**
   - Debug and Release builds have different SHA-1
   - Add both if testing both build types

3. **Package name typo:**
   - Must match exactly, including case
   - Check for extra spaces or characters

4. **Not rebuilding:**
   - Always rebuild after configuration changes
   - Clear cache: `npx react-native start --reset-cache`

## Testing

After fixing configuration:

1. **Clean build:**
   ```bash
   cd android && ./gradlew clean && cd ..
   ```

2. **Clear Metro cache:**
   ```bash
   npx react-native start --reset-cache
   ```

3. **Rebuild and run:**
   ```bash
   npx react-native run-android
   ```

## Additional Resources

- [Official Troubleshooting Guide](https://react-native-google-signin.github.io/docs/troubleshooting)
- [Google Sign-In Setup](https://react-native-google-signin.github.io/docs/getting-started)
- [Google Cloud Console](https://console.cloud.google.com/)

## Still Having Issues?

If the error persists:

1. **Check logs:**
   ```bash
   npx react-native log-android
   ```

2. **Verify OAuth consent screen:**
   - Google Cloud Console → **OAuth consent screen**
   - Ensure it's properly configured

3. **Test with different Google account:**
   - Some accounts may have restrictions

4. **Check app signing:**
   - Ensure you're using the correct keystore for the build type

