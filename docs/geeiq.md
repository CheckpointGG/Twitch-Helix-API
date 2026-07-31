# Twitch Helix API Client — GeeIQ documentation

> _Node client library that builds Twitch Helix request URLs, attaches Twitch auth headers, validates parameters, and normalises every response into one payload envelope._

- **Type:** Internal library (Node, CommonJS) — a fork of a third-party npm package
- **Purpose:** Give GeeIQ services one place to call Twitch Helix from, with every request path relative to a configurable base URL so the same client can reach Twitch directly or an internal proxy
- **Status:** Maintenance — the default branch (`master`) has not changed since 2020-06-30

This document is the GeeIQ view of a forked repository. The root [`README.md`](../README.md) keeps upstream's text unedited; its GeeIQ block carries the endpoint table and the export index, and links here for everything else.

---

## Name chain

| Link | Value |
|---|---|
| Repo | `Twitch-Helix-API` |
| `package.json` `name` | **Two identities.** `twitch-helix-api` (v1.0.2) on `origin/master`, the default branch — this is what every git-dependency consumer resolves to. `@checkpointgg/twitch-helix-api` (v1.1.0) on the unmerged branch `feat/use-private-github-npm` and on tag `v1.1.0`. |
| Serverless `service:` / ECR image | none — library. No `serverless.{yml,ts}` and no `Dockerfile` exists at any of the 21 commits on any of the 5 refs, so there is no service name and no image. |
| CloudFormation stack | none — library; nothing is provisioned. |
| Deployed K8s workload (kind + name) / Lambda function | none — library. It runs inside the process of whichever service imports it, so its runtime identity is that consumer's. |
| Event-source names | none — not invoked. Consumed as a dependency; see [Import surface](#import-surface). |
| Public host / API Gateway id | **none owned.** Three `*.execute-api.us-east-2.amazonaws.com` ids appear in `test/sdk.test.js` across history as values *assigned to* `apiUrl`: `lmqdy3sms6` (stage `/dev`, current) and previously `qh3x3rgjg4` and `ubfoa6rl3h`. This library owns none of them — they are bases it was pointed at. |
| CDN distribution id | none — nothing is served. |
| Other runtime labels | Upstream identity `Glyciant/Twitch-Helix-API`, and the public npmjs.com package name `twitch-helix-api`, which belongs to upstream rather than to GeeIQ. Registry coordinates for the scoped identity — registry `https://npm.pkg.github.com`, scope `@checkpointgg` — are configured only on the unmerged branch. Sole tag: `v1.1.0` (annotated), which is not on the default branch. |

---

## Architecture Context

| Field | Detail |
|---|---|
| Part of | Data Platform — social data acquisition |
| Role in Platform | Shared Twitch Helix client. It decides the Helix route names and query parameters that its consumers reach, and lets a consumer swap the base URL so those same routes resolve against an internal proxy instead of `api.twitch.tv`. |
| Upstream Dependencies | None consumed. This is a library: it is imported, never invoked. Its three runtime dependencies are `query-string` (v5), `restler` (v3.4) as the HTTP client, and `jest` (declared under `dependencies` rather than `devDependencies`). |
| Downstream Dependencies | Twitch — the Helix API at whatever base `apiUrl` names (default `https://api.twitch.tv/helix`), plus `https://id.twitch.tv/oauth2/*` for the two `authentication.*` calls, whose URLs are hardcoded and unaffected by `apiUrl`. |

Architecture docs: https://docs.geeiq.com/architecture/

**Who consumes this library is not visible from inside it.** A library carries no record of its importers, and this repo contains none. Establishing the consumer set means searching other repos' `package.json` for `twitch-helix-api`.

---

## Fork provenance and the GeeIQ delta

This repo is a genuine GitHub fork: `gh repo view --json isFork,parent` reports `isFork: true` with parent `Glyciant/Twitch-Helix-API`. The repository is **public**.

- **Upstream history:** three commits by `Glyciant <glyciant@gmail.com>`, all dated 2017-11-26, ending at `64db789` ("Updated Version Number"). That commit is the fork point.
- **GeeIQ delta:** eighteen commits from `7b426a9` (2019-03-01) onward, which is also the repository's creation date. Contributors are Andrew Burden, Kay (`kay@joincheckpoint.com`), Harrison Gittos and Michel Saoula, plus one external contribution from Joel Graves (`NoLifeJoel`) merged as PR #1.
- `git diff 64db789 origin/master` is the subject of this document; the per-change summary is the "What this fork changed" table in the root README.

Upstream's own documentation — parameter tables, response shapes, the Issues and Contributions sections — remains accurate for the shared surface and is left in place in `README.md`.

---

## Installing

Consumers install from git, not from a registry:

```jsonc
// package.json
"dependencies": {
  "twitch-helix-api": "git+https://github.com/CheckpointGG/Twitch-Helix-API.git"
}
```

Three consequences worth knowing before you depend on this:

1. **A git reference with no `#<ref>` resolves to the default-branch tip at install time.** The default branch is **`master`** (confirmed via `git symbolic-ref refs/remotes/origin/HEAD`), currently `e43ebc3`. Two installs on different days can therefore produce different code with no lockfile change to show it. Pin with `#e43ebc3` or `#v1.1.0` if reproducibility matters — noting that `v1.1.0` is a different package identity (see [Release](#release)).
2. **The package installs as `twitch-helix-api`**, unscoped, because that is `master`'s `package.json` `name`. Tag `v1.1.0` would install as `@checkpointgg/twitch-helix-api`.
3. **`lib/games.js` on `master` depends on that unscoped name.** `getTopGames` reaches its HTTP helper by absolute self-require, `require('twitch-helix-api/lib/request')`, rather than by the relative `./request` every other module uses. It resolves only while the package is installed at `node_modules/twitch-helix-api`. The relative form exists, but only on the unmerged `feat/use-private-github-npm` branch, where commit `f907eaf` ("fix errors") introduced it because renaming the package to `@checkpointgg/twitch-helix-api` broke the self-require.

The repository is hosted on the **organisation** account, `github.com/CheckpointGG/Twitch-Helix-API` — confirmed from `git remote -v`. It is not served from a personal account.

---

## Import surface

A library is not invoked, so there is no trigger to document. It is consumed as a dependency and runs inside the importing process.

```js
const api = require("twitch-helix-api");   // -> index.js (package.json "main")

api.clientID = process.env.TWITCH_CLIENT_ID;   // consumer's own variable name
api.token    = process.env.TWITCH_TOKEN;
// api.apiUrl = "<internal proxy base>";       // optional; see Configuration

const res = await api.streams.getStreams({ user_login: "somechannel", first: 100 });
```

- **Module format:** CommonJS only. There is no build step, no `main`/`module`/`exports` map beyond `"main": "index.js"`, and no TypeScript types. A TypeScript consumer needs its own declarations or `require`.
- **Deep imports** resolve, because `package.json` declares no `files` array and there is no `.npmignore`, so every tracked path ships:
  - `twitch-helix-api/lib/request` — the HTTP helpers, not on the root export. Used this way by `lib/games.js` itself.
  - `twitch-helix-api/lib/helpers` — `generatePayload` and `validDateFormat`, not on the root export.
  - `twitch-helix-api/lib/{authentication,games,streams,users,videos,clips}` — the same objects the root export exposes.
- **`test/` ships with the package too**, for the same reason.

---

## Export inventory

`index.js` exposes three mutable configuration properties and six modules. Every method takes a single `data` object and returns a `Promise`.

### Configuration properties

| Export | Default | Purpose |
|---|---|---|
| `clientID` | `""` | Sent as the `Client-ID` header on every request `lib/request.js` makes. |
| `token` | `""` | Process-wide default token. Used whenever a call does not pass its own. |
| `apiUrl` | `"https://api.twitch.tv/helix"` | Base URL that all ten Helix paths are appended to. Reassigning it re-points the whole client. |

### `authentication` — `lib/authentication.js`

| Signature | Purpose |
|---|---|
| `getAccessToken({ client_id, client_secret, redirect_uri, code, state? })` | Exchanges an OAuth **authorization code** for a token: `POST https://id.twitch.tv/oauth2/token?…` with `grant_type=authorization_code`. Rejects the call with a 400 envelope when `client_secret`, `redirect_uri` or `code` is missing. Note that `client_id` is *not* among the guarded parameters, so it is sent as `undefined` if omitted. The URL is hardcoded and ignores `apiUrl`. |
| `checkToken({ token })` | Validates a token: `GET https://id.twitch.tv/oauth2/validate`, with the token sent as `Authorization: OAuth <token>`. Requires `token`. Hardcoded URL. |

### `games` — `lib/games.js`

| Signature | Purpose |
|---|---|
| `getGames({ id?, name? })` | `GET {apiUrl}/games`. Requires at least one of `id` or `name`; each capped at 100 values. |
| `getTopGames({ before?, after?, first? })` | `GET {apiUrl}/games/top`. Performs no parameter validation and dereferences `data` unguarded, so it requires an object argument. This is the one function that reaches its HTTP helper by absolute self-require — see [Installing](#installing). |

### `streams` — `lib/streams.js`

| Signature | Purpose |
|---|---|
| `getStreams({ after?, before?, community_id?, first?, game_id?, language?, type?, user_id?, user_login? })` | `GET {apiUrl}/streams`. Validates `first` in 0–100, each list parameter at 100 values, and `type` against `all` / `live` / `vodcast`. Takes no argument at all if you want Twitch's defaults. |
| `getStreamsMetadata({ …same as getStreams })` | `GET {apiUrl}/streams/metadata`. Identical parameter set and identical validation. |

### `users` — `lib/users.js`

| Signature | Purpose |
|---|---|
| `getUsers({ id?, login? })` | `GET {apiUrl}/users`. Requires at least one of `id` or `login`; each capped at 100. |
| `getUsersFollows({ from_id?, to_id?, first?, after?, before? })` | `GET {apiUrl}/users/follows`. Requires `from_id` or `to_id`; `first` capped at 100. |
| `getUserTags({ id })` | `GET {apiUrl}/streams/tags`, sending the caller's `id` as the **`broadcaster_id`** query parameter. Requires `id`, limit 1. Exported on `users` but reaches a `/streams/` path. |
| `updateUser({ token, description })` | `PUT {apiUrl}/users?description=…`. The only write in the library, and the only function that forwards a **per-call token** to `lib/request.js` rather than relying on the module-level one. Requires both `token` and `description`. |

### `videos` — `lib/videos.js`

| Signature | Purpose |
|---|---|
| `getVideos({ id?, user_id?, game_id?, first?, language?, period?, sort?, type?, after?, before? })` | `GET {apiUrl}/videos`. Requires one of `id`, `user_id`, `game_id`. Validates `first` in 0–100, `language` limit 1, `period` against `all`/`day`/`month`/`week`, `sort` against `time`/`trending`/`views`, `type` against `all`/`upload`/`archive`/`highlight`. |

### `clips` — `lib/clips.js`

| Signature | Purpose |
|---|---|
| `getClips({ id?, broadcaster_id?, game_id?, first?, after?, before?, sort?, type?, language?, started_at?, ended_at? })` | `GET {apiUrl}/clips`. Requires one of `id`, `broadcaster_id`, `game_id`; rejects `ended_at` without `started_at`. `started_at` and `ended_at` are validated by `helpers.validDateFormat`, which returns `true` unconditionally, so RFC3339 conformance is not in fact checked — and neither timestamp is forwarded in the query string. |

### Not on the root export

| Module | Contents |
|---|---|
| `lib/request.js` | `get`, `post`, `put` — send `Authorization: Bearer <token>`. `getLegacy`, `postLegacy` — send `Authorization: OAuth <token>` plus `Accept: application/vnd.twitchtv.v5+json`. All five set `Client-ID` from `index.clientID`, and all five attach rate-limit headers to the resolved body. |
| `lib/helpers.js` | `generatePayload(code, status, message, response)` builds the response envelope and lifts `__ratelimit` out of the body into the envelope's `ratelimit` field. `validDateFormat()` returns `true` unconditionally. |

### Response envelope

Every export resolves — never rejects — with the same shape:

```js
{ code, status, message, response, ratelimit }
```

`code`/`status` are `200`/`"success"` for a dispatched request and `400`/`"bad_request"` for a parameter-validation failure, with `message` describing the specific problem and `response` set to `null`. `response` otherwise holds whatever `restler` parsed from Twitch. `ratelimit` is `{ limit, remaining, reset }` when Twitch sent `ratelimit-limit`, and `null` when it did not.

Two consequences for callers: a validation failure arrives as a resolved `400` envelope rather than a thrown error, so `.catch()` will not see it and `code` must be checked. And the `200` is assigned by this library on dispatch, not read from Twitch — a Twitch 4xx or 5xx still resolves as `code: 200` with the error body in `response`.

---

## Endpoints constructed

The full table lives in the root [`README.md`](../README.md#endpoints-constructed) so that it reaches consumers at install time. Ten paths are relative to `apiUrl`; the two `authentication.*` URLs are hardcoded to `id.twitch.tv`.

Several of the constructed paths date from the 2017–2020 Helix surface. Verify a path against Twitch's current API reference before relying on it; this repo is evidence of what is *sent*, not of what Twitch still serves.

---

## How requests are authenticated

**Two module-level mutable properties on the package's own `index.js`, and no token lifecycle of any kind.**

- **Where the credential lives:** `index.clientID` and `index.token`, both initialised to `""`. A consumer assigns them after `require`. There is no environment-variable read anywhere in this library at any commit on any ref, no file, no keychain and no Secrets Manager call — the values arrive only by assignment, so the storage decision belongs entirely to the consumer.
- **How it is attached:** `lib/request.js` sets `Client-ID: index.clientID` on all five helpers, and `Authorization` to `(data.token || index.token || "")` — per-call token first, module-level token second, empty string last. There is no host allowlist: the header is attached to whatever URL the helper is given, including a non-Twitch `apiUrl`.
- **Two header schemes.** `get`/`post`/`put` send `Authorization: Bearer <token>`, used by all ten Helix calls. `getLegacy`/`postLegacy` send `Authorization: OAuth <token>` with `Accept: application/vnd.twitchtv.v5+json`, used only by the two `authentication.*` calls.
- **In practice the module-level token is the only one used.** All ten Helix calls pass `{}` as the helper's `data` argument, so `data.token` is always `undefined` and the token always comes from `index.token`. `users.updateUser` is the sole exception, passing `{ token: data.token }`.
- **No app-only OAuth2.** `getAccessToken` implements the user-delegated **authorization code** grant — it requires `client_secret`, `redirect_uri` and a `code`, and sends `grant_type=authorization_code`. `grant_type=client_credentials` appears nowhere in the repo, so the app-access-token flow is not implemented here; a consumer needing one must obtain it itself and assign it to `index.token`.
- **No token cache, and therefore no expiry handling.** Nothing is stored, so there is no cache entry, no expiry timestamp, no `isExpired`-style predicate, no refresh timer and no `grant_type=refresh_token` path. Twitch's `expires_in` and `refresh_token` are passed through untouched inside the `response` field and never read. Token acquisition, storage, expiry and renewal are wholly the consumer's responsibility.
- **No tenant, organisation or API-key header** is sent — only `Client-ID`, `Authorization`, `Content-Type` and, on the legacy helpers, `Accept`.
- **One identity per process.** `clientID` and `token` are module-level state on a singleton resolved through Node's require cache, so two components in one process share one Twitch identity and the later assignment wins. Per-call override exists only on `updateUser`.

---

## Services & Data Access

**No data-access rows, and that is the correct answer rather than a gap.** This library touches no datastore. There is no table, collection, index, bucket path, topic or SQL statement anywhere in it, and no database or storage client among its dependencies — the only outbound mechanism is `restler` HTTP.

Access attribution belongs to the consumer: a service that fetches Twitch streams through this library records that call in its own documentation. Attributing it here as well would double-count every consumer's footprint against a package that opens no connection of its own.

The same reasoning applies to the ten Helix paths. Their base URL is a consumer-supplied value, so the *target* of those calls is the consumer's decision, and the edge belongs to the consumer. What this library fixes is the **path and query string**, which is why the endpoint table is the artefact to read. The two `authentication.*` calls are the exception — `https://id.twitch.tv` is hardcoded here — so any consumer calling `authentication.getAccessToken` or `authentication.checkToken` reaches `id.twitch.tv` directly, whatever it has set `apiUrl` to.

---

## Outputs & Side Effects

- Issues HTTP requests to the base URL held in `index.apiUrl` — a GET for nine exports and a PUT for `users.updateUser`, which sets a Twitch user's `description` and is the only state-changing call in the library.
- Issues HTTP requests to `https://id.twitch.tv/oauth2/token` and `https://id.twitch.tv/oauth2/validate` when `authentication.*` is called, regardless of `apiUrl`.
- Mutates the caller's resolved response body: `applyRateLimit` assigns a `__ratelimit` property onto the parsed object, and `generatePayload` then `delete`s that property from it. A caller holding a reference to the body sees it modified.
- Assigns several implicit globals as a side effect of loading and calling. `lib/streams.js`, `lib/games.js`, `lib/videos.js` and `lib/clips.js` each begin with a `var` declaration whose first line lacks a trailing comma, so `request`, `helpers` and `index` are assigned to the global object rather than declared locally; and most exports assign `queries` without declaring it. This works under sloppy mode and would throw under `"use strict"` or in an ES module.

---

## Release

**Nothing is released from the default branch, and nothing is deployed at all.**

- **`master` has no workflow.** `git ls-tree -r origin/master` contains no `.github/` path. Because `gh workflow list` reads the default branch, it returns nothing, which reads as "this repo has no CI" — the same trap as `common-utils` (ENG-6843). CI does exist, on another ref.
- **The publish workflow exists only on `feat/use-private-github-npm`**, an unmerged branch whose PR **#3 was closed, not merged**. It publishes `@checkpointgg/twitch-helix-api` to `https://npm.pkg.github.com` under scope `@checkpointgg`, authenticating with `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`. Its `build` job runs `yarn install && yarn test`; its `publish-gpr` job runs `yarn version --minor`, `git push --tags && git push`, then `yarn publish`.
- **That workflow can no longer fire at all.** Its trigger is `push` filtered to `branches: [master]`, but the file exists only on a branch that is not `master`. GitHub resolves workflows from the pushed ref, so a push to `master` finds no workflow file and a push to the feature branch is excluded by the filter. Commit `29df274` ("revert back publish rule") created this state by restoring the `master` filter over a temporary `on: [push]`.
- **It did run once, while the trigger was `on: [push]`.** Commit `f187566` is authored *and* committed by `AechGG <AechGG@users.noreply.github.com>` with the subject `v1.1.0` and a sole change of `"version": "1.0.0"` → `"1.1.0"` — the signature of `yarn version --minor` executed under the workflow's own `git config user.email "$GITHUB_ACTOR@users.noreply.github.com"` step. Since `publish-gpr` declares `needs: build`, `yarn test` passed too. Whether the subsequent `yarn publish` succeeded **cannot be established**: the run logs are long past retention (`gh run list` is empty) and `gh release list` is empty. The workflow declares no `permissions:` block, so the job received the repository's default token permissions; `yarn publish` needs `packages: write` and the preceding `git push` needs `contents: write`, so a default-read-only token is one plausible reason it did not land.
- **Tags.** One tag exists, `v1.1.0` (annotated), created by that run. It is **not on the default branch** — `git for-each-ref --contains v1.1.0` returns only `refs/remotes/origin/feat/use-private-github-npm` and the tag itself. There are no GitHub releases.
- **Version numbers disagree across refs.** `master` says `1.0.2`; the branch and tag say `1.1.0` under a different package name, having first been set *down* to `1.0.0` by `801816b`. The `1.1.0` line is not a successor to `1.0.2` — the two lines diverge.

**So the release procedure for a consumer is: there is none.** Consumers take the default-branch tip via git; changing what they receive means merging to `master`.

---

## Configuration

**Configuration is part of this library's public API, and it is not environment-based.** There are no `process.env` reads at any commit on any ref, so there is no `.env.example` to write. The surface is the three mutable properties on the root export, documented in [Export inventory](#export-inventory): `clientID`, `token` and `apiUrl`. Assign them after `require`, before the first call.

`apiUrl` is the one that matters architecturally. It defaults to `https://api.twitch.tv/helix`, and setting it to another base re-points all ten Helix calls while leaving their paths and query strings unchanged — which is what makes this library usable against a path-forwarding proxy. `test/sdk.test.js` demonstrates the pattern, assigning an API Gateway stage URL to `TwitchApi.apiUrl`. The two `authentication.*` URLs are hardcoded and unaffected.

---

## Testing

```bash
yarn install     # or: npm install
yarn test        # -> jest
```

- **Framework:** Jest, via `"test": "jest"`. `jest@^26.0.1` is declared under `dependencies` rather than `devDependencies`, so it installs into every consumer's tree as a runtime dependency.
- **Coverage:** one file, `test/sdk.test.js`, with two assertions — `streams.getStreams({ first: 1 })` and `games.getTopGames({ first: 1 })` each expected to return `code: 200`. Eight of the ten exports are untested, as is all parameter validation.
- **These tests are not hermetic and are not expected to pass.** They set `TwitchApi.apiUrl` to `https://lmqdy3sms6.execute-api.us-east-2.amazonaws.com/dev` and issue real network calls to it, with no fixture, mock or `nock`. A run outcome therefore depends on whether that API Gateway stage still exists and answers. Because the library resolves `code: 200` on dispatch rather than on Twitch's status, the assertions pass for any response that comes back at all.
- **There is no linter.** No ESLint, Biome or Prettier configuration exists at any ref, and there is no `lint` script.
- **There is no CI on the default branch** — no `pull_request` workflow anywhere, on any ref, so a PR against `master` receives no automated check of any kind. The only workflow that ever existed is the publish workflow described under [Release](#release).
- **No Node version is declared on the default branch.** `engines` and `.nvmrc` exist only on the unmerged branch `michel/eng-5704-runtime-version-pinning-across-estate-nvmrc-engines` (ENG-5704), which pins Node 20 and adds a `CLAUDE.md` describing the bump procedure. That branch is not merged, so `master` declares no runtime version.

---

## Further Reading

- [Upstream project — `Glyciant/Twitch-Helix-API`](https://github.com/Glyciant/Twitch-Helix-API) — the fork parent; its README body is preserved in [`README.md`](../README.md).
- [Twitch API reference](https://dev.twitch.tv/docs/api/) — authoritative for which of the constructed paths Twitch still serves.
- [Twitch OAuth documentation](https://dev.twitch.tv/docs/authentication/) — for the authorization-code flow `authentication.getAccessToken` implements, and for the app-access-token flow it does not.
- [GeeIQ architecture docs](https://docs.geeiq.com/architecture/)
