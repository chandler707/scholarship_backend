var https = require('https'),
    mime = require('mime'),
    path = require('path'),
    fs = require('fs'),
    async = require('async');

const configs = require("../../configs/configs");
var OAuth = require('oauth').OAuth;
/**
 * [POST] /rest/api/2/issue
 *
 * @param  Object   {options}
 * @param  Function {callback} the function to execute on success
 */
exports.postimage = function(options, callback) {
    var boundary = '----------------------------' + Date.now(),
        payload = {
            head: '',
            data: '',
            tail: '',
            length: 0
        };

    /*
     * Write the payload for the request
     */
    function setPayload(callback) {
        if (options.data.file != undefined) {
            async.waterfall([
                // Head
                function (callback) {
                    payload.head = new Buffer('--' + boundary + '\r\n' + 
                        'Content-Disposition: form-data; name="file"; filename="' + path.basename(options.data.file) + '"\r\n' +
                        'Content-Type: ' + mime.lookup(options.data.file) + '\r\n' + 
                        '\r\n');
                    callback(null);
                },
                // Body
                function (callback) {
                    fs.readFile(options.data.file, function (err, data) {
                        payload.data = data;
                        callback(null);
                    });
                },
                // Tail
                function (callback) {
                    payload.tail = new Buffer('\r\n--' + boundary + '--\r\n\r\n');
                    callback(null);
                },
                // Length 
                function (callback) {
                    payload.length = payload.head.length + payload.data.length + payload.tail.length;
                    callback(null);
                }
            ],
            // Result
            function (err) {
                if (err) 
                    callback(err);
                else 
                    callback(null);
            });
        }
        else {
            payload.data = JSON.stringify(options.data);
            payload.length = payload.data.length;
            callback(null);
        }
    }

    /* 
     * Build the request parameters and headers
     */
    function buildRequestParams(callback) {
        var params = {
            method: 'POST',
            host: options.config.host,
            auth: options.config.username + ':' + options.config.password,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': payload.length
            }
        }

        if (options.data.file != undefined) {
            params.headers = {
                'Content-Type': 'multipart/form-data; boundary=' + boundary,
                'X-Atlassian-Token': 'nocheck',
                'payload': payload.length
            }
            params.path = '/rest/api/2/issue/' + options.data.fields.issue.key + '/attachments',

            callback(null, params);
        }
        else {
            params.path = options.host + '/issue/';

            callback(null, params);
        }
    }

    /* 
     * Send the request and get a response
     */
    function sendRequest(params, finalcallback) {
        var responseBody = '',
            request;

            var payloaddstr = params.headers.payload.toString();
            var request = new OAuth(
                 configs.jiraUrl + "/plugins/servlet/oauth/request-token",
                 configs.jiraUrl + "/plugins/servlet/oauth/access-token",
                "OuthKey",
                fs.readFileSync(appRoot+'/jira.pem', 'utf8'),
                '1.0',
                configs.apiUrl+"/jira/callback",
                "RSA-SHA1"
            );

            function callback(error, data, resp) {
                if(error){
                    finalcallback(error, null);
                }else{
                    var data = JSON.parse(data);
                    finalcallback(null, data);
                }
            }


            request.post(
                configs.jiraUrl+"/rest/api/2/issue/"+options.data.fields.issue.key + '/attachments',
                "itoLm5wubJj4yRVU1odb3PjQozq7JwHu", //authtoken
                "XIIvOjhQDnjoYqFFACGZSWwSCry9P7h3", //oauth secret
                "hi",
                'multipart/form-data; boundary=' + boundary,                
                 payloaddstr,
                 payload,
                callback
            );

            // request = https.request(params, function(response) {
            //     response.on('data', function (chunk) {
            //         responseBody += chunk;
            //     });

            //     response.on('end', function () {
            //         try {
            //             callback(null, JSON.parse(responseBody)); }
            //         catch (e) {
            //             callback(null, responseBody); }
            //     });

            //     response.on('error', function (err) {
            //         callback(err, null);
            //     });
            // });

            ////console.log("request",request)
                
             // request.write(payload.head);
             // request.write(payload.data);
             // request.write(payload.tail);
             // request.end();
    }
    
    setPayload(function(err) {
        if (err)
            callback(err, null);
        else {
            buildRequestParams(function (err, params) {
                if (err)
                    callback(err, null);
                else {
                    sendRequest(params, function (err, response) {
                        if (err)
                            callback(err, null);
                        else
                            callback(null, response);
                    });
                }
            });
        }
    });
};

