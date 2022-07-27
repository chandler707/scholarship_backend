const Model = require("../models/Model");
const _ = require("lodash");
let ObjectId = require("mongodb").ObjectID;
var total_view = 0;

class Aggregation {
  constructor(collection) {
    this.collection = collection;
  }

  matchedUserDetails(filter, skip, limit) {
    return new Promise((resolve, reject) => {
      try {
        this.collection.aggregate(
          [
            {
              $match: filter,
            },
            {
              $lookup: {
                from: "users",
                let: { userId: "$user_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$_id", "$$userId"],
                      },
                    },
                  },
                ],
                as: "user_info",
              },
            },
            {
              $unwind: "$user_info",
            },
            {
              $lookup: {
                from: "user_images",
                let: { userId: "$user_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$_id", "$$userId"] },
                          { $eq: ["$is_profile_image", true] },
                        ],
                      },
                    },
                  },
                ],
                as: "profile_picture",
              },
            },
            {
              $unwind: "$profile_picture",
            },
            {
              $group: {
                _id: "$user_id",
                username: { $first: "$user_info.username" },
                user_gender: { $first: "$user_gender" },
                user_age: { $first: "$user_age" },
                profile_picture: { $first: "$profile_picture.image_name" },
              },
            },
            {
              $skip: skip,
            },
            {
              $limit: limit,
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
