const Controller = require("./Controller");
const ObjectID = require("mongodb").ObjectId;

const _ = require("lodash");
const Model = require("../models/Model");
const Globals = require("../../configs/Globals");
const User = require("../models/UserSchema").Users;
const CourseCategory = require("../models/CoursesCategory").CourseCategory;
const Language = require("../models/LanguageSchema").Language;
const Course = require("../models/CourseSchema").Course;
const AttributeValue = require("../models/AttributesSchema").AttributeValue;
const UniversityDetail =
  require("../models/UniversityDetail").UniversityDetails;
const fs = require("fs");
const StudentCountry = require("../models/StudentLocation").StudentCountry;
const StudentState = require("../models/StudentLocation").StudentState;
const path = require("path");
const bcrypt = require("bcrypt");
class BulkEntryController extends Controller {
  constructor() {
    super();
  }

  async UniversityEntry() {
    let _this = this;
    try {
      const data = fs.readFileSync(path.join(__dirname, "/data.txt"), "utf8");
      let newData = JSON.parse(data);
      let datas = await GetData(newData);
      if (datas) {
        _this.res.send({ message: "done" });
      }
    } catch (error) {
      // console.log("error", error);
      let globalObj = new Globals();
      var dataErrorObj = {
        is_from: "API Error",
        api_name: "admin route Api",
        function_name: "addLanguage",
        error_title: error.name,
        description: error.message,
      };
      globalObj.addErrorLogInDB(dataErrorObj);
      return _this.res.send({ status: 0, message: "Server Error" });
    }
  }
}

function GetData(newData) {
  try {
    return new Promise(async (resolve, reject) => {
      let len = newData ? newData.length : 0;
      let num = 0;
      console.log("number", len);
      CountryWise(newData, len, num, function (finalData) {
        resolve(finalData);
      });
    });
  } catch (error) {}
}
function GetDa(leData, country, state) {
  try {
    return new Promise(async (resolve, reject) => {
      let len = leData ? leData.length : 0;
      let num = 0;
      SaveData(leData, country, state, len, num, function (finalData) {
        resolve(finalData);
      });
    });
  } catch (error) {}
}
function GetCourse(courseData, userId) {
  try {
    return new Promise(async (resolve, reject) => {
      console.log("firset");
      let len = courseData ? courseData.length : 0;
      let num = 0;
      SaveCourseData(courseData, userId, len, num, function (finalData) {
        resolve(finalData);
      });
    });
  } catch (error) {}
}
function GetCourseDetail(courseDet, userId) {
  try {
    return new Promise(async (resolve, reject) => {
      let len = courseDet.length;
      let num = 0;
      SaveCourseDetail(courseDet, userId, len, num, function (finalData) {
        resolve(finalData);
      });
    });
  } catch (error) {}
}
function GetCourseDetailasd(courseDetas, cat, userId) {
  try {
    return new Promise(async (resolve, reject) => {
      let len = courseDetas ? courseDetas.length : 0;
      let num = 0;
      SaveCourseDetailasd(
        courseDetas,
        userId,
        cat,
        len,
        num,
        function (finalData) {
          resolve(finalData);
        }
      );
    });
  } catch (error) {}
}
async function CountryWise(newData, len, num, fn) {
  console.log("start");
  if (len !== 0) {
    if (!_.isEmpty(newData[num].country)) {
      let country = await StudentCountry.findOne({
        name: newData[num].country,
      });
      if (!_.isEmpty(country)) {
        let state = await StudentState.findOne({
          countryCode: country.isoCode,
        });

        if (!_.isEmpty(newData[num].universities)) {
          let ff = await GetDa(newData[num].universities, country, state);
        }
      }
    }
  }

  if (num === len - 1 || len === 0) {
    fn(true);
  } else {
    num = num + 1;
    CountryWise(newData, len, num, fn);
  }
}
async function SaveData(newData, country, state, len, num, fn) {
  if (len !== 0) {
    let obj = {};

    // console.log(num);
    if (!_.isEmpty(newData[num]) || !country || !state) {
      obj["name"] = newData[num].name ? newData[num].name : "";
      obj["email"] = newData[num].name
        ? `${obj.name.split(" ").join("")}@gmail.com`
        : "";
      obj["mobile"] = 1234567890;
      obj["password"] = await bcrypt.hash("123456", 10);
      obj["user_type"] = "university";
      obj["country"] = country?._id;
      obj["state"] = state?._id;
      obj["profile_picture"] = newData[num].logo ? newData[num].logo : "";
      // console.log(obj);

      let saveUser = await new Model(User).store(obj);
      // console.log(saveUser);

      if (!_.isEmpty(saveUser)) {
        let detailObj = {};
        detailObj["user_id"] = saveUser._id;
        detailObj["university_type"] = newData[num].attributes.type
          ? newData[num].attributes.type
          : "";
        detailObj["about"] = newData[num].about ? newData[num].about : "";
        detailObj["established_year"] = newData[num].attributes.established
          ? newData[num].attributes.established.split(" ")[1]
          : "";

        detailObj["location"] = newData[num].attributes.location
          ? newData[num].attributes.location
          : "";
        detailObj["world_rank"] = newData[num].attributes.world_rank
          ? newData[num].attributes.world_rank.split("-")[1]
          : "";
        detailObj["rating"] = newData[num].attributes.rating
          ? newData[num].attributes.rating.split("-")[1]
          : "";
        detailObj["accomodation"] = newData[num].attributes.accomodation
          ? newData[num].attributes.accomodation === "Yes"
            ? true
            : false
          : false;
        detailObj["scholarship"] = newData[num].attributes.scholarship
          ? newData[num].attributes.scholarship === "Yes"
            ? true
            : false
          : false;
        detailObj["part_time_work"] = newData[num].attributes.part_time_work
          ? newData[num].attributes.part_time_work === "Yes"
            ? true
            : false
          : false;
        // console.log(detailObj);

        let n = await new Model(UniversityDetail).store(detailObj);
        if (!_.isEmpty(n)) {
          if (newData[num].hasOwnProperty("courses")) {
            let ff = await GetCourse(newData[num].courses, n.user_id);
            console.log(num);
            console.log(newData[num].courses);
          }
        }
      }
    }

    if (num === len - 1 || len === 0) {
      // console.log("inisde break");
      fn(true);
    } else {
      // console.log("inisde continuation");

      num = num + 1;
      SaveData(newData, country, state, len, num, fn);
    }
  }
}

