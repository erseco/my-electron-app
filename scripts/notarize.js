const path = require("path");
const { notarize, stapleApp } = require("@electron/notarize");

/**
 * Requests Apple notarization for the signed macOS app bundle.
 * The hook is only executed for macOS builds and when the required
 * environment variables are present.
 */
exports.default = async function notarizeApp(context) {
  const { electronPlatformName, appOutDir, packager } = context;
  if (electronPlatformName !== "darwin") {
    return;
  }

  if (process.env.SKIP_NOTARIZE === "1") {
    console.warn("⚠️  SKIP_NOTARIZE is set — skipping notarization.");
    return;
  }

  const appleId = process.env.APPLE_ID;
  const appPassword =
    process.env.APPLE_APP_SPECIFIC_PASSWORD || process.env.APPLE_APP_PASSWORD;
  const teamId = process.env.APPLE_TEAM_ID;

  if (!appleId || !appPassword || !teamId) {
    console.warn(
      "⚠️  Notarization credentials missing (APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, APPLE_TEAM_ID). Skipping notarization."
    );
    return;
  }

  const appName = packager.appInfo.productFilename;
  const appBundleId = packager.appInfo.appId;
  const appPath = path.join(appOutDir, `${appName}.app`);
  const ascProvider = process.env.APPLE_ASC_PROVIDER;
  const tool = process.env.NOTARIZE_TOOL || "notarytool";

  console.log(`🔐 Submitting ${appName} for Apple notarization using ${tool}...`);

  try {
    await notarize({
      appBundleId,
      appPath,
      appleId,
      appleIdPassword: appPassword,
      teamId,
      ascProvider,
      tool,
    });
    console.log(`✅ Notarization request submitted successfully for ${appName}.`);

    console.log(`📎 Stapling ticket to ${appName}.app...`);
    await stapleApp(appPath);
    console.log(`✅ Stapled notarization ticket to ${appName}.app.`);
  } catch (error) {
    console.error("❌ Notarization failed:", error);
    throw error;
  }
};
