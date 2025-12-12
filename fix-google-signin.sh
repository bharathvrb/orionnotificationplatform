#!/bin/bash

# Google Sign-In DEVELOPER_ERROR Diagnostic and Fix Script
# Run this script in your React Native project root directory

echo "🔍 Google Sign-In DEVELOPER_ERROR Diagnostic Tool"
echo "=================================================="
echo ""

# Check if we're in a React Native project
if [ ! -d "android" ] && [ ! -d "ios" ]; then
    echo "❌ Error: This doesn't appear to be a React Native project."
    echo "   Please run this script from your React Native project root (where android/ and ios/ folders are)."
    exit 1
fi

echo "✅ React Native project detected"
echo ""

# Check for Google Sign-In package
if grep -q "@react-native-google-signin/google-signin" package.json 2>/dev/null; then
    echo "✅ Google Sign-In package found in package.json"
else
    echo "❌ Google Sign-In package NOT found in package.json"
    echo "   Install it with: npm install @react-native-google-signin/google-signin"
fi
echo ""

# Get SHA-1 fingerprint for Android
if [ -d "android" ]; then
    echo "📱 Android Configuration Check:"
    echo "--------------------------------"
    
    # Check for google-services.json
    if [ -f "android/app/google-services.json" ]; then
        echo "✅ google-services.json found"
        
        # Extract package name from google-services.json
        PACKAGE_NAME=$(grep -o '"package_name": "[^"]*"' android/app/google-services.json | cut -d'"' -f4 | head -1)
        if [ ! -z "$PACKAGE_NAME" ]; then
            echo "   Package name in google-services.json: $PACKAGE_NAME"
        fi
    else
        echo "❌ google-services.json NOT found"
        echo "   Download it from Firebase Console and place it in android/app/"
    fi
    
    # Get package name from build.gradle
    if [ -f "android/app/build.gradle" ]; then
        APP_ID=$(grep -E "applicationId\s+" android/app/build.gradle | head -1 | sed 's/.*applicationId.*"\(.*\)".*/\1/')
        if [ ! -z "$APP_ID" ]; then
            echo "   Package name in build.gradle: $APP_ID"
        fi
    fi
    
    echo ""
    echo "🔑 Getting SHA-1 Fingerprint..."
    echo "   (This is needed for Google Cloud Console configuration)"
    echo ""
    
    # Try to get SHA-1 from debug keystore
    if [ -f ~/.android/debug.keystore ]; then
        echo "Debug Keystore SHA-1:"
        keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep -A 1 "SHA1:" || echo "   Could not read debug keystore"
    else
        echo "   Debug keystore not found at ~/.android/debug.keystore"
    fi
    
    echo ""
    echo "   To get SHA-1 using Gradle (recommended):"
    echo "   cd android && ./gradlew signingReport"
    echo ""
fi

# Check iOS configuration
if [ -d "ios" ]; then
    echo "🍎 iOS Configuration Check:"
    echo "---------------------------"
    
    if [ -f "ios/Podfile" ]; then
        echo "✅ Podfile found"
        if grep -q "GoogleSignIn" ios/Podfile 2>/dev/null; then
            echo "✅ GoogleSignIn found in Podfile"
        else
            echo "⚠️  GoogleSignIn not found in Podfile"
            echo "   Make sure pods are installed: cd ios && pod install"
        fi
    fi
    
    # Check for GoogleService-Info.plist
    if [ -f "ios/GoogleService-Info.plist" ]; then
        echo "✅ GoogleService-Info.plist found"
    else
        echo "❌ GoogleService-Info.plist NOT found"
        echo "   Download it from Firebase Console and place it in ios/"
    fi
    echo ""
fi

# Check for Google Sign-In configuration in code
echo "📝 Code Configuration Check:"
echo "----------------------------"
if find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -l "GoogleSignin\|google-signin" 2>/dev/null | head -3; then
    echo "✅ Google Sign-In code found"
    echo ""
    echo "   Check your GoogleSignin.configure() call:"
    find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -A 5 "GoogleSignin.configure" 2>/dev/null | head -10
else
    echo "⚠️  Google Sign-In code not found in project"
fi
echo ""

echo "📋 Next Steps:"
echo "============="
echo ""
echo "1. Get your SHA-1 fingerprint (see above)"
echo "2. Go to Google Cloud Console: https://console.cloud.google.com/"
echo "3. Navigate to: APIs & Services → Credentials"
echo "4. Find your Android OAuth 2.0 Client ID"
echo "5. Click Edit and add your SHA-1 fingerprint"
echo "6. Verify package name matches exactly"
echo "7. Rebuild your app:"
echo "   cd android && ./gradlew clean && cd .."
echo "   npx react-native run-android"
echo ""
echo "For detailed instructions, see: GOOGLE_SIGNIN_TROUBLESHOOTING.md"
echo ""

