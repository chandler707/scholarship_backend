let fs = require('fs');
let path = require('path');
let im = require('imagemagick');
const config = require('../../configs/configs');
let thumb = require('node-thumbnail').thumb;
const _ = require("lodash");

const AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: "",
    secretAccessKey: "<Secret Access Key Here>"
});


class S3 {

    constructor(){

    }


    async uploadFileOnBucket(){

        return new Promise((resolve, reject)=>{

            fs.readFile(requestObj.newFilename, function (err, data) {

                if (err) {
                    //console.log(err, "read file error");
                    reject(err);
                }

                const params = {
                    Bucket: 'glyphoto',
                    Key: requestObj.fileNewName,
                    ACL: "public-read",
                    ContentType: requestObj.fileType,
                    Body: data
                };

                s3.putObject(params, function(err, data) {
                    // //console.log("amazon error", err)

                    if (err) {

                        reject(err);

                    } else {

                        let thumbnailUrl = 'https://glyphoto.s3-us-west-1.amazonaws.com/'+ requestObj.fileNewName;
                        // //console.log("Successfully uploaded data to myBucket/myKey", thumbnailUrl);

                        fs.unlink(requestObj.newFilename, function (err) {
                            if (err && !requestObj.alreadyDeleted) {
                                reject(err);
                            }

                            // //console.log(data, "dataaaa")

                            let thumbnailResponseObject = {
                                "thumbnailUrl": thumbnailUrl,
                                "etag": data.ETag
                            }
                            // //console.log("removed")
                            callback(null, thumbnailResponseObject)
                        });

                    }

                });

            });
        });
    }


    async fileUploadOnBucket(){
        return new Promise((resolve, reject)=>{

        });
    }
}

module.exports = S3