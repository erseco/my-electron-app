// scripts/fix-reactive-framework.js
const fs = require("fs");
const path = require("path");

/**
 * This hook runs after the app is packaged but before signing.
 * It fixes the missing Resources directory in ReactiveObjC.framework
 * that causes codesign verification errors on macOS ARM.
 */
exports.default = async function (context) {
  const appPath = context.appOutDir;
  const frameworkPath = path.join(
    appPath,
    "eXeLearning.app",
    "Contents",
    "Frameworks",
    "ReactiveObjC.framework"
  );

  const resourcesDir = path.join(frameworkPath, "Resources");
  if (!fs.existsSync(frameworkPath)) {
    console.warn("⚠️ ReactiveObjC.framework not found — skipping fix.");
    return;
  }

  if (!fs.existsSync(resourcesDir)) {
    console.log("🩹 Creating missing Resources folder in ReactiveObjC.framework...");
    fs.mkdirSync(resourcesDir, { recursive: true });
  } else {
    console.log("✅ ReactiveObjC.framework already has Resources folder.");
  }
};
