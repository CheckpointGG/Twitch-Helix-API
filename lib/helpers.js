module.exports = {
    generatePayload: (code, status, message, response) => {
        let ratelimit = response.__ratelimit;
        delete response.__ratelimit;
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