/****************************
 FILE HANDLING OPERATIONS
 ****************************/
let fs = require('fs');
let path = require('path');
var request = require('request');
const _ = require("lodash");
var AWS = require('aws-sdk');
AWS.config.update({
    region: 'ap-south-1',
    "accessKeyId": process.env.AWS_ACCESS_KEY,
    "secretAccessKey": process.env.AWS_SECRET_KEY
});

class File {

    constructor(file, location, name) {
        this.file = file;
        this.location = location;
        this.filenewName = name;
    }

    // Method to Generate file thumbnail
    generateThumbnail(file) {

        return new Promise((resolve, reject) => {

            let uploadedThumbnailFilePath = appRoot + '/public/upload/';
            let srcFilePath = appRoot + file.srcPath;

            // Method to generate thumbnail
            thumb({
                source: srcFilePath, // could be a filename: dest/path/image.jpg
                destination: uploadedThumbnailFilePath,
                concurrency: 4,
                width: 200,
            }, function(files, err, stdout, stderr) {
                //console.log('All done!', files, "err", err);
                let thumbnail = files[0].dstPath.split("/public");
                let thumbnailPartialPath = '/public' + thumbnail[1];
                return resolve(thumbnailPartialPath);
            });


        });

    }

    // Method to Store file
    store(folder, id) { 
        var new_name = '';
        try {

            var re = /(?:\.([^.]+))?$/;
            return new Promise(async(resolve, reject) => {
                // Setting the path

                let appDir = path.dirname(require.main.filename);
                var mainfile = this.file.file || this.file;
                if (_.isEmpty(mainfile))
                    reject('Please send file.');
                let fileName = '';
                var folderpath = (folder) ? 'upload/' + folder : 'upload';
                // console.log("filenewName",this.file)
                if (this.filenewName) {
                    fileName = this.filenewName.split(".");
                    var ext = re.exec(this.filenewName);
                } else {
                    fileName = mainfile[0].originalFilename.split(".");
                    var ext = re.exec(mainfile[0].originalFilename);
                }
                console.log("ext**", ext, ext[0], ext[1])
                if (id) {
                    new_name = id + '_user_' + Date.now().toString() + '.' + ext[1];
                } else {
                    new_name = '/user_' + Date.now().toString() + '.' + ext[1];
                }

                let filePath = '/public/' + folderpath + '/' + new_name;
                let uploadedFilePath = appRoot + filePath;               


                //**********************************************   AWS  ************************************************************ */
                // var awsFile = await this.uploadVideoOnAWS(mainfile, new_name);
                // let fileObject = {
                //     "originalFilename": mainfile[0].originalFilename,
                //     "filePath": awsFile,
                //     "filePartialPath": awsFile,
                //     "newName": new_name
                // }                
                // return resolve(fileObject);
                //*********************************************************************************************************** */

                let fileObject = { "originalFilename": mainfile[0].originalFilename, "filePath": uploadedFilePath, "filePartialPath": filePathNew, "newName": new_name }
                fs.readFile(mainfile[0].path, (err, data) => {
                    fs.writeFile(uploadedFilePath, data, (err) => {
                        if (err) { return reject({message: err, status: 0 }); }
                        return resolve(fileObject);
                    });
                });

            });
        } catch (error) {

        }


    }

    bulkStore() {

        return new Promise((resolve, reject) => {
            // Setting the path
            let appDir = path.dirname(require.main.filename);
            if (_.isEmpty(this.file.file))
                reject('Please send file.');
            let fileName = this.file.file[0].originalFilename.split(".");
            let filePath = '/public/screenshot/' + fileName[0] + Date.now().toString() + '.' + fileName[1];
            let uploadedFilePath = appRoot + filePath;
            // let uploadedFilePath = path.join(__dirname, '..','..','public','upload',fileName[0] + Date.now().toString() + '.' + fileName[1]);
            ////console.log(uploadedFilePath);
            let fileObject = { "originalFilename": this.file.file[0].originalFilename, "filePath": uploadedFilePath, "filePartialPath": filePath }

            // Method to write the file on server
            fs.readFile(this.file.file[0].path, (err, data) => {
                fs.writeFile(uploadedFilePath, data, (err) => {
                    if (err) { return reject({ message: err, status: 0 }); }

                    return resolve(fileObject);
                });
            });

        });

    }

