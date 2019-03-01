var queryString = require("query-string")
    request = require("./request"),
    helpers = require("./helpers");

module.exports = {
    getClips: (data) => {
        return new Promise((resolve, reject) => {
            if (!data || ((!data.id || data.id.length === 0) && (!data.broadcaster_id || data.broadcaster_id.length === 0)) && (!data.game_id || data.game_id.length === 0)) {
                resolve(helpers.generatePayload(400, "bad_request", "You must specify a clip ID, user ID or game ID.", null));
            }
            else if (data.id && data.id.length > 100) {
                resolve(helpers.generatePayload(400, "bad_request", "You have specified too many video IDs. The maximum is 1.", null));
            }
            else if (data.broadcaster_id && data.broadcaster_id.length > 100) {
                resolve(helpers.generatePayload(400, "bad_request", "You have specified too many broadcaster IDs. The maximum is 100.", null));
            }
            else if (data.game_id && data.game_id.length > 100) {
                resolve(helpers.generatePayload(400, "bad_request", "You have specified too many game IDs. The maximum is 100.", null));
            }
            else if (data && data.first && data.first > 100) {
                resolve(helpers.generatePayload(400, "bad_request", "You have specified a first parameter that is too high The maximum is 100.", null));
            }
            else if (data && data.first && data.first < 0) {
                resolve(helpers.generatePayload(400, "bad_request", "You have specified a first parameter that is too low. The minimum is 1.", null));
            }
            else if (data && data.language && data.language.length > 1) {
                resolve(helpers.generatePayload(400, "bad_request", "You have specified too many languages. The maximum is 1.", null));
            }
            else if (data && data.started_at && !helpers.validDateFormat(started_at)) {
                resolve(helpers.generatePayload(400, "bad_request", "started_at must be Date/Time in RFC3339 format", null));
            }
            else if (data && data.ended_at && !helpers.validDateFormat(started_at)) {
                resolve(helpers.generatePayload(400, "bad_request", "ended_at must be Date/Time in RFC3339 format", null));
            }
            else if (data && data.ended_at && !data.started_at) {
                resolve(helpers.generatePayload(400, "bad_request", "You must include started_at parameter if ended_at is included", null));
            }
            
            else {
                queries = require('query-string').stringify({ 
                    id: data.id, 
                    broadcaster_id: data.broadcaster_id, 
                    game_id: data.game_id, 
                    first: data.first, 
                    after: data.after,
                    before: data.before,
                    sort: data.sort, 
                    type: data.type, 
                    language: data.language, 
                });
                request.get("https://api.twitch.tv/helix/clips?" + queries, {}).then(function(data) {
                    resolve(helpers.generatePayload(200, "success", "OK", data));
                });
            }
        });
    }
};