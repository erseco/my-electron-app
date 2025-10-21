const path = require("path");
const { stapleApp } = require("@electron/notarize");

/**
 * Staples notarization tickets to generated macOS artifacts (DMG/PKG).
 * ZIP archives cannot be stapled and are skipped automatically.
 */
exports.default = async function stapleArtifacts(context) {
  const { artifactPaths, electronPlatformName } = context;
  if (electronPlatformName !== "darwin") {
    return;
  }

  if (process.env.SKIP_NOTARIZE === "1") {
    console.warn("⚠️  SKIP_NOTARIZE is set — skipping stapling.");
    return;
  }

  if (!Array.isArray(artifactPaths) || artifactPaths.length === 0) {
    return;
  }

  const appleId = process.env.APPLE_ID;
  const appPassword =
    process.env.APPLE_APP_SPECIFIC_PASSWORD || process.env.APPLE_APP_PASSWORD;
  const teamId = process.env.APPLE_TEAM_ID;

  if (!appleId || !appPassword || !teamId) {
    console.warn(
      "⚠️  Stapling skipped because notarization credentials are missing."
    );
    return;
  }

  for (const artifact of artifactPaths) {
    const ext = path.extname(artifact).toLowerCase();
    if (ext !== ".dmg" && ext !== ".pkg") {
      continue;
    }

    const name = path.basename(artifact);
    console.log(`📎 Stapling notarization ticket to ${name}...`);
    try {
      await stapleApp(artifact);
      console.log(`✅ Stapled ticket to ${name}.`);
    } catch (error) {
      console.warn(`⚠️  Failed to staple ${name}:`, error);
    }
  }
};
