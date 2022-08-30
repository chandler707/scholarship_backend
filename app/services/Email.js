// /****************************
//  EMAIL HANDLING OPERATIONS
//  ****************************/
// // let mail = require('nodemailer').mail;
// let nodemailer = require("nodemailer");
// const File = require("./File");
// const path = require("path");
// const _ = require("lodash");
// const Globals = require("../../configs/Globals");

// class Email {
//   constructor() {}

//   addEmailLog(
//     email,
//     status,
//     job_id,
//     user_id,
//     template_id,
//     description,
//     email_type
//   ) {
//     try {
//       let globalObj = new Globals();
//       var dataErrorObj = {
//         email: email,
//         status: status,
//         job_id: job_id,
//         user_id: user_id,
//         template_id: template_id,
//         description: description,
//         email_type: email_type,
//       };
//       globalObj.addEmailLogInDB(dataErrorObj);
//     } catch (error) {}
//   }

//   send(mailOption) {
//     try {
//       return new Promise(async (resolve, reject) => {
//         //****** Gmail SMTP ------------------------- *************
//         // smtpTransport.sendMail(mailOption, (err, result) => {
//         //     if (err) {

//         //         ////console.log("er =", err);
//         //         reject({ sattus: 0, message: err });
//         //     }
//         //     return resolve(result);
//         // });

//         //********************* SendGrid *********************************

//         //var data = sgMail.send(mailOption);
//         //console.log("1212121212")
//         sgMail.send(mailOption).then(
//           () => {},
//           (error) => {
//             //console.error(error);

//             if (error.response) {
//               //console.error('898989898',error.response.body)
//             }
//           }
//         );

//         ////console.log("sendEmailUserSendGrid", data)
//         return resolve(true);
//       });
//     } catch (error) {
//       //console.log('error222', error)
//     }
//   }

//   sendSmtp(mailOption) {
//     try {
//       return new Promise(async (resolve, reject) => {
//         //****** Gmail SMTP ------------------------- *************
//         smtpTransport.sendMail(mailOption, (err, result) => {
//           if (err) {
//             ////console.log("er =", err);
//             reject({ sattus: 0, message: err });
//           }
//           return resolve(result);
//         });
//       });
//     } catch (error) {
//       ////console.log('error', error)
//     }
//   }

//   sendEmailUserSendGrid() {
//     ////console.log("sendEmailUserSendGrid ******")
//     try {
//       return new Promise(async (resolve, reject) => {
//         //console.log("22222222")
//         let emailObj = new Email();
//         const msg = {
//           to: ["sagar.joshi@zusedigital.com", "sag01@mailinator.com"],
//           from: "administracion@albya.com",
//           templateId: "d-b145cae2473a4ab99f07667b473bc22a",
//           dynamic_template_data: {
//             subject: "demo test",
//             name: "John",
//             email_id: "test@test.com",
//             phone: "1234567890",
//           },
//         };

//         var data = emailObj.send(msg);

//         ////console.log("sendEmailUserSendGrid", data)
//         return resolve(true);
//       });
//     } catch (error) {
//       //console.log('error', error)
//     }
//   }

//   registerMail(email, token, role) {
//     return new Promise(async (resolve, reject) => {
//       try {
//         let link = process.env.backEndVerifyUser + "?token=" + token;

//         let emailObj = new Email();

//         const msgOption = {
//           from: process.env.defaultEmailId,
//           to: email,
//           //templateId: "d-39c5af72ad7a4653b6a6215292b86b6e",
//           templateId: "d-b145cae2473a4ab99f07667b473bc22a",
//           dynamic_template_data: {
//             subject: "Welcome to Albya !",
//             toptitle: "Welcome to Albya",
//             mailtext: "CONFIRM EMAIL",
//             desc: "To get started, we need to confirm your email address, so please click this link to finish creating your account",
//             verification_link: link,
//           },
//         };

//         const result = emailObj.send(msgOption);

