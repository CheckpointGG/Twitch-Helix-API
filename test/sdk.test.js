const TwitchApi = require("../index");

describe("Twitch API", () => {

    TwitchApi.apiUrl = "https://qh3x3rgjg4.execute-api.us-east-2.amazonaws.com";


    it("should get streams", async () => {

        const response = await TwitchApi.streams.getStreams({
            first: 1
        });
        expect(response.code).toEqual(200);
    });

    it("should get top games", async () => {
        
        const response = await TwitchApi.games.getTopGames({
            first: 1
        });
        expect(response.code).toEqual(200);
    })

})