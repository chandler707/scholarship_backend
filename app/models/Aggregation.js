const Model = require("../models/Model");
const _ = require("lodash");
let ObjectId = require("mongodb").ObjectID;
var total_view = 0;

class Aggregation {
  constructor(collection) {
    this.collection = collection;
  }

  getUniversityDetails(filter, skip, limit) {
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
                        $eq: ["$user_id", "$$userId"],
                      },
                    },
                  },
                ],
                as: "university_details",
              },
            },
            {
              $unwind: "$university_details",
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