async function SaveCourseData(newData, userId, len, num, fn) {
  if (len !== 0) {
    if (newData[num].category_name) {
      let findoutcat = await CourseCategory.findOne({
        category_name: newData[num].category_name,
      });
      let cat = {};
      if (_.isEmpty(findoutcat)) {
        let sav = await new Model(CourseCategory).store({
          category_name: newData[num].category_name,
        });
        cat = sav;
      } else {
        cat = findoutcat;
      }
      if (!_.isEmpty(cat)) {
        let ff = await GetCourseDetailasd(newData[num].courses, cat, userId);
      }
    }
  }

  if (num === len - 1 || len === 0) {
    fn(true);
  } else {
    num = num + 1;
    SaveCourseData(newData, userId, len, num, fn);
  }
}
// async function SaveCourseDetail(newData, userId, len, num, fn) {
//   if (len !== 0 || !newData[num].category_name) {
//     let findoutcat = await CourseCategory.findOne({
//       category_name: newData[num].category_name,
//     });
//     let cat = {};
//     if (_.isEmpty(findoutcat)) {
//       let sav = await new Model(CourseCategory).store({
//         category_name: newData[num].category_name,
//       });
//       cat = sav;
//     } else {
//       cat = findoutcat;
//     }
//     // console.log(newData);
//     if (!_.isEmpty(cat)) {
//       let as = await GetCourseDetailasd(newData, cat, userId);
//     }
//   }
//   if (num === len - 1 || len === 0) {
//     fn(true);
//   } else {
//     num = num + 1;
//     SaveCourseDetail(newData, userId, len, num, fn);
//   }
// }

async function SaveCourseDetailasd(newData, userId, cat, len, num, fn) {
  if (len !== 0) {
    console.log("datata in course", newData[num]);
    let obj = {};
    obj["user_id"] = userId;
    obj["category_id"] = cat;
    obj["course_name"] = newData[num].course_name
      ? newData[num].course_name
      : "";
    obj["total_course_fees"] = newData[num].total_course_fees
      ? newData[num].total_course_fees
      : "";
    obj["admission"] = newData[num].intake ? newData[num].intake : "";

    obj["course_duration"] = newData[num].course_duration
      ? parseInt(newData[num].course_duration.split(" ")[0])
      : "";
    if (newData[num].course_level) {
      let a = await AttributeValue.findOne({
        attribute_value: newData[num].course_level,
      });
      if (_.isEmpty(a)) {
        let add = await new Model(AttributeValue).store({
          attribute_id: "63074c001911d12f40de32d7",
          attribute_value: newData[num].course_level,
        });
        obj["course_level"] = add._id;
      } else {
        obj["course_level"] = a._id;
      }
    }
    if (newData[num].course_program) {
      let a = await AttributeValue.findOne({
        attribute_value: newData[num].course_program,
      });
      if (_.isEmpty(a)) {
        let add = await new Model(AttributeValue).store({
          attribute_id: "63074c0e1911d12f40de32db",
          attribute_value: newData[num].course_program,
        });
        obj["course_program"] = add._id;
      } else {
        obj["course_program"] = a._id;
      }
    }
    if (newData[num].work_experience) {
      let a = await AttributeValue.findOne({
        attribute_value: newData[num].work_experience,
      });
      if (_.isEmpty(a)) {
        let add = await new Model(AttributeValue).store({
          attribute_id: "631c27276ac06b00166054fb",
          attribute_value: newData[num].work_experience,
        });
        obj["work_experience"] = add._id;
      } else {
        obj["work_experience"] = a._id;
      }
    }
    if (newData[num].required_degree) {
      let a = await AttributeValue.findOne({
        attribute_value: newData[num].required_degree,
      });
      if (_.isEmpty(a)) {
        let add = await new Model(AttributeValue).store({
          attribute_id: "631c25736ac06b00166054ee",
          attribute_value: newData[num].required_degree,
        });
        obj["required_degress"] = add._id;
      } else {
        obj["required_degress"] = a._id;
      }
    }

    if (newData[num].course_language) {
      let a = await Language.findOne({
        language_name: newData[num].course_language,
      });
      if (_.isEmpty(a)) {
        let add = await new Model(Language).store({
          language_name: newData[num].course_language,
        });
        obj["course_language"] = add._id;
      } else {
        obj["course_language"] = a._id;
      }
    }
    let sb = await new Model(Course).store(obj);
    console.log("end");
  }
  if (num === len - 1 || len === 0) {
    fn(true);
  } else {
    num = num + 1;
    SaveCourseDetailasd(newData, len, num, fn);
  }
}

module.exports = BulkEntryController;