    storeLocal(folder, id) {
        try {
            var new_name = '';
            return new Promise((resolve, reject) => {
                // Setting the path
                //console.log('this.file',this.file);
                let appDir = path.dirname(require.main.filename);
                var newFilw = this.file.file || this.file.audio || this.file || false
                if (_.isEmpty(newFilw))
                    reject('Please send file.');
                let fileName = '';
                var folderpath = (folder) ? 'upload/' + folder : 'upload';
                // console.log("filenewName",this.file)
                if (this.filenewName) {
                    fileName = this.filenewName.split(".")
                } else {
                    fileName = newFilw[0].originalFilename.split(".");
                }

                if (id) {
                    new_name = id + '-' + fileName[0].replace(/\s+/g, '-') + Date.now().toString() + '.' + fileName[1];
                } else {
                    new_name = fileName[0].replace(/\s+/g, '-') + Date.now().toString() + '.' + fileName[1];
                }

                let filePath = '/public/' + folderpath + '/' + new_name;
                let uploadedFilePath = appRoot + filePath;
                let fileObject = { "originalFilename": newFilw[0].originalFilename, "filePath": uploadedFilePath, "filePartialPath": filePath, "newName": new_name }

                // Method to write the file on server
                fs.readFile(newFilw[0].path, (err, data) => {
                    fs.writeFile(uploadedFilePath, data, (err) => {
                        if (err) { return reject({ message: err, status: 0 }); }

                        return resolve(fileObject);
                    });
                });

            });
        } catch (error) {

        }

    }

