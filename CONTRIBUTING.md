# Contributing

Thanks for taking the time to contribute to `pons-client`.

## Getting started

- Use Node.js 20 or newer (see `.nvmrc`; `nvm use` picks it up).
- Install dependencies with `npm ci` so the lockfile is respected.

```bash
nvm use
npm ci
```

## Development workflow

| Command | Purpose |
| --- | --- |
| `npm run build` | Build `dist/` (ESM, CJS, and declarations) |
| `npm run dev` | Rebuild on change |
| `npm run typecheck` | Type-check without emitting |
| `npm run lint` | ESLint |
| `npm run format` | Write Prettier formatting |
| `npm run format:check` | Verify formatting |
| `npm test` | Run the unit tests |

Please run the full gate before opening or updating a pull request:

```bash
npm run typecheck && npm run lint && npm run format:check && npm run build && npm test
```

CI runs the same checks on Node 20 and 22, and the branch protection on `main` requires them to pass.

## Pull requests from forks

If you open a pull request from a fork, **please enable _Allow edits by maintainers_** on the pull request. It is a checkbox in the right-hand sidebar ("Allow edits and access to secrets by maintainers"), and it can be changed at any time.

This matters because:

- Workflows on fork pull requests start in an `action_required` state and need a maintainer to approve each run. Enabling maintainer edits lets us keep your branch current so CI stays useful.
- If the base branch has moved, a maintainer can rebase your branch instead of asking you to do it.
- For small fixes (a formatting nit, a missing test, a param rename) a maintainer can add a commit to your branch rather than opening a replacement pull request.

Without it, the usual fallback is to cherry-pick your commits onto a branch in this repository and open a superseding pull request. That works, but the merged PR is then authored by the maintainer, so the contribution is no longer attributed to you in the repository's contributor list or the release notes. We would rather merge your pull request.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): add something
fix(scope): correct something
docs: update readme
test(scope): cover something
chore(scope): maintenance
```

Keep commits focused. If a pull request is a single logical change, one commit is ideal.

## Reporting bugs

Open an issue using the bug report template and include:

- the package version,
- the Node.js version,
- a minimal reproduction,
- what you expected versus what happened.

## Security

Please do not open a public issue for security problems. Report them privately to the maintainers and give us a chance to fix them first.

## License

By contributing, you agree that your contributions are licensed under the MIT License.
