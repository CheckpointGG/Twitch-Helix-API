var queryString = require("query-string")
    request = require("./request"),
    helpers = require("./helpers");
    index = require("../index");

module.exports = {
    getGames: (data) => {
        return new Promise((resolve, reject) => {
            if (!data || ((!data.id || data.id.length === 0) && (!data.name || data.name.length === 0))) {
                resolve(helpers.generatePayload(400, "bad_request", "You must specify a game ID or name.", null));
            }
            else if (data.id && data.id.length > 100) {
                resolve(helpers.generatePayload(400, "bad_request", "You have specified too many game IDs. The maximum is 100.", null));
            }
            else if (data.name && data.name.length > 100) {
                resolve(helpers.generatePayload(400, "bad_request", "You have specified too many game names. The maximum is 100.", null));
            }
            else {
                queries = queryString.stringify({ id: data.id, name: data.name });
                request.get(`${index.apiUrl}/games?` + queries, {}).then(function(data) {
                    resolve(helpers.generatePayload(200, "success", "OK", data));
                });
            }
        });
    },
    getTopGames: (data) => {
        return new Promise((resolve, reject) => {
            let queries = require('query-string').stringify({ 
                before: data.before,
                after: data.after,
                first: data.first,
            });
            require('twitch-helix-api/lib/request').get(`${index.apiUrl}/games/top?` + queries, {}).then(function(data) {
                resolve(helpers.generatePayload(200, "success", "OK", data));
            });
        });
    }
};