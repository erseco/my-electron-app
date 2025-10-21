// scripts/fix-reactive-framework.js
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

/**
 * Runs after the app is packaged but before signing.
 * - Ensures ReactiveObjC.framework has a Resources dir.
 * - Removes extended attributes and AppleDouble files from the app bundle.
 */
exports.default = async function (context) {
  const outDir = context.appOutDir;
  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(outDir, `${appName}.app`);

  // Ensure ReactiveObjC.framework/Resources exists
  const reactive = path.join(appPath, 'Contents', 'Frameworks', 'ReactiveObjC.framework');
  const resourcesDir = path.join(reactive, 'Resources');
  if (fs.existsSync(reactive) && !fs.existsSync(resourcesDir)) {
    console.log('🩹 Creating Resources in ReactiveObjC.framework…');
    fs.mkdirSync(resourcesDir, { recursive: true });
  } else {
    console.log('✅ ReactiveObjC.framework already has Resources folder.');
  }

  // Remove extended attributes (FinderInfo / ResourceFork / quarantine)
  try {
    console.log('🧹 Stripping extended attributes (xattr) from app bundle…');
    execFileSync('/usr/bin/xattr', ['-rc', appPath], { stdio: 'inherit' });
  } catch (e) {
    console.warn('⚠️ xattr cleanup:', e.message);
  }

  // Merge resource forks and remove AppleDouble files (._*)
  try {
    console.log('🧽 Cleaning AppleDouble files (dot_clean)…');
    execFileSync('/usr/bin/dot_clean', ['-m', appPath], { stdio: 'inherit' });
  } catch (e) {
    console.warn('⚠️ dot_clean:', e.message);
  }

  // Extra safety: delete stray AppleDouble files if any remain
  try {
    execFileSync('/usr/bin/find', [appPath, '-name', '._*', '-delete'], { stdio: 'inherit' });
  } catch (e) {
    console.warn('⚠️ find delete AppleDouble:', e.message);
  }

  // Optional: quick check that no bad xattrs remain
  try {
    const out = execFileSync('/usr/bin/xattr', ['-prl', appPath], { encoding: 'utf8' });
    if (out.match(/(FinderInfo|ResourceFork)/)) {
      throw new Error('FinderInfo/ResourceFork still present after cleanup');
    }
  } catch (e) {
    if (!/No such xattr/.test(e.message)) {
      console.warn('⚠️ post-check:', e.message);
    }
  }
};
