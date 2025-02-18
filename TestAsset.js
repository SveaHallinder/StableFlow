// Attempt 1: Default import
try {
import Asset from 'expo-asset';
console.log('Default import successful:', Asset);
} catch (e) {
console.error('Default import failed:', e);
}

// Attempt 2: Named import
try {
import { Asset } from 'expo-asset';
console.log('Named import successful:', Asset);
} catch (e) {
console.error('Named import failed:', e);
}

// Attempt 3: Direct .fx import
try {
import AssetFx from 'expo-asset/build/Asset.fx';
console.log('Direct .fx import successful:', AssetFx);
} catch (e) {
console.error('Direct .fx import failed:', e);
}

// Attempt 4: Relative path import
try {
import AssetFromPath from '../node_modules/expo-asset/build/Asset.fx';
console.log('Relative path import successful:', AssetFromPath);
} catch (e) {
console.error('Relative path import failed:', e);
}

// Attempt 5: Import * as syntax
try {
import * as AssetModule from 'expo-asset';
console.log('Import * as successful:', AssetModule);
} catch (e) {
console.error('Import * as failed:', e);
}

// Attempt 6: Dynamic import
async function testDynamicImport() {
try {
    const AssetDynamic = await import('expo-asset');
    console.log('Dynamic import successful:', AssetDynamic);
} catch (e) {
    console.error('Dynamic import failed:', e);
}
}

testDynamicImport();

