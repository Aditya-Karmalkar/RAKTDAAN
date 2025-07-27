#!/usr/bin/env node

// Simple deployment verification script
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Raktdaan Netlify Deployment Verification\n');

// Check if dist folder exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ Error: dist folder not found. Run "npm run build" first.');
  process.exit(1);
}

// Check if index.html exists in dist
const indexPath = path.join(distPath, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ Error: index.html not found in dist folder.');
  process.exit(1);
}

// Check required environment variables for production
const requiredEnvVars = [
  'VITE_CONVEX_URL',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_PROJECT_ID'
];

console.log('📋 Checking environment variables:');
let missingVars = [];

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: ${process.env[varName].substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: Not set`);
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.log('\n⚠️  Warning: Missing environment variables. Make sure to set these in Netlify:');
  missingVars.forEach(varName => console.log(`   - ${varName}`));
}

// Check if netlify.toml exists
const netlifyTomlPath = path.join(__dirname, 'netlify.toml');
if (fs.existsSync(netlifyTomlPath)) {
  console.log('✅ netlify.toml configuration found');
} else {
  console.log('❌ netlify.toml not found');
}

// Check if _redirects exists
const redirectsPath = path.join(__dirname, 'public', '_redirects');
if (fs.existsSync(redirectsPath)) {
  console.log('✅ SPA redirects configured');
} else {
  console.log('❌ _redirects file not found');
}

console.log('\n🎯 Production URL: https://curious-toucan-762.convex.cloud');
console.log('\n📚 Next steps:');
console.log('1. Set environment variables in Netlify dashboard');
console.log('2. Deploy using: netlify deploy --prod');
console.log('3. Or connect your Git repository to Netlify');

console.log('\n✅ Ready for deployment!');
