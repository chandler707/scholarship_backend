const Model = require("../models/Model");
const _ = require("lodash");
let ObjectId = require("mongodb").ObjectID;
var total_view = 0;
const moment = require('moment');
var todayDate = new Date(moment().format('YYYY-MM-DD') + 'T00:00:00.000Z');
console.log("todayDate", todayDate)

class Aggregation {
  constructor(collection) {
    this.collection = collection;
  }

<<<<<<< HEAD
  getUniversityDetails(filter, skip, limit) {
=======
  matchedUserDetails(filter, skip, limit, userId) {
>>>>>>> 5376a7b4716c23194663b26f86e3bc70a8fde5ab
    return new Promise((resolve, reject) => {
      try {
        this.collection.aggregate(
          [
            {
              $match: filter,
            },
            {
              $lookup: {
<<<<<<< HEAD
                from: "university_details",
                let: { userId: "$_id" },
=======
                from: "user_dates",
                let: { userId: "$user_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$user_id", "$$userId"] },
                          { $gte: ["$dating_date", todayDate] },
                        ],
                      },
                    },
                  },
                  {
                    $project: { "date_text": 1, "dating_date": 1, "status": 1, "user_id": 1 }
                  }
                ],
                as: "user_dates",
              },
            },
            {
              $unwind: {
                path: "$user_dates",
                preserveNullAndEmptyArrays: false // optional
              }
            },
            // {
            //   $unwind: {
            //     path: "$user_info",
            //     preserveNullAndEmptyArrays: true // optional
            //   }
            // },
            // {
            //   $lookup: {
            //     from: "user_images",
            //     let: { userId: "$user_id" },
            //     pipeline: [
            //       {
            //         $match: {
            //           $expr: {
            //             $and: [
            //               { $eq: ["$user_id", "$$userId"] },
            //               { $eq: ["$is_profile_image", false] },
            //             ],
            //           },
            //         },
            //       },
            //     ],
            //     as: "profile_picture",
            //   },
            // },
            {
              $group: {
                _id: "$user_dates._id",
                date_text: { $first: "$user_dates.date_text" },
                dating_date: { $first: "$user_dates.dating_date" },
                user_id: { $first: "$user_dates.user_id" }
              },
            },
            {
              $lookup: {
                from: "date_details",
                let: { dateId: "$_id" },
                pipeline: [
                  // {
                  //   $match: {
                  //     $expr: {
                  //       $eq: ["$date_id", "$$dateId"],
                  //     },
                  //   },
                  // }
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$date_id", "$$dateId"] },
                          { $gte: ["$user_id", userId] },
                        ],
                      },
                    },
                  },
                ],
                as: "date_details",
              },
            },
            {
              $lookup: {
                from: "users",
                let: { userId: "$user_id" },
>>>>>>> 5376a7b4716c23194663b26f86e3bc70a8fde5ab
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$user_id", "$$userId"],
                      },
                    },
                  },
                  {
                    $project: { "user_email": 1 }
                  }
                ],
                as: "university_details",
              },
            },
            {
<<<<<<< HEAD
              $unwind: "$university_details",
=======
              $unwind: {
                path: "$user_info",
                preserveNullAndEmptyArrays: true // optional
              }
            },
            {
              $lookup: {
                from: "user_profiles",
                let: { userId: "$user_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$user_id", "$$userId"],
                      },
                    },
                  },
                  {
                    $project: { "user_profile": 1, "user_gender": 1 }
                  }
                ],
                as: "user_profiles",
              },
            },
            {
              $unwind: {
                path: "$user_profiles",
                preserveNullAndEmptyArrays: true // optional
              }
            },
            {
              $sort: { "dating_date": 1 },
            },
            {
              $skip: skip,
            },
            {
              $limit: limit,
>>>>>>> 5376a7b4716c23194663b26f86e3bc70a8fde5ab
            },

          ],
          (err, data) => {
            if (err) {
              console.log("error", err);
              reject(err);
            }
            if (!err) {
              resolve(data);
            }
          }
        );
      } catch (error) {
        console.log("error", error);
      }
    });
  }

  getThreadsListByUserId(filter, sort, skip, limit) {
    ////console.log(filter)
    return new Promise((resolve, reject) => {
      this.collection.aggregate([
        {
          $match: filter
        },
        {
          $lookup: {
            from: 'users',
            localField: 'receiver_user_id',
            foreignField: '_id',
            as: 'connector'
          }
        },
        {
          $unwind: {
            path: "$connector",
            preserveNullAndEmptyArrays: true // optional
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'users'
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
            "updatedAt": { $first: "$updatedAt" },
            "sender_user_id": { $first: "$sender_user_id" },
            "receiver_user_id": { $first: "$receiver_user_id" },
            "subject": { $first: "$subject" },
            "last_msg": { $first: "$last_msg" },
            "delete_status": { $first: "$delete_status" },
            "connector_fullname": { $first: "$connector.user_fullname" },
            "connector_notification_status": { $first: "$connector.notification_status" },
            "connector_socketid": { $first: "$connector.socket_id" },
            "reciver_device_token": { $first: "$connector.device_token" },
            "sender_device_token": { $first: "$users.device_token" },
            "connector_photo": { $first: "$connector.user_photo" },
            "user_fullname": { $first: "$users.user_fullname" },
            "user_photo": { $first: "$users.user_photo" }
          }
        },
        {
          $sort: sort
        },
        {
          $skip: skip
        },

        // Stage 8
        {
          $limit: limit
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

  getMessageListBythreaId(filter, sort, skip, limit) {
    ////console.log(filter)
    return new Promise((resolve, reject) => {
      this.collection.aggregate([
        {
          $match: filter
        },
        // { 
        //     $lookup: {
        //         from: 'users',
        //         localField: 'connector_id',
        //         foreignField: '_id',
        //         as: 'users'
        //     }
        // },
        // {
        //     $unwind: {
        //         path: "$users",
        //         preserveNullAndEmptyArrays: true // optional
        //     }
        // },
        {
          $group: {
            "_id": "$_id",
            "createdAt": { $first: "$createdAt" },
            "updatedAt": { $first: "$updatedAt" },
            "thread_id": { $first: "$thread_id" },
            "sender_id": { $first: "$sender_id" },
            "receiver_id": { $first: "$receiver_id" },
            "message": { $first: "$message" },
            "delete_status": { $first: "$delete_status" },
            "read_status": { $first: "$read_status" },
            "flag_status": { $first: "$flag_status" },
            "sent_status": { $first: "$sent_status" },
            "is_opened": { $first: "$is_opened" },
            "receive_status": { $first: "$receive_status" }
          }
        },
        {
          $sort: sort
        },
        {
          $skip: skip
        },

        // Stage 8
        {
          $limit: limit
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

  getCountMessageListBythreaId(filter) {
    ////console.log(filter)
    return new Promise((resolve, reject) => {
      this.collection.aggregate([
        {
          $match: filter
        },
        // { 
        //     $lookup: {
        //         from: 'users',
        //         localField: 'connector_id',
        //         foreignField: '_id',
        //         as: 'users'
        //     }
        // },
        // {
        //     $unwind: {
        //         path: "$users",
        //         preserveNullAndEmptyArrays: true // optional
        //     }
        // },
        {
          $group: {
            "_id": "$_id",
            "createdAt": { $first: "$createdAt" },
            "updatedAt": { $first: "$updatedAt" },
            "thread_id": { $first: "$thread_id" },
            "sender_id": { $first: "$sender_id" },
            "receiver_id": { $first: "$receiver_id" },
            "message": { $first: "$message" },
            "delete_status": { $first: "$delete_status" },
            "read_status": { $first: "$read_status" },
            "flag_status": { $first: "$flag_status" },
            "sent_status": { $first: "$sent_status" },
            "receive_status": { $first: "$receive_status" }
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

}
module.exports = Aggregation;
