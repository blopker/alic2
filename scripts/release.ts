// scripts/release.ts
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function updateVersion(type: "major" | "minor" | "patch") {
  // Read current version from Cargo.toml
  const cargoPath = path.join("src-tauri", "Cargo.toml");
  const cargoToml = fs.readFileSync(cargoPath, "utf8");
  const versionMatch = cargoToml.match(/version = "(\d+)\.(\d+)\.(\d+)"/);

  if (!versionMatch) {
    throw new Error("Could not find version in Cargo.toml");
  }

  let [, major, minor, patch] = versionMatch.map(Number);

  // Update version numbers
  switch (type) {
    case "major":
      major++;
      minor = 0;
      patch = 0;
      break;
    case "minor":
      minor++;
      patch = 0;
      break;
    case "patch":
      patch++;
      break;
  }

  const newVersion = `${major}.${minor}.${patch}`;

  // Update Cargo.toml
  const newCargoToml = cargoToml.replace(
    /version = "\d+\.\d+\.\d+"/,
    `version = "${newVersion}"`,
  );
  fs.writeFileSync(cargoPath, newCargoToml);

  // Update package.json
  const packagePath = "package.json";
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  packageJson.version = newVersion;
  fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

  return newVersion;
}

function main() {
  const type = Bun.argv[2] as "major" | "minor" | "patch";
  if (!["major", "minor", "patch"].includes(type)) {
    console.error("Usage: bun run release.ts <major|minor|patch>");
    process.exit(1);
  }

  try {
    // Make sure we're on main branch and it's clean
    execSync("git diff-index --quiet HEAD --");
    execSync("git checkout main");
    execSync("git pull origin main");

    // Update version
    const newVersion = updateVersion(type);

    // Create changelog entry
    const date = new Date().toISOString().split("T")[0];
    const changelogEntry = `\n## [${newVersion}] - ${date}\n\n- TODO: Add changes here\n`;
    fs.appendFileSync("CHANGELOG.md", changelogEntry);

    // Create commit and tag
    execSync("git add .");
    execSync(`git commit -m "chore: release v${newVersion}"`);
    execSync(`git tag -a v${newVersion} -m "Release v${newVersion}"`);

    // Create and push release branch
    execSync("git checkout -b release");
    execSync("git push origin release --force");
    execSync("git push origin --tags");

    // Go back to main
    execSync("git checkout main");

    console.log(`\nReleased version ${newVersion}!`);
    console.log("1. Update CHANGELOG.md with the actual changes");
    console.log("2. Wait for GitHub Actions to finish");
    console.log("3. Go to GitHub releases to review and publish");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