//         emailObj.addEmailLog(
//           email,
//           "sent",
//           null,
//           null,
//           "d-39c5af72ad7a4653b6a6215292b86b6e",
//           null,
//           "registerMail"
//         );

//         //console.log("result", result)

//         return resolve(result);
//       } catch (error) {
//         return reject({ status: 0, message: error });
//       }
//     });
//   }

//   sendBookServiceEmail(email, token, role) {
//     return new Promise(async (resolve, reject) => {
//       try {
//         let link = process.env.backEndVerifyUser + "?token=" + token;

//         let emailObj = new Email();

//         const msgOption = {
//           from: process.env.defaultEmailId,
//           to: email,
//           //templateId: "d-39c5af72ad7a4653b6a6215292b86b6e",
//           templateId: "d-840a1c09316a4ffab99ff0e76539e029",
//           dynamic_template_data: {
//             subject: "Welcome to Albya !",
//             toptitle: "Welcome to Albya",
//             mailtext: "CONFIRM EMAIL",
//             desc: "To get started, we need to confirm your email address, so please click this link to finish creating your account",
//             verification_link: link,
//           },
//         };

//         const result = emailObj.send(msgOption);

//         emailObj.addEmailLog(
//           email,
//           "sent",
//           null,
//           null,
//           "d-39c5af72ad7a4653b6a6215292b86b6e",
//           null,
//           "registerMail"
//         );

//         //console.log("result", result)

//         return resolve(result);
//       } catch (error) {
//         return reject({ status: 0, message: error });
//       }
//     });
//   }

//   forgotPasswordMail(email, token, name) {
//     return new Promise(async (resolve, reject) => {
//       try {
//         //console.log(email, token, name)
//         // if (user == 'admin') {
//         //     link = process.env.adminUrl + '?token=' + token;
//         // } else if (user == 'user') {
//         //     link = process.env.backEndForgotPassword + '?token=' + token;
//         // }

//         let emailObj = new Email();

//         const msgOption = {
//           from: process.env.defaultEmailId,
//           to: email,
//           templateId: "d-2f5330433da74717a9d613278cbfbd60",
//           dynamic_template_data: {
//             subject: "Reset Password Mail",
//             toptitle: "Hello " + name,
//             mailtext: "Confirmation code is " + token,
//             desc: "Forgot your password? No problem! Just copy and paste the code to reset. On the app, you will be able to enter and confirm your new password.",
//             verification_link: token,
//           },
//         };

//         const result = emailObj.send(msgOption);

//         emailObj.addEmailLog(
//           email,
//           "sent",
//           null,
//           null,
//           "d-2f5330433da74717a9d613278cbfbd60",
//           null,
//           "forgotemail"
//         );
//         return resolve(result);
//       } catch (error) {
//         //console.log("errr**", error)
//         return reject({ status: 0, message: error });
//       }
//     });
//   }

//   forgotPasswordMailAdmin(email, token, subject, user, userrole) {
//     return new Promise(async (resolve, reject) => {
//       try {
//         let link;

//         if (userrole === "superadmin") {
//           link = process.env.adminForgotPasswordUrl + "/" + token;
//         } else if (userrole == "candidate") {
//           //link = process.env.frontForgotPasswordUrl + '/' + token;
//           link = process.env.frontForgotPasswordUrl + "/candidate/" + token;
//         } else {
//           link = process.env.frontForgotPasswordUrl + "/employer/" + token;
//         }

//         if (user) {
//           user = user.charAt(0).toUpperCase() + user.slice(1);
//         } else {
//           user = "";
//         }

//         let emailObj = new Email();
//         const msgOption = {
//           from: process.env.defaultEmailId,
//           to: email,
//           templateId: "d-5d971aaadc11433bb28775e442973485",
//           dynamic_template_data: {
//             subject: subject,
//             user: user,
//             verification_link: link,
//           },
//         };

