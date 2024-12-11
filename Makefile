dev:
	bun run tauri dev

build:
	bun run tauri build --no-bundle

open_release:
	open src-tauri/target/release

build_dmg:
	bun run tauri build

open_app_folder:
	open ~/Library/Application Support/io.kbl.alic

release_major:
	bun run scripts/release.ts major

release_minor:
	bun run scripts/release.ts minor

release_patch:
	bun run scripts/release.ts patch
