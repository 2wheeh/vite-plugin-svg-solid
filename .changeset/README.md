Run `pnpm changeset` for each user-facing change and commit the generated file.
The release workflow opens a version PR; merging it publishes to npm after verification.
Use `pnpm version:packages` to apply pending changesets locally.
