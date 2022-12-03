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
let userArray = [];
let universityDetailArray = [];
let courseCategoryArray = [];
let courseArray = [];
let AttributeValueArray = [];
let storeAttributeArray = [];
let storeLangArray = [];
let languageArray = [];
class BulkEntryController extends Controller {
  constructor() {
    super();
  }

  async UniversityEntry() {
    let _this = this;
    try {
      userArray.length = 0;
      universityDetailArray.length = 0;
      courseCategoryArray.length = 0;
      courseArray.length = 0;
      AttributeValueArray.length = 0;
      storeAttributeArray.length = 0;
      storeLangArray.length = 0;
      languageArray.length = 0;
      console.log(userArray);
      const data = fs.readFileSync(path.join(__dirname, "/data.txt"), "utf8");
      let newData = JSON.parse(data);
      console.log(newData.length);
      let countryList = await StudentCountry.find();
      let stateList = await StudentState.find();
      let courseCategory = await CourseCategory.find();
      let language = await Language.find({ is_delete: false });
      let attValue = await AttributeValue.find({ is_delete: false });
      languageArray = language;
      AttributeValueArray = attValue;

      let datas = await GetDataFn(
        newData,
        countryList,
        stateList,
        courseCategory
      );
      if (datas) {
        console.log("user data", userArray[0]);
        console.log("detail data", universityDetailArray[0]);
        console.log("course category", courseCategoryArray);
        // console.log("course array", courseArray[0]);

        // console.log("attribute", storeAttributeArray[0]);
        // console.log("lang", storeLangArray[0]);

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

function GetDataFn(newData, countryList, stateList, courseCategory) {
  return new Promise(async (resolve, reject) => {
    try {
      GetData(newData, countryList, stateList, courseCategory, function (res) {
        resolve(true);
      });
    } catch (error) {
      resolve(true);
    }
  });
}

function GetData(newData, countryList, stateList, courseCategory, fn) {
  try {
    // return new Promise(async (resolve, reject) => {
    let len = newData ? newData.length : 0;
    let num = 0;
    // console.log("number", len);
    CountryWise(
      newData,
      countryList,
      stateList,
      courseCategory,
      len,
      num,
      function (finalData) {
        fn(true);
      }
    );
    // });
  } catch (error) {}
}

async function CountryWise(
  newData,
  countryList,
  stateList,
  courseCategory,
  len,
  num,
  fn
) {
  // console.log("level 1");
  // console.log("num", num);
  if (len > 0) {
    if (newData[num]) {
      // console.log("inside the num if");
      if (!_.isEmpty(newData[num].country)) {
        // console.log("inside the country key", newData[num].country);
        let country = countryList.find((e) => e.name === newData[num].country);
        // let country = await StudentCountry.findOne({
        //   name: newData[num].country,
        // });
        if (!_.isEmpty(country)) {
          let state = stateList.find((e) => e.countryCode === country.isoCode);

          // let state = await StudentState.findOne({
          //   countryCode: country.isoCode,
          // });
          // console.log("kya dikkat yha h");
          if (!_.isEmpty(newData[num].universities)) {
            // console.log("nhi dikkat yha h");

            GetDa(
              newData[num].universities,
              country,
              state,
              courseCategory,
              function (res) {
                if (num === len - 1) {
                  // console.log("succesffull");
                  fn(true);
                } else {
                  // console.log("iske andar ");
                  num = num + 1;
                  CountryWise(
                    newData,
                    countryList,
                    stateList,
                    courseCategory,
                    len,
                    num,
                    fn
                  );
                }
              }
            );
          } else {
            if (num === len - 1) {
              // console.log("succesffull");
              fn(true);
            } else {
              // console.log("iske andar ");
              num = num + 1;
              CountryWise(
                newData,
                countryList,
                stateList,
                courseCategory,
                len,
                num,
                fn
              );
            }
          }
        } else {
          if (num === len - 1) {
            // console.log("succesffull");
            fn(true);
          } else {
            num = num + 1;
            CountryWise(
              newData,
              countryList,
              stateList,
              courseCategory,
              len,
              num,
              fn
            );
          }
        }
      } else {
        if (num === len - 1) {
          // console.log("succesffull");
          fn(true);
        } else {
          // console.log("inside the cuntry key contiuation");

          num = num + 1;
          CountryWise(
            newData,
            countryList,
            stateList,
            courseCategory,
            len,
            num,
            fn
          );
        }
      }
    } else {
      if (num === len - 1) {
        // console.log("succesffull");
        fn(true);
      } else {
        // console.log("inside the num  contiuation");

        num = num + 1;
        CountryWise(
          newData,
          countryList,
          stateList,
          courseCategory,
          len,
          num,
          fn
        );
      }
    }
  } else {
    fn(true);
  }

  // if (num === len - 1 || len === 0) {
  //   console.log("succesffull");
  //   fn(true);
  // } else {
  //   num = num + 1;
  //   CountryWise(newData, countryList, stateList, courseCategory, len, num, fn);
  // }
}

function GetDa(leData, country, state, courseCategory, fn) {
  try {
    // return new Promise(async (resolve, reject) => {
    let len = leData ? leData.length : 0;
    let num = 0;
    SaveData(
      leData,
      country,
      state,
      courseCategory,
      len,
      num,
      function (finalData) {
        fn(true);
      }
    );
    // });
  } catch (error) {}
}

async function SaveData(newData, country, state, courseCategory, len, num, fn) {
  // console.log("num", num, len);
  if (len > 0) {
    let obj = {};
    if (newData[num]) {
      // console.log("level 2");

      // console.log(num);
      if (!_.isEmpty(newData[num]) || !country || !state) {
        obj["_id"] = ObjectID();
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

        // let saveUser = await new Model(User).store(obj);
        userArray.push(obj);
        // console.log(saveUser);

        if (!_.isEmpty(obj)) {
          let detailObj = {};
          detailObj["_id"] = ObjectID();
          detailObj["user_id"] = obj._id;
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

          // let n = await new Model(UniversityDetail).store(detailObj);
          universityDetailArray.push(detailObj);
          if (!_.isEmpty(detailObj)) {
            // console.log(newData[num]);
            if (newData[num].hasOwnProperty("courses")) {
              let ff = GetCourse(
                newData[num].courses,
                detailObj.user_id,
                courseCategory,
                function (res) {
                  if (num === len - 1 || len === 0) {
                    // console.log("inisde break");
                    fn(true);
                  } else {
                    // console.log("inisde continuation");

                    num = num + 1;
                    SaveData(
                      newData,
                      country,
                      state,
                      courseCategory,
                      len,
                      num,
                      fn
                    );
                  }
                }
              );
              // console.log(num);
              // console.log(newData[num].courses);
            } else {
              // console.log("inside else");
              if (num === len - 1 || len === 0) {
                // console.log("inisde break");
                fn(true);
              } else {
                // console.log("inisde continuation");

                num = num + 1;
                SaveData(newData, country, state, courseCategory, len, num, fn);
              }
            }
          }
        }
      }
    } else {
      // console.log("inside no value numdata ");
      if (num === len - 1 || len === 0) {
        // console.log("inisde break");
        fn(true);
      } else {
        // console.log("inisde continuation");

        num = num + 1;
        SaveData(newData, country, state, courseCategory, len, num, fn);
      }
    }
  } else {
    fn(true);
  }
}

function GetCourse(courseData, userId, courseCategory, fn) {
  try {
    // return new Promise(async (resolve, reject) => {
    // console.log("firset");
    let len = courseData ? courseData.length : 0;
    let num = 0;
    SaveCourseData(
      courseData,
      userId,
      courseCategory,
      len,
      num,
      function (finalData) {
        fn(finalData);
      }
    );
    // });
  } catch (error) {}
}

function GetCourseDetailasd(courseDetas, cat, userId, fn) {
  try {
    // return new Promise(async (resolve, reject) => {
    let len = courseDetas ? courseDetas.length : 0;
    let num = 0;
    SaveCourseDetailasd(
      courseDetas,
      userId,
      cat,
      len,
      num,
      function (finalData) {
        fn(finalData);
      }
    );
    // });
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

async function SaveCourseData(newData, userId, courseCategory, len, num, fn) {
  if (len > 0) {
    // console.log("level 3");

    if (newData[num]) {
      if (newData[num].category_name) {
        let findoutcat = courseCategory.find(
          (e) => e.category_name === newData[num].category_name
        );

        // let findoutcat = await CourseCategory.findOne({
        //   category_name: newData[num].category_name,
        // });
        let cat = {};
        if (_.isEmpty(findoutcat)) {
          cat["_id"] = ObjectID();
          cat["category_name"] = newData[num].category_name;

          courseCategoryArray.push(cat);
          // let sav = await new Model(CourseCategory).store({
          //   category_name: newData[num].category_name,
          // });
        } else {
          cat = findoutcat;
        }
        if (!_.isEmpty(cat)) {
          GetCourseDetailasd(newData[num].courses, cat, userId, function (res) {
            if (num === len - 1 || len === 0) {
              fn(true);
            } else {
              num = num + 1;
              SaveCourseData(newData, userId, courseCategory, len, num, fn);
            }
          });
        }
      }
    }
  } else {
    fn(true);
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
  if (len > 0) {
    // console.log("level 4");

    if (newData[num]) {
      // console.log("datata in course", newData[num]);
      let obj = {};
      obj["_id"] = ObjectID();
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
        let a = AttributeValueArray.find(
          (e) => e.attribute_value === newData[num].course_level
        );
        // let a = await AttributeValue.findOne({
        //   attribute_value: newData[num].course_level,
        // });
        if (_.isEmpty(a)) {
          let add = {
            _id: ObjectID(),
            attribute_id: "63074c001911d12f40de32d7",
            attribute_value: newData[num].course_level,
          };
          storeAttributeArray.push(add);

          // let add = await new Model(AttributeValue).store({
          //   attribute_id: "63074c001911d12f40de32d7",
          //   attribute_value: newData[num].course_level,
          // });
          obj["course_level"] = add._id;
        } else {
          obj["course_level"] = a._id;
        }
      }
      if (newData[num].course_program) {
        let a = AttributeValueArray.find(
          (e) => e.attribute_value === newData[num].course_program
        );
        // let a = await AttributeValue.findOne({
        //   attribute_value: newData[num].course_program,
        // });
        if (_.isEmpty(a)) {
          let add = {
            _id: ObjectID(),
            attribute_id: "63074c0e1911d12f40de32db",
            attribute_value: newData[num].course_program,
          };
          storeAttributeArray.push(add);

          // let add = await new Model(AttributeValue).store({
          //   attribute_id: "63074c0e1911d12f40de32db",
          //   attribute_value: newData[num].course_program,
          // });
          obj["course_program"] = add._id;
        } else {
          obj["course_program"] = a._id;
        }
      }
      if (newData[num].work_experience) {
        let a = AttributeValueArray.find(
          (e) => e.attribute_value === newData[num].work_experience
        );
        // let a = await AttributeValue.findOne({
        //   attribute_value: newData[num].work_experience,
        // });
        if (_.isEmpty(a)) {
          let add = {
            _id: ObjectID(),
            attribute_id: "631c27276ac06b00166054fb",
            attribute_value: newData[num].work_experience,
          };
          storeAttributeArray.push(add);

          // let add = await new Model(AttributeValue).store({
          //   attribute_id: "631c27276ac06b00166054fb",
          //   attribute_value: newData[num].work_experience,
          // });
          obj["work_experience"] = add._id;
        } else {
          obj["work_experience"] = a._id;
        }
      }
      if (newData[num].required_degree) {
        let a = AttributeValueArray.find(
          (e) => e.attribute_value === newData[num].required_degree
        );
        // let a = await AttributeValue.findOne({
        //   attribute_value: newData[num].required_degree,
        // });
        if (_.isEmpty(a)) {
          let add = {
            _id: ObjectID(),
            attribute_id: "631c25736ac06b00166054ee",
            attribute_value: newData[num].required_degree,
          };
          storeAttributeArray.push(add);

          // let add = await new Model(AttributeValue).store({
          //   attribute_id: "631c25736ac06b00166054ee",
          //   attribute_value: newData[num].required_degree,
          // });
          obj["required_degress"] = add._id;
        } else {
          obj["required_degress"] = a._id;
        }
      }

      if (newData[num].course_language) {
        let a = languageArray.find(
          (e) => e.language_name === newData[num].course_language
        );
        // let a = await Language.findOne({
        //   language_name: newData[num].course_language,
        // });
        if (_.isEmpty(a)) {
          let add = {
            _id: ObjectID(),
            language_name: newData[num].course_language,
          };
          storeLangArray.push(add);
          // let add = await new Model(Language).store({
          //   language_name: newData[num].course_language,
          // });
          obj["course_language"] = add._id;
        } else {
          obj["course_language"] = a._id;
        }
      }
      if (newData[num].fee_structure) {
        if (newData[num].fee_structure.length > 0) {
          let feeArray = [];
          newData[num].fee_structure.map((ele, index) => {
            let ob = {};
            ob["year"] = index + 1;
            ob["fees"] = ele.value;
            feeArray.push(ob);
          });
          obj["fees"] = feeArray;
        }
      }
      // let sb = await new Model(Course).store(obj);
      courseArray.push(obj);
      // console.log("end");
    }

    if (num === len - 1 || len === 0) {
      fn(true);
    } else {
      num = num + 1;
      SaveCourseDetailasd(newData, userId, cat, len, num, fn);
    }
  } else {
    fn(true);
  }
}

module.exports = BulkEntryController;
