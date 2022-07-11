const Model = require("../models/Model");
const _ = require("lodash");
let ObjectId = require('mongodb').ObjectID;
var total_view = 0;

class User {

    constructor(collection) {
        this.collection = collection;
    }

    userAdListing(skip, limit, sort, filter) {
        console.log("skip, limit, sort, filter", skip, limit, sort, filter)
        return new Promise((resolve, reject) => {
            try {
                this.collection.aggregate([{
                    $match: filter
                },
                // Stage 2
                {
                    $sort: sort
                },
                {
                    $skip: skip
                },

                // Stage 8
                {
                    $limit: limit
                },
                // {
                //     $project: {
                //         "updatedAt": "$updatedAt",
                //         "createdAt": "$createdAt",
                //         "user_fullname": "$user_fullname",
                //         "user_email": "$user_email",
                //         "user_email": { $toLower: "$user_email" },
                //         "user_lastname": { $toLower: "$user_lastname" },
                //         "user_firstname": { $toLower: "$user_firstname" },
                //         "user_status": "$user_status",
                //         "user_photo": "$user_photo",
                //         "city": "$city",
                //         "state": "$state",
                //         "country": "$country",
                //         "user_dob": "$user_dob",
                //         "user_company_name": "$user_company_name",
                //         "user_department": "$user_department",
                //         "delete_status": "$delete_status",
                //         "user_logout_time": "$user_logout_time",
                //         "user_login_time": "$user_login_time",
                //         "user_verificationStatus": "$user_verificationStatus",
                //         "user_phone":"$user_phone",
                //         "userId": "$_id",
                //         "device_type":"$device_type",
                //         "_id": 1,
                //         "user_role": "$user_role"
                //     }
                // },                
                //{ $lookup: { from: 'companies', localField: 'user_company_name', foreignField: '_id', as: 'company' } }
                {
                    $lookup: {
                        from: 'transactions',
                        let: { userId: "$_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $eq: ["$user_id", "$$userId"]
                                }
                            }
                        },
                        { $project: { _id: 1 } }
                        ],
                        as: 'transactions',
                    }
                },
                // {
                //     $lookup: {
                //         from: 'locations',
                //         let: { userId: "$_id" },                        
                //         pipeline: [
                //           { 
                //             $match: {
                //                 $expr:{ 
                //                     $eq: [   "$user_id", "$$userId" ]
                //                 }                                
                //               } 
                //           },
                //           { $project: { _id: 1, user_logout_time:1, user_login_time:1} },
                //           { $sort: {"createdAt":-1} },
                //           { $limit: 1},
                //         ],
                //         as: 'location_data',
                //     }
                // },
                {
                    $project: {
                        "updatedAt": "$updatedAt",
                        "createdAt": "$createdAt",
                        "user_fullname": "$user_fullname",
                        "user_email": { $toLower: "$user_email" },
                        "user_lastname": { $toLower: "$user_lastname" },
                        "user_firstname": { $toLower: "$user_firstname" },
                        "user_status": "$user_status",
                        "user_photo": { $cond: { if: { $eq: ['$user_photo', ""] }, then: null, else: { $concat: [process.env.aws_cdr_url, "/", "$user_photo"] } } },
                        "city": "$city",
                        "state": "$state",
                        "country": "$country",
                        "user_dob": "$user_dob",
                        "delete_status": "$delete_status",
                        "user_logout_time": "$user_logout_time",
                        "user_login_time": "$user_login_time",
                        "user_verificationStatus": "$user_verificationStatus",
                        "user_phone": "$user_phone",
                        "user_dob": "$user_dob",
                        "user_gender": "$user_gender",
                        "userId": "$_id",
                        "device_type": "$device_type",
                        "os_type": "$os_type",
                        "_id": 1,
                        "user_role": "$user_role",
                        "transactions": { $size: "$transactions" }
                    }
                },
                ], (err, data) => {
                    if (err) {
                        console.log("error", err)
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            } catch (error) {
                console.log("error", error)
            }


        });
    }

    userListingCount(sort, filter) {
        if (_.isEmpty(filter)) {
            filter.user_role = 'user';
        }
        return new Promise((resolve, reject) => {
            this.collection.aggregate([{
                $match: filter
            },
            // Stage 2
            {
                $sort: sort
            },
            {
                $project: {
                    "_id": 0
                }
            },
            {
                $count: "totalCount"
            }

            ], (err, data) => {
                if (err) {
                    reject(err);
                }
                if (!err) {
                    resolve(data);
                }
            });

        });
    }