//         const result = await emailObj.send(msgOption);
//         //////console.log("result - ", result);
//         emailObj.addEmailLog(
//           email,
//           "sent",
//           null,
//           null,
//           "d-5d971aaadc11433bb28775e442973485",
//           null,
//           "forgotPasswordMailAdmin"
//         );
//         return resolve(result);
//       } catch (error) {
//         return reject({ status: 0, message: error });
//       }
//     });
//   }

//   sendResetPassSuccessMail(emailTo, subject) {
//     return new Promise(async (resolve, reject) => {
//       try {
//         let link;

//         let emailObj = new Email();
//         const msgOption = {
//           from: process.env.defaultEmailId,
//           to: emailTo,
//           templateId: "d-2fdd971bb34f4e4291b72a7963216190",
//           dynamic_template_data: {
//             subject: subject,
//           },
//         };

//         const result = await emailObj.send(msgOption);
//         ////console.log("result - ", result);
//         emailObj.addEmailLog(
//           emailTo,
//           "sent",
//           null,
//           null,
//           "d-2fdd971bb34f4e4291b72a7963216190",
//           null,
//           "sendResetPassSuccessMail"
//         );
//         return resolve(result);
//       } catch (error) {
//         return reject({ status: 0, message: error });
//       }
//     });
//   }

//   feedbackReplyEmail(data) {
//     return new Promise(async (resolve, reject) => {
//       try {
//         let emailObj = new Email();

//         const msgOption = {
//           from: process.env.defaultEmailId,
//           to: data.user_email,
//           //templateId: "d-39c5af72ad7a4653b6a6215292b86b6e",
//           templateId: "d-bcbc4866a86d4e23be742e940a402101",
//           dynamic_template_data: {
//             subject: "Reply from Albya",
//             message_reply: data.reply_messaage,
//             user_name: data.user_name,
//           },
//         };

//         const result = emailObj.send(msgOption);

//         emailObj.addEmailLog(
//           data.user_email,
//           "sent",
//           null,
//           null,
//           "d-bcbc4866a86d4e23be742e940a402101",
//           null,
//           "feedbackReplyEmail"
//         );

//         //console.log("result", result)

//         return resolve(result);
//       } catch (error) {
//         return reject({ status: 0, message: error });
//       }
//     });
//   }

//   feedbackEmail(data, subject, msg, email) {
//     return new Promise(async (resolve, reject) => {
//       try {
//         let emailObj = new Email();

//         const msgOption = {
//           from: process.env.defaultEmailId,
//           to: email ? process.env.defaultEmailId : data.user_email,
//           //templateId: "d-39c5af72ad7a4653b6a6215292b86b6e",
//           templateId: "d-3d723d368d4f43569906c19d30ee170f",
//           dynamic_template_data: {
//             subject: subject,
//             title_message: msg,
//             user_email: email ? data.user_email : null,
//             user_name: data.user_name,
//           },
//         };

//         ////console.log("msgOption", msgOption)
//         const result = emailObj.send(msgOption);

//         emailObj.addEmailLog(
//           null,
//           "sent",
//           null,
//           null,
//           "d-3d723d368d4f43569906c19d30ee170f",
//           null,
//           "feedbackEmail"
//         );

//         //console.log("result", result)

//         return resolve(result);
//       } catch (error) {
//         return reject({ status: 0, message: error });
//       }
//     });
//   }
// }

// module.exports = Email;

const mailer = require("nodemailer");
const moment = require("moment");

let transporter = mailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

class Email {
  constructor() {}

  sendForgetPasswordMail(email) {
    return new Promise(async (resolve, reject) => {
      try {
        let password = Math.random().toString(20).substring(2, 10);

        let mailOptions = {
          from: process.env.SMTP_USER,
          to: email,
          subject: "Password reset",
          text: `Your New password is ${password}....please use this password to login `,
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.log(err);
          } else {
            console.log("password reset mail success!!");
          }
        });

        return resolve(password);
      } catch (error) {
        return reject({ status: 0, message: error });
      }
    });
  }
}

module.exports = Email;