    readFile(filepath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filepath, 'utf-8', (err, html) => {
                if (err) { return reject({ message: err, status: 0 }); }

                return resolve(html);

            });
        });
    }

    convertJsonToCsv(jsonData) {
        return new Promise((resolve, reject) => {
            const json2csvCallback = (err, csv) => {
                if (err) {

                    //console.log(err);
                    reject(err);
                    // res.send({status:0, message:err});
                } else {
                    //console.log(csv);
                    var flname = "userList" + Date.now().toString() + ".csv";
                    var loc = path.join(__dirname, '..', '..', 'public', 'upload', flname);
                    //console.log(loc);
                    fs.writeFile(loc, csv, (err, result) => {
                        if (err) {
                            //console.log(432);
                            reject(err);
                            // //console.log(moment.format('l'));
                            // res.send({status:0,message:err});
                        } else {

                            let csvFile = path.join('public', 'upload', flname);
                            resolve(csvFile);
                            // res.send({status:1, message:'csv file path', data:csvFile});
                        }
                    });
                }
            }
            converter.json2csvPromisified(jsonData, json2csvCallback);
        });
    }

    removeFile(file) {
        return new Promise((resolve, reject) => {
            var filep = appRoot + '/public/upload/'+file;
            // console.log("filep", filep)
            fs.unlink(filep, function(err) {
                console.log("error", err)
                if (err) {
                    return reject("Error on file delete");
                }
                return resolve('File has been Deleted');
            });
        });

    }

    sendOTP(obj) {
        return new Promise(async(resolve, reject) => {
            try {
                // var options = {
                //     "hostname": "api.msg91.com",
                //     "port": null,
                //     "path": "/api/v5/otp?extra_param=%7B%22Param1%22%3A%22Value1%22%2C%20%22Param2%22%3A%22Value2%22%2C%20%22Param3%22%3A%20%22Value3%22%7D&unicode=&authkey=Authentication%20Key&template_id=Template%20ID&mobile=Mobile%20Number%20with%20Country%20Code&invisible=1&otp=OTP%20to%20send%20and%20verify.%20If%20not%20sent%2C%20OTP%20will%20be%20generated.&userip=IPV4%20User%20IP&email=Email%20ID&otp_length=&otp_expiry=",
                //     "headers": {
                //         "content-type": "application/json"
                //     }
                // };
                var otp = obj.otp + " is your OTP and it is valid for the next 15 mins. Please do not share this OTP with anyone. Thankyou, ShowKIT"
                var options = {
                    headers: {
                        "content-type": "application/json"
                    },

                    url: 'https://api.msg91.com/api/sendhttp.php?authkey=213281A44nmNY7i5ae84ee2&mobiles=' + obj.mobile + '&country=' + obj.country_code + '&message=' + otp + '&sender=TESTIN&route=4'

                    // url:`http://api.bulksmsgateway.in/sendmessage.php?user=rentalvala&password=Rent@1234&mobile=${obj.mobile}&message=${otp}&sender=TESTKK&type=3&template_id=1507161717524942102`

                };
                console.log("options", options)
                request.get(options, function(error, response, body) {
                    console.log(error, "body----11", body);
                    if (error) {
                        console.log("error sendOTP 000", error)
                        reject(error);
                    } else {
                        resolve(body);
                    }

                });
            } catch (error) {
                console.log("error sendOTP", error)
                reject(error);
            }
        });
    }

    uploadVideoOnAWS(file, name, fn) {
        return new Promise(async(resolve, reject) => {
            try {
                var _this = this;
                console.log('name****', file, name);
                var s3 = new AWS.S3();
                var bucketName = 'showkit';
                var fileStream = fs.readFileSync(file[0].path);
                const params = {
                    Bucket: bucketName, // pass your bucket name
                    Key: name, // file will be saved as testBucket/contacts.csv
                    Body: fileStream,
                    ACL: 'public-read'
                };
                //
                s3.putObject(params, function(s3Err, data) {
                    console.log("s3Err, data", s3Err, data)
                    if (s3Err) {
                        reject({ status: 0, message: "Error on AWS authentication" });
                    } else {
                        // var awsS3File = "https://viktrs-bucket.s3.eu-west-2.amazonaws.com/" + name;
                        var awsS3File = name;
                        // console.log("awsS3File", awsS3File)
                        resolve(awsS3File)
                    }
                });

            } catch (error) {
                console.log("error", error)
                    // let globalObj = new Globals();
                    // var dataErrorObj = {
                    //     is_from : 'API Error',
                    //     api_name : 'Speech Route Api',
                    //     finction_name : 'uploadVideoOnAWS',
                    //     error_title : error.name,
                    //     description : error.message
                    // }
                    // globalObj.addErrorLogInDB(dataErrorObj);
                    // return reject({ status: 0, error: 'Server Error' });
            }

        });
    }

    async downLoadImageFromServer(url, dest) {
        try {

            const file = fs.createWriteStream(appRoot + dest);
            /* Using Promises so that we can use the ASYNC AWAIT syntax */
            await new Promise(async(resolve, reject) => {
                    request({
                            /* Here you should specify the exact link to the file you are trying to download */
                            uri: url,
                            gzip: true,
                        })
                        .pipe(file)
                        .on('finish', async() => {
                            console.log(`The file is finished downloading.`);
                            resolve();
                        })
                        .on('error', (error) => {
                            reject(error);
                        });
                })
                .catch((error) => {
                    console.log(`Something happened: ${error}`);
                });
        } catch (error) {
            console.log("error downLoadImageFromServer", error)
        }
    }

    async downLoadImageFromServerToAws(url, dest) {
        await new Promise(async(resolve, reject) => {
            try {
                console.log(url, dest)
                var options = {
                    uri: url,
                    encoding: null
                };
                var s3 = new AWS.S3();
                var bucketName = 'showkit';
                request(options, function(error, response, body) {
                    if (error || response.statusCode !== 200) {
                        console.log("failed to get image");
                        //console.log(error);
                        resolve(true)
                    } else {
                        s3.putObject({
                            Body: body,
                            Key: dest,
                            Bucket: bucketName,
                            ContentType: response.headers['content-type'],
                            ContentLength: response.headers['content-length'],
                        }, function(error, data) {
                            console.log("error, data", error, data)
                            if (error) {
                                console.log("error downloading image to s3");
                            } else {
                                console.log("success uploading to s3");
                            }
                            resolve(true);
                        });
                    }
                });
            } catch (error) {
                console.log("error downLoadImageFromServerToAws", error)
                resolve(true);
            }
        })

    }


}

module.exports = File;