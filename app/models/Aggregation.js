const Model = require("../models/Model");
const _ = require("lodash");
let ObjectId = require("mongodb").ObjectID;
var total_view = 0;
const moment = require("moment");
var todayDate = new Date(moment().format("YYYY-MM-DD") + "T00:00:00.000Z");
console.log("todayDate", todayDate);

class Aggregation {
  constructor(collection) {
    this.collection = collection;
  }

  getUniversityDetails(filter) {
    return new Promise((resolve, reject) => {
      try {
        this.collection.aggregate(
          [
            {
              $match: filter,
            },
            {
              $lookup: {
                from: "university_details",
                let: { userId: "$_id" },

                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [{ $eq: ["$user_id", "$$userId"] }],
                      },
                    },
                  },
                ],

                as: "university_details",
              },
            },
            {
              $unwind: {
                path: "$university_details",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "student_countries",
                let: { userId: "$country" },

                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [{ $eq: ["$_id", "$$userId"] }],
                      },
                    },
                  },
                ],

                as: "country_detail",
              },
            },
            {
              $unwind: {
                path: "$country_detail",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "student_states",
                let: { userId: "$state" },

                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [{ $eq: ["$_id", "$$userId"] }],
                      },
                    },
                  },
                ],

                as: "state_detail",
              },
            },
            {
              $unwind: {
                path: "$state_detail",
                preserveNullAndEmptyArrays: true,
              },
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
