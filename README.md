<!-- ==================== BEGIN GEEIQ BLOCK ==================== -->
<!-- Added by GeeIQ/CheckpointGG. Everything below the END GEEIQ BLOCK marker is       -->
<!-- upstream Glyciant/Twitch-Helix-API content, preserved verbatim and not edited.    -->

# Twitch Helix API Client (GeeIQ fork)

> _Node client library that builds Twitch Helix request URLs, attaches Twitch auth headers, validates parameters, and normalises every response into one payload envelope._

- **Type:** Internal library (Node, CommonJS) — a fork of a third-party npm package
- **Purpose:** Give GeeIQ services one place to call Twitch Helix from, with every request path relative to a configurable base URL so the same client can talk to Twitch directly or to an internal proxy
- **Status:** Maintenance — the default branch (`master`) has not changed since 2020-06-30

This is a **GeeIQ fork of [`Glyciant/Twitch-Helix-API`](https://github.com/Glyciant/Twitch-Helix-API)**. It is **not deployed** and, from the default branch, **not published to any registry** — it is consumed as a **git dependency**.

**Full GeeIQ documentation: [`docs/geeiq.md`](./docs/geeiq.md)** — name chain, install and import surface, the complete export inventory with signatures, the authentication model, release status, the fork delta, and configuration.

---

## Read this before following the upstream instructions below

The upstream text is preserved unedited, and three of its statements are **not true of this fork**:

| Upstream statement | What is actually the case |
|---|---|
| `npm install --save twitch-helix-api` (Installation) | That installs **upstream's public package from npmjs.com**, which is a different artefact from this fork. GeeIQ consumers install from git — see [Installing](./docs/geeiq.md#installing). |
| "Get Access Token (**Kraken Endpoint**)" (About) | `lib/authentication.js` has posted to `https://id.twitch.tv/oauth2/token` since commit `891e8aa` (2020-04-07), and `checkToken` calls `https://id.twitch.tv/oauth2/validate`. No Kraken URL remains anywhere in the code. |
| The About endpoint list | It omits `clips.getClips` and `games.getTopGames`, both added by this fork. The complete set of twelve is in [Endpoints constructed](#endpoints-constructed) below. |

Two further fork behaviours the upstream text does not describe:

- **Every Helix path is built from a mutable `apiUrl` property** (`index.js`), which defaults to `https://api.twitch.tv/helix`. Setting `apiUrl` re-points all ten Helix calls at another base — that is what commit `e43ebc3`, "Added all twitch endpoints to the proxy", accomplished. The two `authentication.*` calls are the exception: their URLs are hardcoded to `id.twitch.tv` and always go direct.
- **Responses carry a `ratelimit` field** alongside `code`/`status`/`message`/`response`, populated from Twitch's `ratelimit-limit` / `ratelimit-remaining` / `ratelimit-reset` headers when present.

---

## What this fork changed

| Change | Commit |
|---|---|
| `clips.getClips()`, `games.getTopGames()`, pagination for `videos.getVideos()` | `7b426a9` (2019-03-01) |
| `users.getUserTags()` | `4e39303` (2019-03-27) |
| `ratelimit` details on the response object | `a250c82`, `52038c1` (2019-05-30) |
| Module-level `token`, so a token need not be passed per call; auth URLs moved from Kraken to `id.twitch.tv`; null-safety in `generatePayload` and `applyRateLimit` | `891e8aa` (2020-04-07) |
| Configurable `apiUrl`, and all remaining hardcoded Helix URLs made relative to it | `e53861e`…`e43ebc3` (2020-06-22 → 2020-06-30) |

---

## Endpoints constructed

**This is the load-bearing artefact of this repo.** Twitch Helix route names for the estate are assembled *here*, not in the calling service, so this table is the only place these paths are written down.

`{apiUrl}` is the value of `index.apiUrl`, default `https://api.twitch.tv/helix`. Consumers may reassign it, in which case these paths are appended to whatever base they set.

| Export | Method | Path constructed | Query parameters sent |
|---|---|---|---|
| `streams.getStreams` | GET | `{apiUrl}/streams?` | `after`, `before`, `community_id`, `first`, `game_id`, `language`, `type`, `user_id`, `user_login` |
| `streams.getStreamsMetadata` | GET | `{apiUrl}/streams/metadata?` | `after`, `before`, `community_id`, `first`, `game_id`, `language`, `type`, `user_id`, `user_login` |
| `users.getUsers` | GET | `{apiUrl}/users?` | `id`, `login` |
| `users.getUsersFollows` | GET | `{apiUrl}/users/follows?` | `from_id`, `to_id`, `first`, `after`, `before` |
| `users.getUserTags` | GET | `{apiUrl}/streams/tags?` | `broadcaster_id` — taken from the caller's `id` argument |
| `users.updateUser` | PUT | `{apiUrl}/users?` | `description` |
| `videos.getVideos` | GET | `{apiUrl}/videos?` | `id`, `user_id`, `game_id`, `first`, `language`, `period`, `sort`, `type`, `after`, `before` |
| `clips.getClips` | GET | `{apiUrl}/clips?` | `id`, `broadcaster_id`, `game_id`, `first`, `after`, `before`, `sort`, `type`, `language` |
| `games.getGames` | GET | `{apiUrl}/games?` | `id`, `name` |
| `games.getTopGames` | GET | `{apiUrl}/games/top?` | `before`, `after`, `first` |
| `authentication.getAccessToken` | POST | `https://id.twitch.tv/oauth2/token?` — **hardcoded, ignores `apiUrl`** | `client_id`, `client_secret`, `redirect_uri`, `code`, `state`, `grant_type=authorization_code` |
| `authentication.checkToken` | GET | `https://id.twitch.tv/oauth2/validate` — **hardcoded, ignores `apiUrl`** | none; the token travels in the `Authorization` header |

Note that `users.getUserTags` is exported on `users` but reaches a `/streams/` path, and that `users.updateUser` is the only write.

---

## Export inventory

`require("twitch-helix-api")` returns `index.js`, which exposes three configuration properties and six modules. Full signatures and behaviour: [`docs/geeiq.md`](./docs/geeiq.md#export-inventory).

| Export | Kind | Purpose |
|---|---|---|
| `clientID` | string property, `""` | Sent as the `Client-ID` header on every request |
| `token` | string property, `""` | Default bearer/OAuth token for every request |
| `apiUrl` | string property, `https://api.twitch.tv/helix` | Base URL that all ten Helix paths are appended to |
| `authentication` | module | `getAccessToken(data)`, `checkToken(data)` |
| `games` | module | `getGames(data)`, `getTopGames(data)` |
| `streams` | module | `getStreams(data)`, `getStreamsMetadata(data)` |
| `users` | module | `getUsers(data)`, `getUsersFollows(data)`, `getUserTags(data)`, `updateUser(data)` |
| `videos` | module | `getVideos(data)` |
| `clips` | module | `getClips(data)` |

`lib/request.js` and `lib/helpers.js` are **not** on the root export and are reachable only by deep require (`twitch-helix-api/lib/request`).

<!-- ===================== END GEEIQ BLOCK ===================== -->

# Twitch-Helix-API

[![npm Stats](https://nodei.co/npm/twitch-helix-api.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/twitch-helix-api)

## About

Twitch-Helix-API is a NPM library designed to make use of the Twitch Helix API version easier. It currently covers the following endpoints:

- Get Access Token (Kraken Endpoint)
- Get Games
- Get Streams
- Get Streams Metadata
- Get Users
- Get User Follows
- Get User Tags
- Update User
- Get Videos

Webhooks are not supported in this library unforuntately. 

## Issues

If you have a suggestion or have discovered a bug relating to this library, please create an issue [here](https://github.com/Glyciant/Twitch-Helix-API/issues). Ensure you are as descriptive as possible.

## Contributions

You may contribute to this library if you wish to. Please create a pull request to do so.

## Installation

Install with NPM:

`npm install --save twitch-helix-api`

## Documentation & Usage

Begin by importing the library and setting a Client ID. Example:

```
var api = require("twitch-helix-api");

api.clientID = "XXXXXXXXXXXXXXXXXXXXX";
api.token = "XXXXXXXXXXXXXXXXXXXXX";
```

### Requests

#### Authentication

##### Get Access Token

Usage:

```
api.authentication.getAccessToken({ ... }).then(function(data) {
    ...
});
```

This request requires you to have already received an authorization code from Twitch. Refer to the Twitch documentation if you do not know how to do this.

You must send all of these parameters in the object:

|**Name**|**Type**|**Description**|
|--- |--- |--- |
|`client_id`|string|Your client ID.|
|`client_secret`|string|Your client secret.|
|`redirect_uri`|string|Your registered redirect URI. This must exactly match the redirect URI registered.|
|`code`|string|Your authorization code sent by Twitch.|

You may send these optional parameters in the object:

|**Name**|**Type**|**Description**|
|--- |--- |--- |
|`state`|string|Your unique token, generated by your application. This is an OAuth 2.0 opaque value, used to avoid CSRF attacks. This value is echoed back in the response.|

##### Check Token

```
api.authentication.checkToken({ ... }).then(function(data) {
    ...
});
```

This request requires you to have an access token.

|**Name**|**Type**|**Description**|
|--- |--- |--- |
|`token`|string|Your access token from Twitch.|

#### Games

##### Get Games

Usage:

```
api.games.getGames({ ... }).then(function(data) {
    ...
});
```

This request accepts no authentication.

This request requires no parameters.

You may send these optional parameters in the object:

|**Name**|**Type**|**Description**|
|--- |--- |--- |
|`id`|string|Game ID. At most 100 id values can be specified.|
|`name`|string|Game name. The name must be an exact match. For instance, "Pokemon" will not return a list of Pokemon games; instead, query the specific Pokemon game(s) in which you are interested. At most 100 name values can be specified.|

#### Streams

##### Get Streams

Usage: 

```
api.streams.getStreams({ ... }).then(function(data) {
    ...
});
```

This request accepts no authentication.

This request requires no parameters.

You may send these optional parameters in the object:

|**Name**|**Type**|**Description**|
|--- |--- |--- |
|`after`|string|Cursor for forward pagination: tells the server where to start fetching the next set of results, in a multi-page response.|
|`before`|string|Cursor for backward pagination: tells the server where to start fetching the next set of results, in a multi-page response.|
|`community_id`|string|Returns streams in a specified community ID. You can specify up to 100 IDs.|
|`first`|integer|Maximum number of objects to return. Maximum: 100. Default: 20.|
|`game_id`|string|Returns streams broadcasting a specified game ID. You can specify up to 100 IDs.|
|`language`|string|Stream language. You can specify up to 100 languages.|
|`type`|string|Stream type: "all", "live", "vodcast". Default: "all".|
|`user_id`|string|Returns streams broadcast by one or more specified user IDs. You can specify up to 100 IDs.|
|`user_login`|string|Returns streams broadcast by one or more specified user login names. You can specify up to 100 names.|

##### Get Streams Metadata

Usage: 

```
api.streams.getStreamsMetadata({ ... }).then(function(data) {
    ...    ...
});
```

This request accepts no authentication.

This request requires no parameters.

You may send these optional parameters in the object:

|**Name**|**Type**|**Description**|
|--- |--- |--- |
|`after`|string|Cursor for forward pagination: tells the server where to start fetching the next set of results, in a multi-page response.|
|`before`|string|Cursor for backward pagination: tells the server where to start fetching the next set of results, in a multi-page response.|
|`community_id`|string|Returns streams in a specified community ID. You can specify up to 100 IDs.|
|`first`|integer|Maximum number of objects to return. Maximum: 100. Default: 20.|
|`game_id`|string|Returns streams broadcasting a specified game ID. You can specify up to 100 IDs.|
|`language`|string|Stream language. You can specify up to 100 languages.|
|`type`|string|Stream type: "all", "live", "vodcast". Default: "all".|
|`user_id`|string|Returns streams broadcast by one or more specified user IDs. You can specify up to 100 IDs.|
|`user_login`|string|Returns streams broadcast by one or more specified user login names. You can specify up to 100 names.|

#### Users

##### Get Users

Usage:

```
api.users.getUsers({ ... }).then(function(data) {
    ...
});
```

This request requires no authentication, but accepts the `user:read:email` to send en email address.

You must send one or more of these parameters in the object:

|**Name**|**Type**|**Description**|
|--- |--- |--- |
|`ìd`|string|User ID. Multiple user IDs can be specified. Limit: 100.|
|`login`|string|User login name. Multiple login names can be specified. Limit: 100.|

This request has no optional parameters.

##### Get Users Follows

Usage:

```
api.users.getUsersFollows({ ... }).then(function(data) {
    ...
});
```

This request accepts no authentication.

You must send one or more of these parameters in the object:

|**Name**|**Type**|**Description**|
|--- |--- |--- |
|`from_id`|string|User ID. The request returns information about users who are being followed by the `from_id` user.|
|`to_id`|string|User ID. The request returns information about users who are following the `to_id` user.|

You may send these optional parameters in the object:

|**Name**|**Type**|**Description**|
|--- |--- |--- |
|`after`|string|Cursor for forward pagination: tells the server where to start fetching the next set of results, in a multi-page response.|
|`before`|string|Cursor for backward pagination: tells the server where to start fetching the next set of results, in a multi-page response.|
|`first`|integer|Maximum number of objects to return. Maximum: 100. Default: 20.|

##### Get User Tags

Usage:

```
api.users.getUserTags({ ... }).then(function(data) {
    ...
});
```

This request accepts no authentication.

You must send one or more of these parameters in the object:

|**Name**|**Type**|**Description**|
|--- |--- |--- |
|`id`|string|User ID. Limit: 1.|

This request has no optional parameters.

##### Update Users

Usage:

```
api.users.updateUsers({ ... }).then(function(data) {
    ...
});
```

This request requires authentication. The `user:edit` scope is required.

You must send one or more of these parameters in the object:

|**Name**|**Type**|**Description**|
|--- |--- |--- |
|`description`|string|New user description: used to set the new description for the user.|

This request has no optional parameters.

#### Videos

#### Get Videos

Usage:

```
api.videos.getVideos({ ... }).then(function(data) {
    ...
});
```

This request accepts no authentication.

You must send one or more of these parameters in the object:

|**Name**|**Type**|**Description**|
|--- |--- |--- |
|`id`|string|ID of the video being queried. Limit: 100. If this is specified, you cannot use any of the optional query string parameters below.|
|`user_id`|string|ID of the user who owns the video. Limit 1.|
|`game_id`|string|ID of the game the video is of. Limit 1.|

You may send these optional parameters in the object:

|**Name**|**Type**|**Description**|
|--- |--- |--- |
|`after`|string|Cursor for forward pagination: tells the server where to start fetching the next set of results, in a multi-page response.|
|`before`|string|Cursor for backward pagination: tells the server where to start fetching the next set of results, in a multi-page response.|
|`first`|string|Number of values to be returned when getting videos by user or game ID. Limit: 100. Default: 20.|
|`language`|string|Language of the video being queried. Limit: 1.|
|`period`|string|Period during which the video was created. Valid values: "all", "day", "month", and "week". Default: "all".|
|`sort`|string|Sort order of the videos. Valid values: "time", "trending", and "views". Default: "time".|
|`type`|string|Type of video. Valid values: "all", "upload", "archive", and "highlight". Default: "all".|

### Responses

All requests made will return a custom payload object containing the data you requested along with other useful information.

Example successful response:

```
{ 
    code: 200,
    status: "success",
    message: "OK",
    response: ...
}
```

Example error response:

```
{
    code: 400,
    status: "bad_request",
    message: ...,
    response: null
}
```

The `message` field will describe the exact error you have made.

The `response` field will contain whatever data Twitch sends as a response to your request.