module.exports = {
    generatePayload: (code, status, message, response) => {
        let ratelimit = response ? response.__ratelimit : null;
        if (response) {
            delete response.__ratelimit;
        }
        return {
            code: code,
            status: status,
            message: message,
            response: response,
            ratelimit: ratelimit,
        }
    },
    validDateFormat: function(){
        return true;
    }
};