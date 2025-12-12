/**
 * Google Sign-In Configuration Verification Script
 * 
 * Run this in your React Native project to verify your configuration
 * 
 * Usage: node verify-google-signin-config.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Google Sign-In Configuration Verifier\n');
console.log('='.repeat(50));
console.log('');

// Check if we're in a React Native project
if (!fs.existsSync('android') && !fs.existsSync('ios')) {
  console.log('❌ Error: This doesn\'t appear to be a React Native project.');
  console.log('   Please run this script from your React Native project root.\n');
  process.exit(1);
}

let issues = [];
let warnings = [];

// 1. Check package.json for Google Sign-In
console.log('1. Checking package.json...');
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  if (deps['@react-native-google-signin/google-signin']) {
    console.log('   ✅ Google Sign-In package installed');
    console.log(`   Version: ${deps['@react-native-google-signin/google-signin']}`);
  } else {
    issues.push('Google Sign-In package not found in package.json');
    console.log('   ❌ Google Sign-In package NOT found');
  }
} else {
  issues.push('package.json not found');
}
console.log('');

// 2. Check Android configuration
if (fs.existsSync('android')) {
  console.log('2. Checking Android configuration...');
  
  // Check build.gradle for applicationId
  const buildGradlePath = 'android/app/build.gradle';
  if (fs.existsSync(buildGradlePath)) {
    const buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
    const appIdMatch = buildGradle.match(/applicationId\s+["']([^"']+)["']/);
    
    if (appIdMatch) {
      const packageName = appIdMatch[1];
      console.log(`   ✅ Package name found: ${packageName}`);
      console.log(`   ⚠️  Verify this matches Google Cloud Console EXACTLY`);
    } else {
      warnings.push('Could not find applicationId in build.gradle');
      console.log('   ⚠️  Could not find applicationId in build.gradle');
    }
    
    // Check for google-services plugin
    if (buildGradle.includes('com.google.gms.google-services')) {
      console.log('   ✅ google-services plugin found');
    } else {
      warnings.push('google-services plugin not found in build.gradle');
      console.log('   ⚠️  google-services plugin not found');
    }
    
    // Check for play-services-auth
    if (buildGradle.includes('play-services-auth')) {
      console.log('   ✅ play-services-auth dependency found');
    } else {
      warnings.push('play-services-auth dependency not found');
      console.log('   ⚠️  play-services-auth dependency not found');
    }
  } else {
    issues.push('android/app/build.gradle not found');
  }
  
  // Check for google-services.json
  const googleServicesPath = 'android/app/google-services.json';
  if (fs.existsSync(googleServicesPath)) {
    console.log('   ✅ google-services.json found');
    try {
      const googleServices = JSON.parse(fs.readFileSync(googleServicesPath, 'utf8'));
      const client = googleServices.client?.[0];
      if (client) {
        console.log(`   ✅ Package name in google-services.json: ${client.client_info?.android_client_info?.package_name || 'N/A'}`);
      }
    } catch (e) {
      warnings.push('Could not parse google-services.json');
      console.log('   ⚠️  Could not parse google-services.json');
    }
  } else {
    issues.push('google-services.json not found in android/app/');
    console.log('   ❌ google-services.json NOT found');
  }
  
  console.log('');
}

// 3. Check for Google Sign-In code
console.log('3. Checking for Google Sign-In code...');
const codeFiles = [];
function findFiles(dir, ext) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.git')) {
      findFiles(filePath, ext);
    } else if (file.match(ext)) {
      codeFiles.push(filePath);
    }
  }
}

if (fs.existsSync('src')) {
  findFiles('src', /\.(ts|tsx|js|jsx)$/);
} else if (fs.existsSync('app')) {
  findFiles('app', /\.(ts|tsx|js|jsx)$/);
}

let foundConfig = false;
for (const file of codeFiles.slice(0, 20)) { // Limit to first 20 files
  try {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('GoogleSignin') || content.includes('google-signin')) {
      foundConfig = true;
      console.log(`   ✅ Found Google Sign-In code in: ${file}`);
      
      // Check for webClientId
      if (content.includes('webClientId')) {
        const webClientIdMatch = content.match(/webClientId:\s*['"]([^'"]+)['"]/);
        if (webClientIdMatch) {
          const clientId = webClientIdMatch[1];
          if (clientId.includes('.apps.googleusercontent.com')) {
            console.log(`   ✅ webClientId found: ${clientId.substring(0, 30)}...`);
            if (clientId.includes('-android')) {
              warnings.push('webClientId appears to be Android Client ID. Should use Web Client ID!');
              console.log('   ⚠️  WARNING: This looks like an Android Client ID!');
              console.log('      You should use the WEB Client ID from Google Cloud Console');
            }
          } else {
            warnings.push('webClientId format looks incorrect');
            console.log('   ⚠️  webClientId format may be incorrect');
          }
        } else {
          warnings.push('webClientId not found in code');
          console.log('   ⚠️  webClientId not found in GoogleSignin.configure()');
        }
      }
      break; // Found it, no need to check more
    }
  } catch (e) {
    // Skip files that can't be read
  }
}

if (!foundConfig) {
  warnings.push('Google Sign-In configuration code not found');
  console.log('   ⚠️  Google Sign-In configuration code not found');
}
console.log('');

// 4. Summary
console.log('='.repeat(50));
console.log('📋 SUMMARY');
console.log('='.repeat(50));
console.log('');

if (issues.length === 0 && warnings.length === 0) {
  console.log('✅ Configuration looks good!');
  console.log('');
  console.log('If you\'re still getting DEVELOPER_ERROR:');
  console.log('1. Verify SHA-1 fingerprint is added in Google Cloud Console');
  console.log('2. Ensure you\'re using WEB Client ID (not Android Client ID)');
  console.log('3. Clean and rebuild: cd android && ./gradlew clean && cd .. && npx react-native run-android');
} else {
  if (issues.length > 0) {
    console.log('❌ CRITICAL ISSUES:');
    issues.forEach(issue => console.log(`   - ${issue}`));
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    warnings.forEach(warning => console.log(`   - ${warning}`));
    console.log('');
  }
}

console.log('📖 For detailed troubleshooting, see: GOOGLE_SIGNIN_DETAILED_FIX.md');
console.log('');