exports.post = function(options, callback) {
    
    function sendRequest(params, finalcallback) {
            var request = new OAuth(
                 configs.jiraUrl + "/plugins/servlet/oauth/request-token",
                 configs.jiraUrl + "/plugins/servlet/oauth/access-token",
                "OuthKey",
                fs.readFileSync(appRoot+'/jira.pem', 'utf8'),
                '1.0',
                configs.apiUrl+"/jira/callback",
                "RSA-SHA1"
            );

            function callback(error, data, resp) {
               // //console.log("data,", data, "error,", error); 
                if(error){
                    finalcallback(error, null);
                }else{
                    var data = JSON.parse(data);
                    finalcallback(null, data);
                }
            }

            request.post(
                configs.jiraUrl +"/rest/api/2/"+params.url,
                "itoLm5wubJj4yRVU1odb3PjQozq7JwHu", //authtoken
                "XIIvOjhQDnjoYqFFACGZSWwSCry9P7h3", //oauth secret
                params.bodyData,
                "application/json",
                null,
                null,
                callback
            );
    }
    
    sendRequest(options, function (err, response) {
        if (err)
            callback(err, null);
        else
            callback(null, response);
    });
};

exports.get = function(options, callback) {

    
    function sendRequest(params, finalcallback) {
            var request = new OAuth(
                 configs.jiraUrl + "/plugins/servlet/oauth/request-token",
                 configs.jiraUrl + "/plugins/servlet/oauth/access-token",
                "OuthKey",
                fs.readFileSync(appRoot+'/jira.pem', 'utf8'),
                '1.0',
                configs.apiUrl+"/jira/callback",
                "RSA-SHA1"
            );

            function callback(error, data, resp) {
                ////console.log("data,", data, "error,", error); 
                if(error){
                    finalcallback(error, null);
                }else{
                    var data = JSON.parse(data);
                    finalcallback(null, data);
                }
            }

            ////console.log(params.url)

            request.get(
                configs.jiraUrl+ '/rest/api/2/'+params.url,
                configs.jiraToken, //authtoken
                configs.jiraSecret, //oauth secret
                "application/json",
                null,
                null,
                callback
            );

    }
    
    sendRequest(options, function (err, response) {
        if (err)
            callback(err, null);
        else
            callback(null, response);
    });
};

exports.delete = function(options, callback) {

    
    function sendRequest(params, finalcallback) {
            var request = new OAuth(
                 configs.jiraUrl + "/plugins/servlet/oauth/request-token",
                 configs.jiraUrl + "/plugins/servlet/oauth/access-token",
                "OuthKey",
                fs.readFileSync(appRoot+'/jira.pem', 'utf8'),
                '1.0',
                configs.apiUrl+"/jira/callback",
                "RSA-SHA1"
            );

            function callback(error, data, resp) {
                ////console.log("data,", data, "error,", error); 
                if(error){
                    finalcallback(error, null);
                }else{
                    //var data = JSON.parse(data);
                    finalcallback(null, "data");
                }
            }

            //console.log(params.url)

            request.delete(
                    configs.jiraUrl+ '/rest/api/2/'+params.url,
                    configs.jiraToken, //authtoken
                    configs.jiraSecret, //oauth secret
                    "application/json",
                    callback
                );

    }
    
    sendRequest(options, function (err, response) {
        if (err)
            callback(err, null);
        else
            callback(null, response);
    });
};