    getVideoListing(skip, limit, sort, filter, userId, type) {
        try {
            // console.log("sort", sort, filter)
            // console.log("filter1", JSON.stringify(filter))
            userId = (userId) ? userId : null;
            if(type){
                var postObj = {"_id": 1,"title": 1,"description": 1,"file": 1,"thumbnail": 1,"mp3_from": 1,"mp3_id": 1,"mp3_title": 1,"mp3_url":1,"post_type": 1,"status": 1,"height": 1,"width": 1,"comment_count": 1,"like_count": 1,"views_count": 1,"duration": 1,"is_delete": 1,"post_id": 1,"user_id": 1,"createdAt": 1}
            }else{
                var postObj = {"_id": 1,"file": 1,"thumbnail": 1,"mp3_from": 1,"mp3_id": 1,"mp3_title": 1,"mp3_url":1,"post_type": 1,"status": 1,"height": 1,"width": 1,"duration": 1}
            }
            return new Promise((resolve, reject) => {
                this.collection.aggregate([
                    {
                        $match: filter
                    },
                    // Stage 2
                    {
                        $sort: sort
                    },
                    {
                        $skip: skip
                    },

                    // Stage 8
                    {
                        $limit: limit
                    },
                    {
                        $lookup: {
                            from: 'users',
                            let: { userId: "$user_id" },
                            pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: ["$_id", "$$userId"]
                                    }
                                }
                            },
                            { $project: { _id: 1, user_fullname: 1, user_photo: 1, } }
                            ],
                            as: 'user_data',
                        }
                    },
                    {
                        $unwind: {
                            path: "$user_data",
                            preserveNullAndEmptyArrays: true // optional
                        }
                    },
                    // {
                    //     $lookup: {
                    //         from: 'block_users',
                    //         let: { blockUserId: "$user_id" },
                    //         pipeline: [{
                    //                 $match: {
                    //                     $expr: {
                    //                         $and: [
                    //                             { $eq: ["$user_id", ObjectId(userId)] },
                    //                             { $eq: ["$blocked_user_id", "$$blockUserId"] },
                    //                         ]
                    //                     }
                    //                 }
                    //             },
                    //             { $project: { _id: 1, title: 1 } }
                    //         ],
                    //         as: 'block_users_data',
                    //     }
                    // },

                    {
                        $lookup: {
                            from: 'like_posts',
                            let: { userIds: "$user_id", postId: "$_id" },
                            pipeline: [{
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$user_id", ObjectId(userId)] },
                                            { $eq: ["$post_id", "$$postId"] },
                                        ]
                                    }
                                }
                            },
                            { $project: { _id: 1, user_id: 1, post_id: 1 } }
                            ],
                            as: 'post_like',
                        }
                    },
                    {
                        $lookup: {
                            from: 'like_posts',
                            let: { userIds: "$user_id", postId: "$_id" },
                            pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: ["$post_id", "$$postId"]
                                    }
                                }
                            },
                            { $project: { _id: 1, user_id: 1, post_id: 1 } },
                            { $limit: 3 }
                            ],
                            as: 'post_like_users',
                        }
                    },
                    {
                        $unwind: {
                            path: "$post_like_users",
                            preserveNullAndEmptyArrays: true // optional
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            let: { userId: "$post_like_users.user_id" },
                            pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: ["$_id", "$$userId"]
                                    }
                                }
                            },
                            { $project: { _id: 1, user_id: 1, user_photo: 1 } }
                            ],
                            as: 'post_like_users.users',
                        }
                    },
                    {
                        $lookup: {
                            from: 'save_posts',
                            let: { userIds: "$user_id", postId: "$_id" },
                            pipeline: [{
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$user_id", ObjectId(userId)] },
                                            { $eq: ["$post_id", "$$postId"] },
                                        ]
                                    }
                                }
                            },
                            { $project: { _id: 1 } }
                            ],
                            as: 'save_post',
                        }
                    },
                    {
                        $lookup: {
                            from: 'post_datas',
                            let: { postId: "$_id" },
                            pipeline: [{
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$is_delete", false] },
                                            { $eq: ["$post_id", "$$postId"] },
                                        ]
                                    }
                                }
                            },
                                { $project: postObj }
                            ],
                            as: 'postData',
                        }
                    },
                    {
                        $lookup: {
                            from: 'comments',
                            let: { postId: "$_id" },
                            pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: ["$post_id", "$$postId"]
                                    }
                                }
                            },
                            { $sort: {"createdAt":-1}},
                            { $project: {"comment":1, "createdAt":1} },                            
                            {$limit : 1}
                            ],
                            as: 'last_comment',
                        }
                    },
                    {
                        $unwind: {
                            path: "$last_comment",
                            preserveNullAndEmptyArrays: true // optional
                        }
                    },
                    {
                        $group: {
                            "updatedAt": { $first: "$updatedAt" },
                            "createdAt": { $first: "$createdAt" },
                            "title": { $first: "$title" },
                            "width": { $first: "$width" },
                            "height": { $first: "$height" },
                            "post_type": { $first: "$post_type" },
                            "description": { $first: "$description" },
                            "file": { $first: "$file" },
                            "thumbnail": { $first: "$thumbnail" }, //{ $first: { $cond: { if: { $gt: [{ $strLenCP: "$thumbnail" }, 0] }, then: { $concat: [process.env.aws_cdr_url, "/", "$thumbnail"] }, else: "" } } },
                            "full_urlfile": { $first: "$file" }, //{ $first: { $concat: [process.env.aws_cdr_url, "/", "$file"] } }, //process.env.aws_cdr_url+"$file", 
                            "mp3_from": { $first: "$mp3_from" },
                            "mp3_id": { $first: "$mp3_id" },
                            "mp3_title": { $first: "$mp3_title" },
                            "comment_count": { $first: "$comment_count" },
                            "like_count": { $first: "$like_count" },
                            "is_block": { $first: "$is_block" },
                            "active": { $first: "$active" },
                            "is_delete": { $first: "$is_delete" },
                            // "category": { $first:"$category_id"},
                            // "tags": { $first:"$tags"},
                            //"user_id": { $first:"$user_id"},
                            "like_post": { $first: { $cond: { if: { $gt: [{ $size: "$post_like" }, 0] }, then: true, else: false } } },
                            "save_post": { $first: { $cond: { if: { $gt: [{ $size: "$save_post" }, 0] }, then: true, else: false } } },
                            "language": { $first: "$language" },
                            "user_data": { $first: "$user_data" },
                            "block_users_data": { $first: "$block_users_data" },
                            // "user_data": { $first: { 
                            //         "_id": "$user_data._id", 
                            //         "user_fullname": "$user_data.user_fullname", 
                            //         "user_photo": "$user_data.user_photo" //{ $concat: [process.env.aws_cdr_url, "/", "$user_data.user_photo"] } 
                            //     } 
                            // },
                            "post_like_users": { $push: "$post_like_users" },
                            "posts": { $first: "$postData" },
                            "last_comment": { $first: "$last_comment" },
                            "_id": "$_id",
                        }
                    },
                    {
                        $project: {
                            "updatedAt": "$updatedAt",
                            "createdAt": "$createdAt",
                            "title": "$title",
                            "width": "$width",
                            "height": "$height",
                            "post_type": "$post_type",
                            "description": "$description",
                            "file": "$file",
                            "thumbnail": "$thumbnail", //process.env.aws_cdr_url+"$file", 
                            "full_urlfile": "$full_urlfile",
                            "mp3_from": "$mp3_from",
                            "mp3_id": "$mp3_id",
                            "mp3_title": "$mp3_title",
                            "comment_count": "$comment_count",
                            "like_count": "$like_count",
                            "is_block": "$is_block",
                            "active": "$active",
                            "is_delete": "$is_delete",
                            // "category": "$category_id",
                            // "tags": "$tags",
                            //"user_id": "$user_id",
                            "like_post": "$like_post",
                            "save_post": "$save_post",
                            "language": "$language",
                            "user_data": "$user_data",
                            "block_users_data": "$block_users_data",
                            "last_comment":"$last_comment",
                            "posts": "$posts",
                            "post_like_users": {
                                $cond: {
                                    if: { $gt: [{ $size: { $arrayElemAt: ["$post_like_users.users", 0] } }, 0] },
                                    then: {
                                        $map: {
                                            "input": "$post_like_users",
                                            as: "break",
                                            in: {
                                                "user_id": "$$break.user_id",
                                                // "user_photo": "$$break.users.user_photo",
                                                "user_photo": { $cond: { if: { $eq: [{ $arrayElemAt: ["$$break.users.user_photo", 0] }, ""] }, then: "", else: { $arrayElemAt: ["$$break.users.user_photo", 0] } } },
                                                // "users":{ $first: { $arrayElemAt: [ "$$break.users", 0 ] } },
                                                // "user_photo": { $cond:{ if: { $eq: ['$$break.users[0].user_photo', ""] }, then: "", else: { $concat: [process.env.aws_cdr_url, "/", "$$break.users[0].user_photo"] } }},
                                            }
                                        }
                                    },
                                    else: []
                                }
                            },
                            "_id": "$_id"
                        }

                    },
                    { "$addFields": { "total_view": 0 } },
                    {
                        $sort: sort
                    }
                ], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            });

        } catch (error) {
            console.log("error00", error)
        }
    }

    getVideoListingCount(sort, filter) {
        return new Promise((resolve, reject) => {
            this.collection.aggregate([{
                $match: filter
            },
            // Stage 2
            {
                $sort: sort
            },
            // {
            //     $lookup: {
            //         from: 'posts',
            //         let: { postId: "$post_id" },
            //         pipeline: [{
            //                 $match: {
            //                     $expr: {
            //                         $and: [
            //                             { $eq: ["$_id", "$$postId"] },
            //                             { $eq: ["$is_delete", false] },
            //                             { $eq: ["$is_block", false] }
            //                         ]
            //                     }
            //                 }
            //             },
            //             { $project: { _id: 1 } }
            //         ],
            //         as: 'posts',
            //     }
            // },
            // {
            //     $group: {
            //         _id: "$posts._id",
            //     }
            // },
            {
                $count: "totalCount"
            }

            ], (err, data) => {
                if (err) {
                    reject(err);
                }
                if (!err) {
                    resolve(data);
                }
            });

        });
    }

    getVideoAdminListing(skip, limit, sort, filter, flag) {
        try {
            console.log("flag", flag)
            if (flag) {
                return new Promise((resolve, reject) => {
                    this.collection.aggregate([{
                        $match: filter
                    },
                    // Stage 2
                    {
                        $sort: sort
                    },
                    {
                        $skip: skip
                    },

                    // Stage 8
                    {
                        $limit: limit
                    },
                    {
                        $lookup: {
                            from: 'users',
                            let: { userId: "$user_id" },
                            pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: ["$_id", "$$userId"]
                                    }
                                }
                            },
                            { $project: { _id: 1, user_fullname: 1, user_photo: 1, } }
                            ],
                            as: 'user_data',
                        }
                    },
                    {
                        $unwind: {
                            path: "$user_data",
                            preserveNullAndEmptyArrays: true // optional
                        }
                    },

                    {
                        $group: {
                            _id: "$_id",
                            "title": { $first: "$title" },
                            "updatedAt": { $first: "$updatedAt" },
                            "createdAt": { $first: "$createdAt" },
                            "post_type": { $first: "$post_type" },
                            "description": { $first: "$description" },
                            "file": { $first: "$file" },
                            "full_urlfile": { $first: { $concat: [process.env.aws_cdr_url, "/", "$file"] } }, //process.env.aws_cdr_url+"$file", 
                            "mp3_from": { $first: "$mp3_from" },
                            "mp3_id": { $first: "$mp3_id" },
                            "mp3_title": { $first: "$mp3_title" },
                            "comment_count": { $first: "$comment_count" },
                            "like_count": { $first: "$like_count" },
                            "views_count": { $first: "$views_count" },
                            "is_block": { $first: "$is_block" },
                            "status": { $first: "$status" },
                            "is_delete": { $first: "$is_delete" },
                            "category": { $first: "$postCat" },
                            "duration": { $first: "$duration" },
                            "tags": { $first: "$tags" },
                            "is_delete": { $first: "$is_delete" },
                            //"user_id": "$user_id",
                            "language": { $first: "$language" },
                            "user_data": { $first: "$user_data.user_photo" }, //{ $first: { "_id": "$user_data._id", "user_fullname": "$user_data.user_fullname", "user_photo": { $concat: [process.env.aws_cdr_url, "/", "$user_data.user_photo"] } } },
                            // category : {
                            //     $push : {
                            //         category : "$category"
                            //     }
                            // }

                        }
                    },
                    // {
                    //     $project: {
                    //         "updatedAt": "$updatedAt",
                    //         "createdAt": "$createdAt",
                    //         "title": "$title",
                    //         "post_type": "$post_type",
                    //         "description": "$description",
                    //         "file": "$file",
                    //         "full_urlfile": { $concat: [process.env.aws_cdr_url, "/", "$file"] }, //process.env.aws_cdr_url+"$file", 
                    //         "mp3_from": "$mp3_from",
                    //         "mp3_id": "$mp3_id",
                    //         "comment_count": "$comment_count",
                    //         "like_count": "$like_count",
                    //         "is_block": "$is_block",
                    //         "active": "$active",
                    //         "is_delete": "$is_delete",
                    //         "category": "$postCat",
                    //         "tags": "$tags",
                    //         "is_delete": "$is_delete",
                    //         //"user_id": "$user_id",
                    //         "language": "$language",
                    //         "user_data": { "_id": "$user_data._id", "user_fullname": "$user_data.user_fullname", "user_photo": { $concat: [process.env.aws_cdr_url, "/", "$user_data.user_photo"] } },
                    //         "_id": 1
                    //     }
                    // },
                    {
                        $sort: sort
                    },

                    ], (err, data) => {
                        if (err) {
                            reject(err);
                        }
                        if (!err) {
                            resolve(data);
                        }
                    });
                });
            } else {
                return new Promise((resolve, reject) => {
                    this.collection.aggregate([{
                        $match: filter
                    },
                    // Stage 2
                    {
                        $sort: sort
                    },
                    {
                        $skip: skip
                    },

                    // Stage 8
                    {
                        $limit: limit
                    },
                    {
                        $lookup: {
                            from: 'users',
                            let: { userId: "$user_id" },
                            pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: ["$_id", "$$userId"]
                                    }
                                }
                            },
                            { $project: { _id: 1, user_fullname: 1, user_photo: 1, } }
                            ],
                            as: 'user_data',
                        }
                    },
                    {
                        $unwind: {
                            path: "$user_data",
                            preserveNullAndEmptyArrays: true // optional
                        }
                    },
                    {
                        $project: {
                            "updatedAt": "$updatedAt",
                            "createdAt": "$createdAt",
                            "title": "$title",
                            "post_type": "$post_type",
                            "description": "$description",
                            "file": "$file",
                            "full_urlfile": { $concat: [process.env.aws_cdr_url, "/", "$file"] }, //process.env.aws_cdr_url+"$file", 
                            "mp3_from": "$mp3_from",
                            "mp3_id": "$mp3_id",
                            "mp3_title": "$mp3_title",

                            "comment_count": "$comment_count",
                            "like_count": "$like_count",
                            "views_count": "$views_count",
                            "is_block": "$is_block",
                            "status": "$status",
                            "duration": "$duration",
                            "is_delete": "$is_delete",
                            "category": "$category_id",
                            "tags": "$tags",
                            "is_delete": "$is_delete",
                            //"user_id": "$user_id",
                            "language": "$language",
                            "user_data": {
                                "_id": "$user_data._id",
                                "user_fullname": "$user_data.user_fullname",
                                "user_photo": "$user_data.user_photo" //{ $concat: [process.env.aws_cdr_url, "/", "$user_data.user_photo"] } 
                            },
                            "_id": 1
                        }
                    },
                        // {
                        //     $sort: sort
                        // }
                    ], (err, data) => {
                        console.log("err", err)
                        if (err) {
                            reject(err);
                        }
                        if (!err) {
                            resolve(data);
                        }
                    });
                });
            }
        } catch (error) {
            console.log("error00", error)
        }
    }

    getVideoAdminSingle(skip, limit, sort, filter, flag) {
        try {
            console.log("flag", flag)
            console.log("filter1", JSON.stringify(filter))
            // var userId = null;
            if (flag) {
                return new Promise((resolve, reject) => {
                    this.collection.aggregate([{
                        $match: filter
                    },
                    // Stage 8
                    {
                        $limit: limit
                    },
                    {
                        $lookup: {
                            from: 'localizations',
                            let: { langId: "$language_id" },
                            pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: ["$_id", "$$langId"]
                                    }
                                }
                            },
                            { $project: { _id: 1, name: 1 } }
                            ],
                            as: 'languageId',
                        }
                    },
                    {
                        $unwind: {
                            path: "$languageId",
                            preserveNullAndEmptyArrays: true // optional
                        }
                    },
                    {
                        $lookup: {
                            from: 'post_categories',
                            let: { post_id: "$_id" },
                            pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: ["$post_id", "$$post_id"]
                                    }
                                }
                            },],
                            as: 'postCat',
                        }
                    },
                    {
                        $unwind: {
                            path: "$postCat",
                            preserveNullAndEmptyArrays: true // optional
                        }
                    },
                    {
                        $lookup: {
                            from: 'categories',
                            let: { catId: "$postCat.category_id" },
                            pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: ["$_id", "$$catId"]
                                    }
                                }
                            },
                            { $project: { _id: 1, name: 1 } }
                            ],
                            as: 'category',
                        }
                    },
                    {
                        $unwind: {
                            path: "$category",
                            preserveNullAndEmptyArrays: true // optional
                        }
                    },

                    {
                        $group: {
                            _id: "$_id",
                            "title": { $first: "$title" },
                            "updatedAt": { $first: "$updatedAt" },
                            "createdAt": { $first: "$createdAt" },
                            "post_type": { $first: "$post_type" },
                            "description": { $first: "$description" },
                            "file": { $first: "$file" },
                            "full_urlfile": { $first: { $concat: [process.env.aws_cdr_url, "/", "$file"] } }, //process.env.aws_cdr_url+"$file", 
                            "mp3_from": { $first: "$mp3_from" },
                            "mp3_id": { $first: "$mp3_id" },
                            "mp3_title": { $first: "$mp3_title" },
                            "comment_count": { $first: "$comment_count" },
                            "like_count": { $first: "$like_count" },
                            "views_count": { $first: "$views_count" },
                            "is_block": { $first: "$is_block" },
                            "status": { $first: "$status" },
                            "is_delete": { $first: "$is_delete" },
                            "category": { $push: "$category" },
                            "is_delete": { $first: "$is_delete" },
                            "duration": { $first: "$duration" },
                            //"user_id": "$user_id",
                            "language": { $first: "$languageId" },
                            "user_data": { $first: "$user_data" },
                            // "user_data": { $first: { "_id": "$user_data._id", "user_fullname": "$user_data.user_fullname", "user_photo": { $concat: [process.env.aws_cdr_url, "/", "$user_data.user_photo"] } } },
                        }
                    },

                    {
                        $lookup: {
                            from: 'posttags',
                            let: { post_id: "$_id" },
                            pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: ["$post_id", "$$post_id"]
                                    }
                                }
                            },],
                            as: 'postTag',
                        }
                    },
                    {
                        $unwind: {
                            path: "$postTag",
                            preserveNullAndEmptyArrays: true // optional
                        }
                    },
                    {
                        $lookup: {
                            from: 'tags',
                            let: { tagId: "$postTag.tag_id" },
                            pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: ["$_id", "$$tagId"]
                                    }
                                }
                            },
                            { $project: { _id: 1, name: 1 } }
                            ],
                            as: 'tags_data',
                        }
                    },
                    {
                        $unwind: {
                            path: "$tags_data",
                            preserveNullAndEmptyArrays: true // optional
                        }
                    },
                    {
                        $group: {
                            _id: "$_id",
                            "title": { $first: "$title" },
                            "updatedAt": { $first: "$updatedAt" },
                            "createdAt": { $first: "$createdAt" },
                            "post_type": { $first: "$post_type" },
                            "description": { $first: "$description" },
                            "file": { $first: "$file" },
                            "full_urlfile": { $first: { $concat: [process.env.aws_cdr_url, "/", "$file"] } }, //process.env.aws_cdr_url+"$file", 
                            "mp3_from": { $first: "$mp3_from" },
                            "mp3_id": { $first: "$mp3_id" },
                            "mp3_title": { $first: "$mp3_title" },
                            "comment_count": { $first: "$comment_count" },
                            "like_count": { $first: "$like_count" },
                            "views_count": { $first: "$views_count" },
                            "is_block": { $first: "$is_block" },
                            "status": { $first: "$status" },
                            "is_delete": { $first: "$is_delete" },
                            "category": { $first: "$category" },
                            "duration": { $first: "$duration" },
                            "tags": { $push: "$tags_data" },
                            "is_delete": { $first: "$is_delete" },
                            //"user_id": "$user_id",
                            "language": { $first: "$language" },
                            //"user_data": {$first : { "_id": "$user_data._id", "user_fullname": "$user_data.user_fullname", "user_photo": { $concat: [process.env.aws_cdr_url, "/", "$user_data.user_photo"] } }},
                        }
                    },


                    ], (err, data) => {
                        if (err) {
                            reject(err);
                        }
                        if (!err) {
                            resolve(data);
                        }
                    });
                });
            } else {
                return new Promise((resolve, reject) => {
                    this.collection.aggregate([{
                        $match: filter
                    },
                    // Stage 2
                    {
                        $sort: sort
                    },
                    {
                        $skip: skip
                    },

                    // Stage 8
                    {
                        $limit: limit
                    },
                    {
                        $lookup: {
                            from: 'users',
                            let: { userId: "$user_id" },
                            pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: ["$_id", "$$userId"]
                                    }
                                }
                            },
                            { $project: { _id: 1, user_fullname: 1, user_photo: 1, } }
                            ],
                            as: 'user_data',
                        }
                    },
                    {
                        $unwind: {
                            path: "$user_data",
                            preserveNullAndEmptyArrays: true // optional
                        }
                    },
                    {
                        $project: {
                            "updatedAt": "$updatedAt",
                            "createdAt": "$createdAt",
                            "title": "$title",
                            "post_type": "$post_type",
                            "description": "$description",
                            "file": "$file",
                            "full_urlfile": { $concat: [process.env.aws_cdr_url, "/", "$file"] }, //process.env.aws_cdr_url+"$file", 
                            "mp3_from": "$mp3_from",
                            "mp3_id": "$mp3_id",
                            "mp3_title": "$mp3_title",
                            "comment_count": "$comment_count",
                            "like_count": "$like_count",
                            "views_count": "$views_count",
                            "is_block": "$is_block",
                            "status": "$status",
                            "is_delete": "$is_delete",
                            "category": "$category_id",
                            "tags": "$tags",
                            "is_delete": "$is_delete",
                            "duration": "$duration",
                            //"user_id": "$user_id",
                            "language": "$language",
                            "user_data": "$user_data",
                            // "user_data": { "_id": "$user_data._id", "user_fullname": "$user_data.user_fullname", "user_photo": { $concat: [process.env.aws_cdr_url, "/", "$user_data.user_photo"] } },
                            "_id": 1
                        }
                    },
                        // {
                        //     $sort: sort
                        // }
                    ], (err, data) => {
                        console.log("err", err)
                        if (err) {
                            reject(err);
                        }
                        if (!err) {
                            resolve(data);
                        }
                    });
                });
            }
        } catch (error) {
            console.log("error00", error)
        }
    }

    getCtaegoryList(sort, filter) {
        if (_.isEmpty(filter)) {
            filter.is_delete = false;
        }
        return new Promise((resolve, reject) => {

            this.collection.aggregate([{
                $match: filter
            },
            // Stage 2
            {
                $sort: sort
            },
            {
                $project: {
                    "updatedAt": "$updatedAt",
                    "createdAt": "$createdAt",
                    "name": "$name",
                    "description": "$description",
                    "image": "$image",
                    "color": "$color",
                    "second_title": "$second_title",
                    "status": "$status",
                    "full_urlfile": "$image",// { $concat: [process.env.aws_cdr_url, "/", "$image"] }, //process.env.aws_cdr_url+"$file"
                    "_id": 1
                }
            },
            ], (err, data) => {
                if (err) {
                    reject(err);
                }
                if (!err) {
                    resolve(data);
                }
            });

        });
    }

    getPostComment(skip, limit, sort, filter, userId) {
        console.log("skip", skip, limit, userId)
        return new Promise((resolve, reject) => {
            try {
                this.collection.aggregate([{
                    $match: filter
                },
                {
                    $sort: sort
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                },
                // {
                //     $lookup: {
                //         from: 'reply_comments',
                //         let: { commentId: "$_id" },
                //         pipeline: [{
                //                 $match: {
                //                     $expr: { $eq: ["$comment_id", "$$commentId"] },
                //                 }
                //             },
                //             { $limit: 1 },
                //             { $sort: { "createdAt": -1 } },
                //             { $project: { _id: 1, comment: 1, user_id: 1 } }
                //         ],
                //         as: 'replyComment',
                //     }
                // },
                // {
                //     $unwind: {
                //         path: "$replyComment",
                //         preserveNullAndEmptyArrays: true // optional
                //     }
                // },
                // {
                //     $lookup: {
                //         from: 'users',
                //         let: { userId: "$replyComment.user_id" },
                //         pipeline: [{
                //                 $match: {
                //                     $expr: { $eq: ["$_id", "$$userId"] },
                //                 }
                //             },
                //             { $project: { _id: 1, user_fullname: 1, user_photo: 1, } }
                //         ],
                //         as: 'replyComment.users',
                //     }
                // },
                // {
                //     $unwind: {
                //         path: "$replyComment.users",
                //         preserveNullAndEmptyArrays: true // optional
                //     }
                // },
                {
                    $lookup: {
                        from: 'like_comments',
                        let: { commentId: "$_id", postId: "$post_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user_id", ObjectId(userId)] },
                                        { $eq: ["$comment_id", "$$commentId"] },
                                        { $eq: ["$post_id", "$$postId"] },
                                        { $eq: ["$likes", true] }
                                    ]
                                },
                            }
                        },
                        { $project: { _id: 1 } }
                        ],
                        as: 'like_comments',
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { userId: "$user_id" },
                        pipeline: [{
                            $match: {
                                $expr: { $eq: ["$_id", "$$userId"] },
                            }
                        },
                        { $project: { _id: 1, user_fullname: 1, user_photo: 1, } }
                        ],
                        as: 'users',
                    }
                },
                {
                    $unwind: {
                        path: "$users",
                        preserveNullAndEmptyArrays: true // optional
                    }
                },
                {
                    $group: {
                        "_id": "$_id",
                        "createdAt": { $first: "$createdAt" },
                        "type": { $first: "comment" },
                        "comment": { $first: "$comment" },
                        // "deleteStatus": { $first: "$deleteStatus" },
                        "users": { $first: "$users" },
                        "comment_like_count": { $first: "$comment_like_count" },
                        "reply_comment_count": { $first: "$reply_comment_count" },
                        "post_id": { $first: "$post_id" },
                        "like_comments": { $first: { $cond: { if: { $gt: [{ $size: "$like_comments" }, 0] }, then: true, else: false } } } //{$first : "$like_comments"}
                        // "replyComment": { $push: "$replyComment" },
                    }
                },
                {
                    $project: {
                        "_id": "$_id",
                        "createdAt": "$createdAt",
                        "type": "$type",
                        "comment": "$comment",
                        // "deleteStatus": "$deleteStatus",
                        "comment_like_count": "$comment_like_count",
                        "reply_comment_count": "$reply_comment_count",
                        "post_id": "$post_id",
                        // "replyComment": "$replyComment",
                        "like_comments": "$like_comments",
                        "users": "$users",
                        // "users": {
                        //     "_id": "$users._id",
                        //     "user_fullname": "$users.user_fullname",
                        //     "user_photo": { $cond: { if: { $eq: ['$users.user_photo', ""] }, then: "", else: { $concat: [process.env.aws_cdr_url, "/", "$users.user_photo"] } } }
                        // },
                    }
                },
                {
                    $sort: sort
                }


                ], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            } catch (error) {
                reject("Error in getPostComment in aggregation");
            }

        });
    }

    getPostCommentCount(sort, filter) {
        return new Promise((resolve, reject) => {
            try {
                this.collection.aggregate([{
                    $match: filter
                },
                // Stage 2
                {
                    $sort: sort
                },
                {
                    $project: {
                        "_id": 0
                    }
                },
                {
                    $count: "totalCount"
                }

                ], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            } catch (error) {
                reject("Error in getConnectionListCount in aggregation");
            }
        });
    }

    getPostSubComment(skip, limit, sort, filter, userId) {
        console.log("skip", skip, limit, userId)
        return new Promise((resolve, reject) => {
            try {
                this.collection.aggregate([{
                    $match: filter
                },
                {
                    $sort: sort
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { userId: "$user_id" },
                        pipeline: [{
                            $match: {
                                $expr: { $eq: ["$_id", "$$userId"] },
                            }
                        },
                        { $project: { _id: 1, user_fullname: 1, user_photo: 1, } }
                        ],
                        as: 'users',
                    }
                },
                {
                    $unwind: {
                        path: "$users",
                        preserveNullAndEmptyArrays: true // optional
                    }
                },
                {
                    $lookup: {
                        from: 'child_like_comments',
                        let: { commentId: "$_id", postId: "$post_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user_id", ObjectId(userId)] },
                                        { $eq: ["$comment_id", "$$commentId"] },
                                        { $eq: ["$post_id", "$$postId"] },
                                        { $eq: ["$likes", true] }
                                    ]
                                },
                            }
                        },
                        { $project: { _id: 1 } }
                        ],
                        as: 'like_comments',
                    }
                },
                {
                    $group: {
                        "_id": "$_id",
                        "createdAt": { $first: "$createdAt" },
                        "type": { $first: "sub_comment" },
                        "comment": { $first: "$comment" },
                        "users": { $first: "$users" },
                        "comment_like_count": { $first: "$comment_like_count" },
                        "post_id": { $first: "$post_id" },
                        "like_comments": { $first: { $cond: { if: { $gt: [{ $size: "$like_comments" }, 0] }, then: true, else: false } } } //{$first : "$like_comments"}
                        // "replyComment": { $push: "$replyComment" },
                    }
                },
                {
                    $project: {
                        "_id": "$_id",
                        "createdAt": "$createdAt",
                        "type": "$type",
                        "comment": "$comment",
                        // "deleteStatus": "$deleteStatus",
                        "comment_like_count": "$comment_like_count",
                        "post_id": "$post_id",
                        // "replyComment": "$replyComment",
                        "like_comments": "$like_comments",
                        "users": "$users",
                        // "users": {
                        //     "_id": "$users._id",
                        //     "user_fullname": "$users.user_fullname",
                        //     "user_photo": { $cond: { if: { $eq: ['$users.user_photo', ""] }, then: "", else: { $concat: [process.env.aws_cdr_url, "/", "$users.user_photo"] } } }
                        // },
                    }
                },
                {
                    $sort: sort
                }


                ], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            } catch (error) {
                reject("Error in getPostComment in aggregation");
            }

        });
    }

    getPostSubCommentCount(sort, filter) {
        return new Promise((resolve, reject) => {
            try {
                this.collection.aggregate([{
                    $match: filter
                },
                // Stage 2
                {
                    $sort: sort
                },
                {
                    $project: {
                        "_id": 0
                    }
                },
                {
                    $count: "totalCount"
                }

                ], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            } catch (error) {
                reject("Error in getConnectionListCount in aggregation");
            }
        });
    }

    getUserStatuses(skip, limit, sort, filter) {
        return new Promise((resolve, reject) => {
            try {
                this.collection.aggregate([{
                    $match: filter
                },
                {
                    $skip: skip
                },
                {
                    $group: {
                        "_id": "$user_id",
                        "createdAt": { $first: "$createdAt" },
                        "statuses": {
                            $push: {
                                "_id": "$_id",
                                "title": "$title",
                                "file": "$file",
                                "status_type": "$status_type",
                                "delete_status": "$delete_status",
                                "height": "$height",
                                "width": "$width",
                                "createdAt": "$createdAt"
                            }
                        }
                    }
                },
                {
                    $sort: sort
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { userId: "$_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$userId"]
                                }
                            }
                        },
                        { $project: { _id: 1, user_fullname: 1, user_photo: 1, } }
                        ],
                        as: 'user_data',
                    }
                },
                {
                    $unwind: {
                        path: "$user_data",
                        preserveNullAndEmptyArrays: true // optional
                    }
                },
                {
                    $project: {
                        "_id": 1,
                        "user_data": "$user_data",
                        "createdAt": "$createdAt",
                        // "user_data": {
                        //     "_id": "$user_data._id",
                        //     "user_fullname": "$user_data.user_fullname",
                        //     "user_photo": { $concat: [process.env.aws_cdr_url, "/", "$user_data.user_photo"] }
                        // },
                        "statuses": {
                            $map: {
                                "input": "$statuses",
                                as: "postvid",
                                in: {
                                    "_id": "$$postvid._id",
                                    "title": "$$postvid.title",
                                    "height": "$$postvid.height",
                                    "width": "$$postvid.width",
                                    "status_type": "$$postvid.status_type",
                                    "delete_status": "$$postvid.delete_status",
                                    "file": "$$postvid.file",
                                    // "file": { $cond: { if: { $eq: ['$$postvid.file', ""] }, then: "", else: { $concat: [process.env.aws_cdr_url, "/", "$$postvid.file"] } } },
                                    "createdAt": "$$postvid.createdAt" //{ $dateToString: { date: "$$postvid.createdAt", format: "%H:%M %z" } },

                                }
                            }
                        },
                    }
                },
                ], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            } catch (error) {
                console.log("error", error)
                reject("Error in getUserStatuses in aggregation");
            }

        });
    }

    getUserStatusesCount(sort, filter) {
        return new Promise((resolve, reject) => {
            try {
                this.collection.aggregate([{
                    $match: filter
                },
                // Stage 2
                {
                    $sort: sort
                },
                {
                    $group: {
                        "_id": "$user_id"
                    }
                },
                {
                    $count: "totalCount"
                }

                ], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            } catch (error) {
                reject("Error in getUserStatusesCount in aggregation");
            }
        });
    }

    searchByUser(skip, limit, sort, filter, loginUserId) {
        return new Promise((resolve, reject) => {
            try {
                this.collection.aggregate([{
                    $match: filter
                },
                {
                    $sort: sort
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'follwers',
                        let: { userId: "$_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$followed_id", "$$userId"] },
                                        { $eq: ["$followed_by", ObjectId(loginUserId)] },
                                    ]
                                }
                            }
                        },
                        { $project: { _id: 1, "createdAt": 1 } }
                        ],
                        as: 'follower_data',
                    }
                },
                {
                    $lookup: {
                        from: 'follwers',
                        let: { userId: "$_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $eq: ["$followed_id", "$$userId"]
                                }
                            }
                        },
                        { $project: { _id: 1, "createdAt": 1 } }
                        ],
                        as: 'follower_count',
                    }
                },
                {
                    $project: {
                        "createdAt": "$createdAt",
                        "user_photo": "$user_photo", //{ $cond: { if: { $gt: [{ $strLenCP: "$user_photo" }, 0] }, then: { $concat: [process.env.aws_cdr_url, "/", "$user_photo"] }, else: "" } },
                        "user_fullname": "$user_fullname",
                        "following": "$follower_data",
                        "follower_count": { $size: "$follower_count" },
                        "followed_status": { $cond: { if: { $gt: [{ $size: "$follower_data" }, 0] }, then: true, else: false } },
                        "_id": 1,
                    }
                },
                ], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            } catch (error) {
                console.log("error", error)
                reject("Error in searchByUser in aggregation");
            }

        });
    }

    searchByUserCount(sort, filter) {
        return new Promise((resolve, reject) => {
            try {
                this.collection.aggregate([{
                    $match: filter
                },
                // Stage 2
                {
                    $sort: sort
                },
                {
                    $project: {
                        "_id": 0
                    }
                },
                {
                    $count: "totalCount"
                }

                ], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            } catch (error) {
                reject("Error in searchByUserCount in aggregation");
            }
        });
    }

    searchByPost(skip, limit, sort, filter) {
        return new Promise((resolve, reject) => {
            try {
                this.collection.aggregate([{
                    $match: filter
                },
                {
                    $sort: sort
                },
                // Stage 2                    
                {
                    $skip: skip
                },

                // Stage 8
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { userId: "$user_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$userId"]
                                }
                            }
                        },
                        { $project: { _id: 1, user_fullname: 1, user_photo: 1, } }
                        ],
                        as: 'user_data',
                    }
                },
                {
                    $unwind: {
                        path: "$user_data",
                        preserveNullAndEmptyArrays: true // optional
                    }
                },
                {
                    $project: {
                        "updatedAt": "$updatedAt",
                        "createdAt": "$createdAt",
                        "title": "$title",
                        "post_type": "$post_type",
                        "description": "$description",
                        //"tags": "$tags",
                        "file": "$file",
                        "thumbnail": "$thumbnail", //{ $cond: { if: { $gt: [{ $strLenCP: "$thumbnail" }, 0] }, then: { $concat: [process.env.aws_cdr_url, "/", "$thumbnail"] }, else: "" } },
                        "full_urlfile": "$file", //{ $concat: [process.env.aws_cdr_url, "/", "$file"] }, //process.env.aws_cdr_url+"$file", 
                        "mp3_from": "$mp3_from",
                        "mp3_id": "$mp3_id",
                        "mp3_title": "$mp3_title",
                        "comment_count": "$comment_count",
                        "like_count": "$like_count",
                        "is_block": "$is_block",
                        "active": "$active",
                        "is_delete": "$is_delete",
                        //"user_id": "$user_id",
                        //"like_post": { $cond: { if: { $gt: [{ $size: "$post_like" }, 0] }, then: true, else: false } },
                        "category": "$category",
                        "language": "$language",
                        "user_data": "$user_data",
                        "height": "$height",
                        "width": "$width",
                        // "user_data": { "_id": "$user_data._id", "user_fullname": "$user_data.user_fullname", "user_photo": { $concat: [process.env.aws_cdr_url, "/", "$user_data.user_photo"] } },
                        "_id": 1
                    }
                },
                {
                    $sort: sort
                }
                ], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            } catch (error) {
                console.log("error", error)
                reject("Error in searchByPost in aggregation");
            }
        });
    }

    searchByPostCount(sort, filter) {
        return new Promise((resolve, reject) => {
            try {
                this.collection.aggregate([{
                    $match: filter
                },
                {
                    $sort: sort
                },
                {
                    $project: {
                        "_id": 1,
                    }
                },
                {
                    $count: "totalCount"
                }
                ], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            } catch (error) {
                console.log("error", error)
                reject("Error in searchByPostCount in aggregation");
            }

        });
    }

    searchByTag(skip, limit, sort, filter) {
        return new Promise((resolve, reject) => {
            try {
                this.collection.aggregate([{
                    $match: filter
                },
                // Stage 2
                {
                    $sort: sort
                },
                {
                    $skip: skip
                },

                // Stage 8
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'posttags',
                        let: { tagId: "$_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$tag_id", "$$tagId"] },
                                        { $eq: ["$delete_status", false] }
                                    ]
                                }
                            }
                        },
                        { $project: { _id: 1, "post_id": 1 } }
                        ],
                        as: 'posttags',
                    }
                },
                {
                    $unwind: {
                        path: "$posttags",
                        preserveNullAndEmptyArrays: true // optional
                    }
                },
                {
                    $lookup: {
                        from: 'posts',
                        let: { postsId: "$posttags.post_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$postsId"] },
                                        { $eq: ["$is_delete", false] }
                                    ]
                                }
                            }
                        },
                            //{ $project: { _id: 1, "type":1} }
                        ],
                        as: 'posts',
                    }
                },
                {
                    $unwind: {
                        path: "$posts",
                        preserveNullAndEmptyArrays: false // optional
                    }
                },
                {
                    $group: {
                        _id: "$posts._id",
                        "title": { $first: "$posts.title" },
                        "user_id": { $first: "$posts.user_id" },
                        "updatedAt": { $first: "$posts.updatedAt" },
                        "createdAt": { $first: "$posts.createdAt" },
                        "title": { $first: "$posts.title" },
                        "post_type": { $first: "$posts.post_type" },
                        "description": { $first: "$posts.description" },
                        "file": { $first: "$posts.file" },
                        "full_urlfile": { $first: "$posts.file" }, //process.env.aws_cdr_url+"$file", 
                        "mp3_from": { $first: "$posts.mp3_from" },
                        "mp3_id": { $first: "$posts.mp3_id" },
                        "mp3_title": { $first: "$mp3_title" },
                        "comment_count": { $first: "$posts.comment_count" },
                        "like_count": { $first: "$posts.like_count" },
                        "is_block": { $first: "$posts.is_block" },
                        "active": { $first: "$posts.active" },
                        "is_delete": { $first: "$posts.is_delete" },
                        "like_post": { $first: "$posts.post_like" },

                    }
                },
                {
                    $sort: { "createdAt": -1 }
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { userId: "$user_id" },
                        pipeline: [{
                            $match: {
                                $expr: { $eq: ["$_id", "$$userId"] },
                            }
                        },
                        { $project: { _id: 1, user_fullname: 1, user_photo: 1, } }
                        ],
                        as: 'user_data',
                    }
                },
                {
                    $unwind: {
                        path: "$user_data",
                        preserveNullAndEmptyArrays: true // optional
                    }
                },
                {
                    $project: {
                        "updatedAt": "$updatedAt",
                        "createdAt": "$createdAt",
                        "title": "$title",
                        "post_type": "$post_type",
                        "description": "$description",
                        //"tags": "$tags",
                        "file": "$file",
                        "full_urlfile": "$file", //{ $concat: [process.env.aws_cdr_url, "/", "$file"] }, //process.env.aws_cdr_url+"$file", 
                        "mp3_from": "$mp3_from",
                        "mp3_id": "$mp3_id",
                        "mp3_title": "$mp3_title",

                        "comment_count": "$comment_count",
                        "like_count": "$like_count",
                        "is_block": "$is_block",
                        "active": "$active",
                        "is_delete": "$is_delete",
                        //"user_id": "$user_id",
                        //"like_post": { $cond: { if: { $gt: [{ $size: "$post_like" }, 0] }, then: true, else: false } },
                        "category": "$category",
                        "language": "$language",
                        "user_data": "$user_data",
                        // "user_data": { "_id": "$user_data._id", "user_fullname": "$user_data.user_fullname", "user_photo": { $concat: [process.env.aws_cdr_url, "/", "$user_data.user_photo"] } },
                        "_id": 1
                    }
                },
                ], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            } catch (error) {
                reject("Error in userGlobalSearch in aggregation");
            }

        });
    }

    searchByTagCount(sort, filter) {
        return new Promise((resolve, reject) => {
            try {
                this.collection.aggregate([{
                    $match: filter
                },
                {
                    $sort: sort
                },
                {
                    $project: {
                        "_id": 1,
                    }
                },
                {
                    $count: "totalCount"
                }
                ], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            } catch (error) {
                console.log("error", error)
                reject("Error in searchByPostCount in aggregation");
            }

        });
    }

    getUserProfileByID(skip, limit, sort, filter, userId, loginUserId) {
        console.log("userIds", userId, loginUserId)
        return new Promise((resolve, reject) => {
            try {
                this.collection.aggregate([{
                    $match: filter
                },
                {
                    $sort: sort
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                },
                // {
                //     $lookup: {
                //         from: 'posts',
                //         let: { userId: "$_id" },
                //         pipeline: [{
                //                 $match: {
                //                     $expr: {
                //                         $and: [
                //                             { $eq: ["$user_id", "$$userId"] },
                //                             { $eq: ["$is_delete", false] },
                //                             { $eq: ["$is_block", false] },
                //                             { $eq: ["$post_type", 'image'] }
                //                         ]
                //                     }
                //                 }
                //             },
                //             { $sort: sort },
                //             { $limit: limit },
                //             { $project: { _id: 1, file: 1} },

                //         ],
                //         as: 'post_data_images',
                //     }
                // },
                // {
                //     $unwind: {
                //         path: "$post_data_images",
                //         preserveNullAndEmptyArrays: true // optional
                //     }
                // },
                // {
                //     $lookup: {
                //         from: 'posts',
                //         let: { userId: "$_id" },
                //         pipeline: [{
                //                 $match: {
                //                     $expr: {
                //                         $and: [
                //                             { $eq: ["$user_id", "$$userId"] },
                //                             { $eq: ["$is_delete", false] },
                //                             { $eq: ["$is_block", false] },
                //                             { $eq: ["$post_type", 'video'] }
                //                         ]
                //                     }
                //                 }
                //             },
                //             { $sort: sort },
                //             { $limit: limit },
                //             { $project: { _id: 1, file: 1} },

                //         ],
                //         as: 'post_data_video',
                //     }
                // },
                // {
                //     $unwind: {
                //         path: "$post_data_video",
                //         preserveNullAndEmptyArrays: true // optional
                //     }
                // },
                {
                    $lookup: {
                        from: 'follwers',
                        let: { userId: "$_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$followed_id", ObjectId(userId)] },
                                        { $eq: ["$followed_by", ObjectId(loginUserId)] },
                                    ]
                                }
                            }
                        },
                        { $project: { _id: 1, "createdAt": 1 } }
                        ],
                        as: 'follower_data',
                    }
                },
                {
                    $project: {
                        "_id": 1,
                        "user_photo": "$user_photo", //{ $concat: [process.env.aws_cdr_url, "/", "$user_photo"] },
                        "user_fullname": "$user_fullname",
                        "showkt_id": "$showkt_id",
                        "profile_type": "$profile_type",
                        // "user_dob": "$user_dob", 
                        "user_gender": "$user_gender",
                        // "user_phone": "$user_phone", 
                        // "user_email": "$user_email",
                        "total_post": "$total_post",
                        "user_bio": "$user_bio",
                        "facebook_link": "$facebook_link",
                        "instagram_link": "$instagram_link",
                        "twitter_link": "$twitter_link",
                        "linkedin_link": "$linkedin_link",
                        "youtube_link": "$youtube_link",
                        "website_link": "$website_link",
                        "followers_count": "$followers_count",
                        "following_count": "$following_count",
                        "post_data_images": "$post_data_images",
                        "post_data_video": "$post_data_video",
                        "following": "$follower_data",
                        // "post_data_images": { 
                        //     $map: {
                        //         "input": "$post_data_images",
                        //         as: "postImg",
                        //         in: {
                        //             "file": { $concat: [process.env.aws_cdr_url, "/", "$$postImg.file"] }
                        //         }
                        //     }
                        // },
                        // "post_data_video": { 
                        //     $map: {
                        //         "input": "$post_data_video",
                        //         as: "postvid",
                        //         in: {
                        //             "file": { $concat: [process.env.aws_cdr_url, "/", "$$postvid.file"] }
                        //         }
                        //     }
                        // },
                    }
                },
                ], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            } catch (error) {
                console.log("error", error)
                reject("Error in getUserProfileByID in aggregation");
            }

        });
    }

    getTotalVideoImageList(skip, limit, sort, filter) {
        return new Promise((resolve, reject) => {
            try {
                this.collection.aggregate([{
                    $match: filter
                },
                // Stage 2
                {
                    $sort: sort
                },
                {
                    $skip: skip
                },

                // Stage 8
                {
                    $limit: limit
                },

                {
                    $project: {
                        "_id": 1,
                        "width": "$width",
                        "height": "$height",
                        "thumbnail": "$thumbnail", //{ $cond: { if: { $gt: [{ $strLenCP: "$thumbnail" }, 0] }, then: { $concat: [process.env.aws_cdr_url, "/", "$thumbnail"] }, else: "" } },
                        "file": "$file" //{ $concat: [process.env.aws_cdr_url, "/", "$file"] },

                    }
                },
                { "$addFields": { "total_view": 0 } },

                ], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            } catch (error) {
                console.log("error", error)
                reject("Error in getTotalVideoImageList in aggregation");
            }
        });
    }

    getTotalVideoImageCount(sort, filter) {
        return new Promise((resolve, reject) => {
            try {
                this.collection.aggregate([{
                    $match: filter
                },
                // Stage 2
                {
                    $sort: sort
                },
                {
                    $project: {
                        "_id": 1
                    }
                },
                {
                    $count: "totalCount"
                }

                ], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            } catch (error) {
                reject("Error in getTotalVideoImageCount in aggregation");
            }
        });
    }

    // getVideoImageList(skip, limit, sort, filter, userId) {
    //     return new Promise((resolve, reject) => {
    //         try {
    //             this.collection.aggregate([{
    //                     $match: filter
    //                 },
    //                 // {
    //                 //     $sort: sort
    //                 // },
    //                 {
    //                     $skip: skip
    //                 },
    //                 {
    //                     $limit: limit
    //                 },
    //                 {
    //                     $lookup: {
    //                         from: 'users',
    //                         let: { userId: "$user_id" },
    //                         pipeline: [{
    //                                 $match: {
    //                                     $expr: {
    //                                         $eq: ["$_id", "$$userId"]
    //                                     }
    //                                 }
    //                             },
    //                             { $project: { _id: 1, user_fullname: 1, user_photo: 1, } }
    //                         ],
    //                         as: 'user_data',
    //                     }
    //                 },
    //                 {
    //                     $unwind: {
    //                         path: "$user_data",
    //                         preserveNullAndEmptyArrays: true // optional
    //                     }
    //                 },
    //                 {
    //                     $lookup: {
    //                         from: 'like_posts',
    //                         let: { userIds: "$user_id", postId: "$post_id" },
    //                         pipeline: [{
    //                                 $match: {
    //                                     $expr: {
    //                                         $and: [
    //                                             { $eq: ["$user_id", ObjectId(userId)] },
    //                                             { $eq: ["$post_id", "$$postId"] },
    //                                         ]
    //                                     }
    //                                 }
    //                             },
    //                             { $project: { _id: 1, user_id: 1, post_id: 1 } }
    //                         ],
    //                         as: 'post_like',
    //                     }
    //                 },
    //                 {
    //                     $project: {
    //                         "post_id": "$post_id",
    //                         "updatedAt": "$updatedAt",
    //                         "createdAt": "$createdAt",
    //                         "title": "$title",
    //                         "post_type": "$post_type",
    //                         "description": "$description",
    //                         //"tags": "$tags",
    //                         "file": "$file",
    //                         "full_urlfile": "$file",  // { $concat: [process.env.aws_cdr_url, "/", "$file"] }, //process.env.aws_cdr_url+"$file", 
    //                         "mp3_from": "$mp3_from",
    //                         "mp3_id": "$mp3_id",
    //                         "mp3_title": "$mp3_title",

    //                         "comment_count": "$comment_count",
    //                         "like_count": "$like_count",
    //                         "is_block": "$is_block",
    //                         "active": "$active",
    //                         "is_delete": "$is_delete",
    //                         //"user_id": "$user_id",
    //                         "like_post": { $cond: { if: { $gt: [{ $size: "$post_like" }, 0] }, then: true, else: false } },
    //                         "category": "$category",
    //                         "language": "$language",
    //                         "user_data": "$user_data",

    //                         // "user_data": { "_id": "$user_data._id", "user_fullname": "$user_data.user_fullname", "user_photo": { $concat: [process.env.aws_cdr_url, "/", "$user_data.user_photo"] } },
    //                         "_id": 1
    //                     }
    //                 },
    //             ], (err, data) => {
    //                 if (err) {
    //                     reject(err);
    //                 }
    //                 if (!err) {
    //                     resolve(data);
    //                 }
    //             });
    //         } catch (error) {
    //             console.log("error", error)
    //             reject("Error in getVideoImageList in aggregation");
    //         }

    //     });
    // }

    getVideoImageList(skip, limit, sort, filter, userId) {
        return new Promise((resolve, reject) => {
            try {
                this.collection.aggregate([{
                    $match: filter
                },
                {
                    $sort: sort
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { userId: "$user_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$userId"]
                                }
                            }
                        },
                        { $project: { _id: 1, user_fullname: 1, user_photo: 1, } }
                        ],
                        as: 'user_data',
                    }
                },
                {
                    $unwind: {
                        path: "$user_data",
                        preserveNullAndEmptyArrays: true // optional
                    }
                },
                {
                    $lookup: {
                        from: 'like_posts',
                        let: { userIds: "$user_id", postId: "$_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user_id", ObjectId(userId)] },
                                        { $eq: ["$post_id", "$$postId"] },
                                    ]
                                }
                            }
                        },
                        { $project: { _id: 1, user_id: 1, post_id: 1 } }
                        ],
                        as: 'post_like',
                    }
                },
                {
                    $project: {
                        "updatedAt": "$updatedAt",
                        "createdAt": "$createdAt",
                        "title": "$title",
                        "post_type": "$post_type",
                        "description": "$description",
                        //"tags": "$tags",
                        "file": "$file",
                        "full_urlfile": "$file",  // { $concat: [process.env.aws_cdr_url, "/", "$file"] }, //process.env.aws_cdr_url+"$file", 
                        "mp3_from": "$mp3_from",
                        "mp3_id": "$mp3_id",
                        "mp3_title": "$mp3_title",

                        "comment_count": "$comment_count",
                        "like_count": "$like_count",
                        "is_block": "$is_block",
                        "active": "$active",
                        "is_delete": "$is_delete",
                        //"user_id": "$user_id",
                        "like_post": { $cond: { if: { $gt: [{ $size: "$post_like" }, 0] }, then: true, else: false } },
                        "category": "$category",
                        "language": "$language",
                        "user_data": "$user_data",
                        // "user_data": { "_id": "$user_data._id", "user_fullname": "$user_data.user_fullname", "user_photo": { $concat: [process.env.aws_cdr_url, "/", "$user_data.user_photo"] } },
                        "_id": 1
                    }
                },
                ], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            } catch (error) {
                console.log("error", error)
                reject("Error in getVideoImageList in aggregation");
            }

        });
    }

    getSavedPostList(skip, limit, sort, filter, userId) {
        try {
            userId = (userId) ? userId : null;
            return new Promise((resolve, reject) => {
                this.collection.aggregate([{
                    $match: filter
                },
                // Stage 2
                {
                    $sort: sort
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'posts',
                        let: { postId: "$post_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$postId"] },
                                        { $eq: ["$is_delete", false] },
                                        { $eq: ["$is_block", false] }
                                    ]
                                }
                            }
                        },
                            //{ $project: { _id: 1, title: 1 } }
                        ],
                        as: 'posts',
                    }
                },
                {
                    $unwind: {
                        path: "$posts",
                        preserveNullAndEmptyArrays: true // optional
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { userId: "$posts.user_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$userId"]
                                }
                            }
                        },
                        { $project: { _id: 1, user_fullname: 1, user_photo: 1, } }
                        ],
                        as: 'user_data',
                    }
                },
                {
                    $unwind: {
                        path: "$user_data",
                        preserveNullAndEmptyArrays: true // optional
                    }
                },
                {
                    $lookup: {
                        from: 'like_posts',
                        let: { userIds: "$user_id", postId: "$post_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user_id", ObjectId(userId)] },
                                        { $eq: ["$post_id", "$$postId"] },
                                    ]
                                }
                            }
                        },
                        { $project: { _id: 1, user_id: 1, post_id: 1 } }
                        ],
                        as: 'post_like',
                    }
                },
                {
                    $lookup: {
                        from: 'like_posts',
                        let: { userIds: "$user_id", postId: "$post_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $eq: ["$post_id", "$$postId"]
                                }
                            }
                        },
                        { $project: { _id: 1, user_id: 1, post_id: 1 } },
                        { $limit: 3 }
                        ],
                        as: 'post_like_users',
                    }
                },
                {
                    $unwind: {
                        path: "$post_like_users",
                        preserveNullAndEmptyArrays: true // optional
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { userId: "$post_like_users.user_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$userId"]
                                }
                            }
                        },
                        { $project: { _id: 1, user_id: 1, user_photo: 1 } }
                        ],
                        as: 'post_like_users.users',
                    }
                },
                {
                    $lookup: {
                        from: 'save_posts',
                        let: { userIds: "$user_id", postId: "$post_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user_id", ObjectId(userId)] },
                                        { $eq: ["$post_id", "$$postId"] },
                                    ]
                                }
                            }
                        },
                        { $project: { _id: 1 } }
                        ],
                        as: 'save_post',
                    }
                },

                {
                    $group: {
                        "updatedAt": { $first: "$updatedAt" },
                        "createdAt": { $first: "$createdAt" },
                        "title": { $first: "$posts.title" },
                        "width": { $first: "$posts.width" },
                        "height": { $first: "$posts.height" },
                        "post_type": { $first: "$posts.post_type" },
                        "description": { $first: "$posts.description" },
                        "file": { $first: "$posts.file" },
                        "thumbnail": { $first: "$thumbnail" }, //{ $first: { $cond: { if: { $gt: [{ $strLenCP: "$thumbnail" }, 0] }, then: { $concat: [process.env.aws_cdr_url, "/", "$thumbnail"] }, else: "" } } },
                        "full_urlfile": { $first: "$posts.file" }, // { $first: { $concat: [process.env.aws_cdr_url, "/", "$posts.file"] } }, //process.env.aws_cdr_url+"$file", 
                        "mp3_from": { $first: "$posts.mp3_from" },
                        "mp3_id": { $first: "$posts.mp3_id" },
                        "mp3_title": { $first: "$mp3_title" },
                        "comment_count": { $first: "$posts.comment_count" },
                        "like_count": { $first: "$posts.like_count" },
                        "is_block": { $first: "$posts.is_block" },
                        "active": { $first: "$posts.active" },
                        "is_delete": { $first: "$posts.is_delete" },
                        // "category": { $first:"$category_id"},
                        // "tags": { $first:"$tags"},
                        //"user_id": { $first:"$user_id"},

                        "like_post": { $first: { $cond: { if: { $gt: [{ $size: "$post_like" }, 0] }, then: true, else: false } } },
                        "save_post": { $first: { $cond: { if: { $gt: [{ $size: "$save_post" }, 0] }, then: true, else: false } } },

                        "language": { $first: "$posts.language" },
                        "user_data": { $first: "$user_data" },
                        // "user_data": { $first: { "_id": "$user_data._id", "user_fullname": "$user_data.user_fullname", "user_photo": { $concat: [process.env.aws_cdr_url, "/", "$user_data.user_photo"] } } },
                        "post_like_users": { $push: "$post_like_users" },
                        "_id": "$posts._id",
                    }
                },
                {
                    $project: {
                        "updatedAt": "$updatedAt",
                        "createdAt": "$createdAt",
                        "title": "$title",
                        "width": "$width",
                        "height": "$height",
                        "post_type": "$post_type",
                        "description": "$description",
                        "file": "$file",
                        "thumbnail": "$thumbnail", //process.env.aws_cdr_url+"$file", 
                        "full_urlfile": "$full_urlfile",
                        "mp3_from": "$mp3_from",
                        "mp3_id": "$mp3_id",
                        "mp3_title": "$mp3_title",

                        "comment_count": "$comment_count",
                        "like_count": "$like_count",
                        "is_block": "$is_block",
                        "active": "$active",
                        "is_delete": "$is_delete",
                        // "category": "$category_id",
                        // "tags": "$tags",
                        "is_delete": "$is_delete",
                        //"user_id": "$user_id",
                        "like_post": "$like_post",
                        "save_post": "$save_post",
                        "language": "$language",
                        "user_data": "$user_data",
                        "user_photo": "$user_photo",
                        "post_like_users": {
                            $cond: {
                                if: { $gt: [{ $size: { $arrayElemAt: ["$post_like_users.users", 0] } }, 0] },
                                then: {
                                    $map: {
                                        "input": "$post_like_users",
                                        as: "break",
                                        in: {
                                            "user_id": "$$break.user_id",
                                            "user_photo": "$$break.users.user_photo",
                                            // "user_photo": { $cond: { if: { $eq: [{ $arrayElemAt: ["$$break.users.user_photo", 0] }, ""] }, then: "", else: { $concat: [process.env.aws_cdr_url, "/", { $arrayElemAt: ["$$break.users.user_photo", 0] }] } } },
                                            // "users":{ $first: { $arrayElemAt: [ "$$break.users", 0 ] } },
                                            // "user_photo": { $cond:{ if: { $eq: ['$$break.users[0].user_photo', ""] }, then: "", else: { $concat: [process.env.aws_cdr_url, "/", "$$break.users[0].user_photo"] } }},
                                        }
                                    }
                                },
                                else: []
                            }
                        },
                        "_id": "$_id"
                    }

                },
                { "$addFields": { "total_view": 0 } },
                {
                    $sort: sort
                }
                ], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            });
        } catch (error) {
            console.log("error", error)
            reject("Error in getSavedPostList in aggregation");
        }
    }

    userListing(skip, limit, sort, filter) {
        return new Promise((resolve, reject) => {
            try {
                this.collection.aggregate([{
                    $match: filter
                },
                // Stage 2
                {
                    $sort: sort
                },
                {
                    $skip: skip
                },

                // Stage 8
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { userId: "$user_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$userId"]
                                }
                            }
                        },
                        { $project: { _id: 1, user_email: 1, user_phone: 1 } }
                        ],
                        as: 'users',
                    }
                },
                {
                    $lookup: {
                        from: 'posts',
                        let: { postId: "$post_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$postId"]
                                }
                            }
                        },
                        { $project: { _id: 1, title: 1, user_phone: 1 } }
                        ],
                        as: 'posts',
                    }
                }
                ], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            } catch (error) {

            }


        });
    }

    reportListing(skip, limit, sort, filter) {
        return new Promise((resolve, reject) => {
            try {
                this.collection.aggregate([{
                    $match: filter
                },
                // Stage 2
                {
                    $sort: sort
                },
                {
                    $skip: skip
                },

                // Stage 8
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { userId: "$user_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$userId"]
                                }
                            }
                        },
                        { $project: { _id: 1, user_email: 1, user_phone: 1 } }
                        ],
                        as: 'users',
                    }
                },
                {
                    $lookup: {
                        from: 'report_reasons',
                        let: { parentReasonId: "$parent_reason_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$parentReasonId"]
                                }
                            }
                        },
                        { $project: { _id: 1, name: 1 } }
                        ],
                        as: 'report_reasons',
                    }
                },
                {
                    $lookup: {
                        from: 'posts',
                        let: { postId: "$post_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$postId"]
                                }
                            }
                        },
                        { $project: { _id: 1, title: 1, user_phone: 1 } }
                        ],
                        as: 'posts',
                    }
                }
                ], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            } catch (error) {

            }


        });
    }

    getReportReason(skip, limit, sort, filter) {
        return new Promise((resolve, reject) => {
            try {
                this.collection.aggregate([{
                    $match: filter
                },
                // Stage 2
                {
                    $sort: sort
                },
                {
                    $skip: skip
                },

                // Stage 8
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'report_reasons',
                        let: { parentId: "$parent_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$parentId"]
                                }
                            }
                        },
                        { $project: { _id: 1, name: 1 } }
                        ],
                        as: 'reports_data',
                    }
                },
                {
                    $unwind: {
                        path: "$reports_data",
                        preserveNullAndEmptyArrays: true // optional
                    }
                },
                {
                    $project: {
                        "updatedAt": "$updatedAt",
                        "createdAt": "$createdAt",
                        "name": "$name",
                        "parent_name": "$reports_data.name",
                        "parent_id": "$parent_id",
                        "reports_data": "$reports_data",
                        "status": "$status",
                        "_id": 1
                    }
                },
                ], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            } catch (error) {
                console.log("error", error)
            }


        });
    }

    getAllReportReason(skip, limit, sort, filter) {
        return new Promise((resolve, reject) => {
            try {
                this.collection.aggregate([{
                    $match: filter
                },
                // Stage 2
                {
                    $sort: sort
                },
                {
                    $skip: skip
                },

                // Stage 8
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'report_reasons',
                        let: { parentId: "$parent_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$parentId"]
                                }
                            }
                        },
                        { $project: { _id: 1, name: 1 } }
                        ],
                        as: 'reports_data',
                    }
                },
                {
                    $project: {
                        "updatedAt": "$updatedAt",
                        "createdAt": "$createdAt",
                        "name": "$name",
                        "parent_id": "$parent_id",
                        "reports_data": "$reports_data",
                        "status": "$status",
                        "_id": 1
                    }
                },
                ], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            } catch (error) {
                console.log("error", error)
            }


        });
    }

    getPopularUser(skip, limit, sort, filter, loginUserId) {
        return new Promise((resolve, reject) => {
            try {
                console.log("loginUserId", loginUserId)
                this.collection.aggregate([{
                    $match: filter
                },
                {
                    $sort: sort
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'follwers',
                        let: { userId: "$_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$followed_id", "$$userId"] },
                                        { $eq: ["$followed_by", ObjectId(loginUserId)] },
                                    ]
                                }
                            }
                        },
                        { $project: { _id: 1, "createdAt": 1 } }
                        ],
                        as: 'follower_data',
                    }
                },
                // {
                //     $lookup: {
                //         from: 'follwers',
                //         let: { userId: "$_id" },
                //         pipeline: [{
                //                 $match: {
                //                     $expr: {
                //                         $eq: ["$followed_id", "$$userId"]
                //                     }
                //                 }
                //             },
                //             { $project: { _id: 1, "createdAt": 1 } }
                //         ],
                //         as: 'follower_count',
                //     }
                // },
                {
                    $project: {
                        "createdAt": "$createdAt",
                        "user_photo": "$user_photo", //{ $cond: { if: { $gt: [{ $strLenCP: "$user_photo" }, 0] }, then: { $concat: [process.env.aws_cdr_url, "/", "$user_photo"] }, else: "" } },
                        "user_fullname": "$user_fullname",
                        "following": "$follower_data",
                        "follower_count": "$followers_count",
                        "followed_status": { $cond: { if: { $gt: [{ $size: "$follower_data" }, 0] }, then: true, else: false } },
                        "_id": 1,
                    }
                },
                ], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            } catch (error) {
                console.log("error", error)
                reject("Error in searchByUser in aggregation");
            }

        });
    }

    getNotificationData(skip, limit, sort, filter) {
        return new Promise((resolve, reject) => {
            try {
                // console.log("loginUserId", loginUserId)
                this.collection.aggregate([{
                    $match: filter
                },
                {
                    $sort: sort
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'posts',
                        let: { postId: "$post_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$postId"]
                                }
                            }
                        },
                        { $project: { _id: 1, "thumbnail": 1 } }
                        ],
                        as: 'posts_data',
                    }
                },
                {
                    $unwind: {
                        path: "$posts_data",
                        preserveNullAndEmptyArrays: true // optional
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { userId: "$user_id" },
                        pipeline: [{
                                $match: {
                                    $expr: {
                                        $eq: ["$_id", "$$userId"]
                                    }
                                }
                            },
                            { $project: { _id: 1, "user_fullname": 1, "user_photo":1 } }
                        ],
                        as: 'user_data',
                    }
                },
                {
                    $unwind: {
                        path: "$user_data",
                        preserveNullAndEmptyArrays: true // optional
                    }
                },
                {
                    $project: {
                        "createdAt": "$createdAt",
                        "body_msg": "$body_msg",
                        "title": "$title",
                        "notify_type": "$notify_type",
                        "summery": "$summery",
                        "target_screen": "$target_screen",
                        "read_status": "$read_status",
                        "os_type": "$os_type",
                        "thumbnail": "$posts_data.thumbnail", //{ $cond: { if: { $gt: [{ $strLenCP: "$user_photo" }, 0] }, then: { $concat: [process.env.aws_cdr_url, "/", "$user_photo"] }, else: "" } },
                        "user_fullname": "$user_data.user_fullname",
                        "user_photo": "$user_data.user_photo",
                        "post_id": "$post_id",
                        "user_id": "$user_id",
                        "_id": 1,
                    }
                },
                ], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            } catch (error) {
                console.log("error", error)
                reject("Error in searchByUser in aggregation");
            }

        });
    }

    getAllBlockUser(skip, limit, sort, filter) {
        return new Promise((resolve, reject) => {
            try {
                this.collection.aggregate([{
                    $match: filter
                },
                // Stage 2
                {
                    $sort: sort
                },
                {
                    $skip: skip
                },

                // Stage 8
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { userId: "$blocked_user_id" },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$userId"]
                                }
                            }
                        },
                        { $project: { _id: 1, user_fullname: 1, "user_photo": 1 } }
                        ],
                        as: 'users',
                    }
                },
                {
                    $unwind: {
                        path: "$users",
                        preserveNullAndEmptyArrays: true // optional
                    }
                },
                {
                    $project: {
                        "createdAt": "$createdAt",
                        "title": "$title",
                        "description": "$description",
                        "other_reason": "$other_reason",
                        "users": "$users",
                        "_id": 1
                    }
                },
                ], (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    if (!err) {
                        resolve(data);
                    }
                });
            } catch (error) {

            }


        });
    }

}

module.exports = User;