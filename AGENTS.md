# Spellforge release workflow

After a completed code or asset change, run the smoke tests, rebuild `Spellforge-Mobile.html`, and run `standalone-smoke-test.cjs`. Refresh `spellforge.zip` and `Spellforge-Mobile.zip` when delivering downloadable packages. Commit finished changes in this Spellforge Git repository and push them to its private GitHub remote. The ZIP files are release artifacts and are excluded from Git to avoid duplicate large assets. Keep this repository separate from the unrelated parent workspace.
