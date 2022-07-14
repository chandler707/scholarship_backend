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
}
module.exports = Aggregation;
