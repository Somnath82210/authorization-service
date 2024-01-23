import momentTimeZone from "moment-timezone";
import * as bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import nodemailer from "nodemailer";
import axios from "axios";
dotenv.config();
export function encryptHash(data: string) {
  let salt = process.env.SALT_ROUND;
  return bcrypt.hash(data, Number(salt) || 10);
}
export function comparePassword(inputPassword: string, hashedPassword: string) {
  return bcrypt.compare(inputPassword, hashedPassword);
}
export function findSimilarValues(data: any) {
  if (data.length === 0) {
    return [];
  }
  let newArr: string[] = [];
  data.map((value: any) => {
    for (let i in value.parentId) {
      if (value.parentId[i] !== undefined) {
        newArr.push(value.parentId[i]);
      }
    }
  });
  let newSet = [...new Set(newArr)];
  return newSet;
}

export function stringToBool(data: string) {
  if (
    data === "true" ||
    data === "available" ||
    (data === "1" && typeof data === "string")
  ) {
    console.log("true data");
    return true;
  } else if (
    data === "false" ||
    data === "not available" ||
    (data === "0" && typeof data === "string")
  ) {
    console.log("elseif false");
    return false;
  } else {
    console.log("false data");
    false;
  }
}

export function localDateChanger(date: any) {
  if (typeof date === "undefined") {
    return date;
  }
  const currentTimeZone = momentTimeZone.tz(date, "Asia/Kolkata");
  return currentTimeZone.format("YYYY-MM-DD HH:mm:ss");
}

export async function sendMail(data: string) {
  return new Promise(async (resolve, reject) => {
    const transporter = await nodemailer.createTransport({
      host: "mail.a1future.net",
      port: 465,
      secure: true,
      auth: {
        user: "somnath_dutta@a1future.net",
        pass: "x_z}(hBBb}-e",
      },
    });
    const otp = Math.floor(100000 + Math.random() * 900000);
    await transporter.sendMail(
      {
        from: "somnath_dutta@a1future.net", // sender address
        to: data, // list of receivers
        subject: "Email Verification ✔", // Subject line
        text: "Do not Share this OTP", // plain text body
        html: otp.toString(), // html body
      },
      (error, value) => {
        if (error) {
          resolve({ error: "mail not sent" });
        } else if (value.response) {
          resolve({ data: "mail sent" });
        }
      }
    );
  });
}

export async function sendSMS(data: string) {
  return new Promise(async (resolve, reject) => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    let dataSMS = {
      variables_values: otp.toString(),
      route: "otp",
      numbers: data,
    };
    const headers = {
      authorization: process.env.SMS_AUTH,
    };
    await axios
      .post(process.env.SMS_API as string, dataSMS, {
        headers,
      })
      .then(() => {
        resolve({ data: "sms sent" });
      })
      .catch((err: any) => {
        console.log("error from axios catch", err);
        resolve({ error: "sms not sent" });
      });
  });
}
