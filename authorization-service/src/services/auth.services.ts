import dotenv from "dotenv";
import {
  PromiseResult,
  authorizationData,
  kycFullData,
  bankDetailsType,
  ondcType,
  storeTimeType,
  userData,
  adminLevelCheck,
  tokenVerifyType,
  senderPromise,
} from "../utils/types";
import {
  prismaKycUrl,
  prismaUserDataUrl,
  prismaProductUrl,
  prismaAdminDataUrl,
} from "../db/connect";
import {
  localDateChanger,
  encryptHash,
  stringToBool,
  sendMail,
  sendSMS,
} from "../utils/helpers";
import { tokenVerify } from "../utils/authVerify";

dotenv.config();

function otpGenerate() {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp;
}

export function authorization(token: string) {
  return new Promise(async (resolve, reject) => {
    try {
      let verify: any = await tokenVerify(token);
      if (verify.data === "error") {
        console.log("error in token");
        resolve({ status: false, message: "error on token" });
      }
      let userAuthStatus: authorizationData =
        await prismaUserDataUrl.user.findMany({
          where: {
            id: verify.data.id,
          },
          select: {
            kycStatus: true,
            statusCode: true,
          },
        });
      resolve({
        status: true,
        message: "valid data",
        kycStatus: userAuthStatus[0].kycStatus,
        statusCode: userAuthStatus[0].statusCode,
      });
    } catch (error) {
      console.log("error from service", error);
      reject({ status: false, message: "error from service" });
    }
  });
}

export function kycDoneService(token: string, id: string) {
  return new Promise(async (resolve, reject) => {
    try {
      let verify: any = await tokenVerify(token);
      if (verify.data === "error") {
        console.log("error in token");
        resolve({ status: false, message: "error on token" });
      }
      if (verify.data.isAdmin === true && verify.data.adminLevel === 3) {
        let kycDoneData = await prismaKycUrl.kycDone.findMany({
          where: {
            userId: id,
            kycStatus: 5,
          },
          select: {
            adminApprove: true,
          },
        });
        if (kycDoneData.length > 0) {
          resolve({ status: false, message: "admin approve already done" });
        } else {
          await prismaKycUrl.kycDone.create({
            data: {
              userId: id,
              kycStatus: 5,
              adminApprove: true,
            },
          });
          await prismaUserDataUrl.user.update({
            where: {
              id: id,
            },
            data: {
              kycStatus: 5,
            },
          });
          resolve({
            status: true,
            message: "kyc done",
          });
        }
      } else {
        resolve({ status: false, message: "not priviledged" });
      }
    } catch (error) {
      console.log("error from kyc service", error);
      reject({ status: false });
    }
  });
}

export function kycList(token: string, id: string) {
  return new Promise(async (resolve, reject) => {
    try {
      let verify: any = await tokenVerify(token);
      if (verify.data === "error") {
        console.log("error in token");
        resolve({ status: false, message: "error on token" });
      }
      if (verify.data.isAdmin === true) {
        let kycData: any = [];
        await prismaKycUrl.kyc
          .findMany({
            where: {
              userId: id,
            },
            select: {
              id: true,
              businessName: true,
              companyTitle: true,
              legalName: true,
              logo: true,
              info: true,
              website: true,
              address: true,
              city: true,
              country: true,
              state: true,
              pinCode: true,
              geolocation: true,
              contactEmail: true,
              contactPhone: true,
              pan: true,
              gstin: true,
              fssaiNo: true,
              canceledCheque: true,
              addressProof: true,
              idProof: true,
              locationAvail: true,
              organization: true,
              packageWeight: true,
              hsn: true,
              distrLicenseNo: true,
              userId: true,
            },
          })
          .then((resonse: kycFullData) => {
            kycData.push(resonse[0]);
            prismaKycUrl.bankDetails
              .findMany({
                where: {
                  userId: id,
                },
                select: {
                  accountHolderName: true,
                  accountNumber: true,
                  bankName: true,
                  bankCity: true,
                  branch: true,
                  IfscCode: true,
                },
              })
              .then((res: bankDetailsType) => {
                kycData.push(res[0]);
                prismaKycUrl.ondc
                  .findMany({
                    where: {
                      userId: id,
                    },
                    select: {
                      timeToShip: true,
                      cancellable: true,
                      returnable: true,
                      sellerPickupReturn: true,
                      availableCOD: true,
                      defaultCategoryId: true,
                      consumerCare: true,
                    },
                  })
                  .then((ondcres: ondcType) => {
                    kycData.push(ondcres[0]);
                    prismaKycUrl.storeTiming
                      .findMany({
                        where: {
                          userId: id,
                        },
                        select: {
                          type: true,
                          days: true,
                          startTime: true,
                          endTime: true,
                          userId: true,
                        },
                      })
                      .then((endresponse: storeTimeType) => {
                        kycData.push(endresponse[0]);
                        const mergedObject = Object.assign({}, ...kycData);
                        if (Object.keys(mergedObject).length > 0) {
                          resolve({
                            status: true,
                            message: "full kyc list",
                            data: mergedObject,
                          });
                        } else {
                          resolve({
                            status: false,
                            message: "no kyc found on this id",
                          });
                        }
                      });
                  });
              });
          });
      } else {
        resolve({ status: false, message: "not privileged to see list" });
      }
    } catch (error) {
      console.log("error from kyc list", error);
      reject({ success: false, message: "internal server error" });
    }
  });
}

export function getAdminService(token: string): Promise<PromiseResult> {
  return new Promise(async (resolve, reject) => {
    try {
      let verify: any = await tokenVerify(token);
      if (verify.data === "error") {
        console.log("error in token");
        resolve({ status: false, message: "error on token" });
      }
      if (verify.data.isAdmin === true) {
        let superAdminData = await prismaUserDataUrl.user.findMany({
          where: {
            id: verify.data.id,
          },
        });
      } else {
        resolve({ status: false, message: "not and admin token" });
      }
    } catch (error) {
      console.log("error in permission", error);
      reject({ status: false, message: "error in service" });
    }
  });
}

export function userlistService(token: string, query: any) {
  return new Promise(async (resolve, reject) => {
    try {
      let verify: any = await tokenVerify(token);
      if (verify.data === "error") {
        console.log("error in token");
        resolve({ status: false, message: "error on token" });
      }
      let userData = await prismaUserDataUrl.user.findMany({
        where: {
          id: verify.data.id,
        },
        select: {
          isAdmin: true,
          adminLevel: true,
        },
      });
      if (userData.length > 0) {
        if (query.admin) {
          if (userData[0].isAdmin === true && userData[0].adminLevel === 3) {
            let adminList = await prismaUserDataUrl.user.findMany({
              where: {
                OR: [{ adminLevel: 0 }, { adminLevel: 1 }, { adminLevel: 2 }],
                statusCode: 0,
                adminId: verify.data.id,
                isAdmin: true,
              },
            });
            resolve({
              status: true,
              message: "admin list",
              data: adminList,
            });
          } else if (
            userData[0].isAdmin === true &&
            userData[0].adminLevel === 2
          ) {
            let adminList = await prismaUserDataUrl.user.findMany({
              where: {
                OR: [{ adminLevel: 0 }, { adminLevel: 1 }],
                statusCode: 0,
                isAdmin: true,
              },
            });
            resolve({
              status: true,
              message: "admin list",
              data: adminList,
            });
          }
        }
        if (userData[0].isAdmin === true && userData[0].adminLevel === 3) {
          await prismaUserDataUrl.user
            .findMany({
              where: {
                // OR: [{ adminLevel: 0 }, { adminLevel: 1 }, { adminLevel: 2 }],
                parentId: {
                  hasSome: [verify.data.id],
                },
                isAdmin: false,
                statusCode: 0,
              },
            })
            .then((res: any) => {
              //  let localDate = localDateChanger()
              for (let i in res) {
                res[i].updatedAt = localDateChanger(res[i].updatedAt);
                res[i].createdAt = localDateChanger(res[i].createdAt);
              }
              resolve({ status: true, message: "user list", data: res });
            });
        } else if (
          userData[0].isAdmin === true &&
          userData[0].adminLevel === 2
        ) {
          await prismaUserDataUrl.user
            .findMany({
              where: {
                parentId: {
                  hasSome: [verify.data.id],
                },
                isAdmin: false,
                statusCode: 0,
              },
            })
            .then((res: any) => {
              for (let i in res) {
                res[i].updatedAt = localDateChanger(res[i].updatedAt);
                res[i].createdAt = localDateChanger(res[i].createdAt);
              }
              resolve({ status: true, message: "user list", data: res });
            });
        } else if (
          userData[0].isAdmin === true &&
          userData[0].adminLevel === 1
        ) {
          await prismaUserDataUrl.user
            .findMany({
              where: {
                parentId: {
                  hasSome: [verify.data.id],
                },
                adminLevel: 0,
                statusCode: 0,
              },
            })
            .then((res: any) => {
              for (let i in res) {
                res[i].updatedAt = localDateChanger(res[i].updatedAt);
                res[i].createdAt = localDateChanger(res[i].createdAt);
              }
              resolve({ status: true, message: "user list", data: res });
            });
        } else if (userData[0].isAdmin === false) {
          await prismaUserDataUrl.user
            .findMany({
              where: {
                id: verify.data.id,
              },
            })
            .then((res: any) => {
              for (let i in res) {
                res[i].updatedAt = localDateChanger(res[i].updatedAt);
                res[i].createdAt = localDateChanger(res[i].createdAt);
              }
              resolve({ status: true, message: "single user", data: res[0] });
            });
        }
      } else {
        resolve({ status: false, message: "no user found" });
      }
    } catch (error) {
      console.log("error in permission", error);
      reject({ status: false, message: "error in service" });
    }
  });
}

export function adminLevelCheck(token: string) {
  return new Promise(async (resolve, reject) => {
    try {
      let verify: any = await tokenVerify(token);
      if (verify.data === "error") {
        console.log("error in token");
        resolve({ status: false, message: "error on token" });
      }
      if (verify.data.isAdmin === true && verify.data.adminLevel === 3) {
        prismaUserDataUrl.user
          .findMany({
            where: {
              id: verify.data.id,
            },
            select: {
              isAdmin: true,
            },
          })
          .then((response: adminLevelCheck) => {
            if (response.length > 0) {
              resolve({
                status: true,
                message: "This is a Super Admin",
                data: verify.data.id,
              });
            } else {
              resolve({ status: false, message: "No user found" });
            }
          });
      } else {
        prismaUserDataUrl.user
          .findMany({
            where: {
              id: verify.data.id,
            },
            select: {
              isAdmin: true,
              adminLevel: true,
              adminId: true,
            },
          })
          .then((res: any) => {
            if (res[0].isAdmin === true && res[0].adminLevel === 2) {
              resolve({
                status: true,
                message: "this is senior admin",
                data: verify.data.id,
              });
            } else if (res[0].isAdmin === true && res[0].adminLevel === 1) {
              resolve({
                status: true,
                message: "this is junior admin",
                data: verify.data.id,
              });
            } else {
              resolve({ status: false, message: "Not an Admin" });
            }
          });
      }
    } catch (error) {
      console.log("error in service", error);
      reject({ status: false, message: "internal server error", data: error });
    }
  });
}

export function countSellers(token: string) {
  return new Promise(async (resolve, reject) => {
    try {
      let verify: any = await tokenVerify(token);
      if (verify.data === "error") {
        console.log("error in token");
        resolve({ status: false, message: "error on token" });
      }
      if (verify.data.isAdmin === false) {
        console.log("not authorized");
        resolve({ status: false, message: "not authorized" });
      }
      let activeSeller = await prismaUserDataUrl.user.count({
        where: {
          parentId: {
            hasSome: [verify.data.id],
          },
          statusCode: 0,
        },
      });
      let inActiveSellers = await prismaUserDataUrl.user.count({
        where: {
          parentId: {
            hasSome: [verify.data.id],
          },
          statusCode: 1,
        },
      });
      let totalSellerArr = inActiveSellers + activeSeller;
      resolve({
        status: true,
        message: "seller counts",
        activeSellers: activeSeller,
        inactiveSellers: inActiveSellers,
        totalSellers: totalSellerArr,
      });
    } catch (error) {
      console.log("error in service", error);
      reject({ status: false, message: "internal server error", data: error });
    }
  });
}

export function editSellerService(
  data: any,
  file: any,
  token: string,
  id: string
): Promise<PromiseResult> {
  return new Promise(async (resolve, reject) => {
    try {
      let verify: any = await tokenVerify(token);
      if (verify.data === "error") {
        console.log("error in token");
        resolve({ status: false, message: "error on token" });
      }
      let adminCheck = await prismaUserDataUrl.user.findMany({
        where: {
          id: verify.data.id,
        },
        select: {
          isAdmin: true,
        },
      });
      if (adminCheck.length < 0) {
        resolve({ status: false, message: "no user found" });
      } else if (adminCheck[0].isAdmin === false) {
        resolve({ status: false, message: "User is not admin" });
      } else {
        await prismaKycUrl.kyc
          .updateMany({
            where: {
              userId: id,
            },
            data,
          })
          .then((res: any) => {
            console.log("kyc length", Object.keys(res).length);
            resolve({ status: true, message: "kyc updated" });
          })
          .catch((err: any) => {
            console.log(" because you edited bank details");
            prismaKycUrl.bankDetails
              .updateMany({
                where: {
                  userId: id,
                },
                data,
              })
              .then((resp: any) => {
                console.log("bank length", Object.keys(resp).length);
                resolve({ status: true, message: "bank details updated" });
              })
              .catch((err: any) => {
                console.log(" because you edited ondc");
                prismaKycUrl.ondc
                  .updateMany({
                    where: {
                      userId: id,
                    },
                    data,
                  })
                  .then((respon: any) => {
                    console.log("ondc length", Object.keys(respon).length);
                    resolve({ status: true, message: "ondc updated" });
                  })
                  .catch((err: any) => {
                    console.log(" because you edited storetime");
                    prismaKycUrl.storeTiming
                      .updateMany({
                        where: {
                          userId: id,
                        },
                        data,
                      })
                      .then((response: any) => {
                        console.log(
                          "store length",
                          Object.keys(response).length
                        );
                        resolve({
                          status: true,
                          message: "store time updated",
                        });
                      })
                      .catch((err: any) => {
                        console.log(
                          err.name +
                            " because you inserted wrong input which is not in database"
                        );
                        resolve({
                          status: false,
                          message: "wrong input among all",
                        });
                      });
                  });
              });
          });
      }
    } catch (error) {
      console.log("error in service", error);
      reject({ status: false, message: "internal server error", data: error });
    }
  });
}

export function activeInactiveSellerService(
  token: string,
  id: string,
  status: string
): Promise<PromiseResult> {
  return new Promise(async (resolve, reject) => {
    try {
      if (typeof status === "undefined") {
        resolve({ status: false, message: "input is empty" });
      }
      let verify: any = await tokenVerify(token);
      if (verify.data === "error") {
        console.log("error in token");
        resolve({ status: false, message: "error on token" });
      }
      let adminCheck = await prismaUserDataUrl.user.findMany({
        where: {
          id: verify.data.id,
        },
        select: {
          isAdmin: true,
        },
      });
      if (adminCheck[0].isAdmin === true) {
        await prismaUserDataUrl.user.update({
          where: {
            id: id,
          },
          data: {
            statusCode: Number(status),
          },
        });
        resolve({ status: true, message: "status changed", data: status });
      } else {
        resolve({ status: false, message: "User is not admin" });
      }
    } catch (error) {
      console.log("error in service", error);
      reject({ status: false, message: "internal server error", data: error });
    }
  });
}

export function activeInactiveProductService(
  token: string,
  id: string,
  data: any
): Promise<PromiseResult> {
  return new Promise(async (resolve, reject) => {
    try {
      let verify: any = await tokenVerify(token);
      if (verify.data === "error") {
        console.log("error in token");
        resolve({ status: false, message: "error on token" });
      }
      let adminCheck = await prismaUserDataUrl.user.findMany({
        where: {
          id: verify.data.id,
        },
        select: {
          isAdmin: true,
          adminLevel: true,
        },
      });
      if (adminCheck[0].isAdmin === true) {
        if (id) {
          typeof data.adminApprove === "string"
            ? (data = stringToBool(data.adminApprove))
            : (data = data.adminApprove);
          await prismaProductUrl.products
            .update({
              where: {
                id: id,
              },
              data: {
                adminApprove: data,
              },
            })
            .then((res: any) => {
              data === true
                ? resolve({ status: true, message: "product activated" })
                : resolve({ status: true, message: "product De-activated" });
            });
        } else {
          resolve({ status: false, message: "put id" });
        }
      } else {
        resolve({ status: false, message: "user is not admin" });
      }
    } catch (error) {
      console.log("error in service", error);
      reject({ status: false, message: "internal server error", data: error });
    }
  });
}

export function createAdminsService(
  data: any,
  token: string
): Promise<PromiseResult> {
  return new Promise(async (resolve, reject) => {
    try {
      let verified = (await tokenVerify(token)) as tokenVerifyType | any;
      if (verified.data === "error") {
        console.log("error in token");
        resolve({ status: false, message: "error on token" });
      }
      let adminCheck: userData = await prismaUserDataUrl.user.findMany({
        where: {
          id: verified.data.id as string,
        },
        select: {
          isAdmin: true,
          adminLevel: true,
        },
      });
      if (adminCheck[0].isAdmin === true) {
        let hashedPassword: string = await encryptHash(data.hashedPassword);
        await prismaUserDataUrl.user
          .create({
            data: {
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              phoneNumber: Number(data.phoneNumber),
              hashedPassword: hashedPassword,
              parentId:
                verified.data.id === "652e0ec6b44f82ea2be52c46"
                  ? ["652e0ec6b44f82ea2be52c46"]
                  : [verified.data.id, "652e0ec6b44f82ea2be52c46"],
              adminId: verified.data.id,
              isAdmin: data.isAdmin,
              adminLevel: Number(data.adminLevel),
            },
          })
          .then(async (res: any) => {
            await prismaAdminDataUrl.userAdmin.create({
              data: {
                userId: res.id,
                email: data.email,
                adminLevel: Number(data.adminLevel),
                adminId: verified.data.id,
                adminName: Number(data.adminLevel) === 2 ? "sadmin" : "jadmin",
              },
            });
            resolve({ status: true, message: "admin created", data: res.id });
          });
      } else if ((adminCheck.length = 0)) {
        resolve({ status: false, message: "no user found" });
      } else {
        resolve({ status: false, message: "don't have admin priviledges" });
      }
    } catch (error) {
      console.log("error in service", error);
      reject({ status: false, message: "internal server error", data: error });
    }
  });
}
export function dashBoardInformations(token: string): Promise<PromiseResult> {
  return new Promise(async (resolve, reject) => {
    try {
      let verified = (await tokenVerify(token)) as tokenVerifyType | any;
      if (verified.data === "error") {
        console.log("error in token");
        resolve({ status: false, message: "error on token" });
      }
      let adminCheck: userData = await prismaUserDataUrl.user.findMany({
        where: {
          id: verified.data.id as string,
        },
        select: {
          isAdmin: true,
          adminLevel: true,
        },
      });
      if (adminCheck.length > 0) {
        let data = await prismaKycUrl.kyc.findMany({
          where: {
            userId: verified.data.id,
          },
          select: {
            logo: true,
            businessName: true,
            companyTitle: true,
          },
        });
        resolve({ status: true, message: "dashboard data", data: data[0] });
      } else {
        resolve({ status: false, message: "no user found" });
      }
    } catch (error) {
      console.log("error in service", error);
      reject({ status: false, message: "internal server error", data: error });
    }
  });
}

export function forgotPasswordService(data: any): Promise<PromiseResult> {
  return new Promise(async (resolve, reject) => {
    try {
      if (data.hashedPassword !== data.reType) {
        resolve({ status: false, message: "password mis-match" });
      }
      let passwordHashed = await encryptHash(data.password);

      resolve({ status: true, message: "password changed" });
    } catch (error) {
      console.log("error in service", error);
      reject({ status: false, message: "internal server error", data: error });
    }
  });
}

export function verificationService(
  token: any,
  data: any
): Promise<PromiseResult> {
  return new Promise(async (resolve, reject) => {
    try {
      let otp: number = otpGenerate();
      let verified = (await tokenVerify(token)) as tokenVerifyType | any;
      if (verified.data === "error") {
        console.log("error in token");
        resolve({ status: false, message: "error on token" });
      }
      let userDetails: any;
      let regex: any = /@/;
      if (regex.test(data.verify)) {
        userDetails = await prismaUserDataUrl.user.findFirst({
          where: {
            email: data.verify,
          },
          select: {
            id: true,
            emailVerified: true,
            phoneNumberVerified: true,
          },
        });
        if (userDetails !== null) {
          await prismaUserDataUrl.user.update({
            where: {
              id: userDetails.id,
            },
            data: {
              verifyDetails: "email",
              otp: otp.toString(),
            },
          });
        } else if (token) {
          await prismaUserDataUrl.user.update({
            where: {
              id: verified.data.id,
            },
            data: {
              verifyDetails: "email",
              otp: otp.toString(),
            },
          });
        }
        let mailSent: senderPromise = (await sendMail(
          data.verify as string,
          otp.toString()
        )) as senderPromise;
        if (mailSent.error) {
          resolve({ status: false, message: "Invalid email address" });
        } else if (mailSent.data) {
          resolve({
            status: true,
            message: "OTP has been sent to mail",
            data: mailSent.otp,
          });
        }
      } else {
        userDetails = await prismaUserDataUrl.user.findFirst({
          where: {
            phoneNumber: Number(data.verify),
          },
          select: {
            id: true,
            emailVerified: true,
            phoneNumberVerified: true,
          },
        });
        if (userDetails !== null) {
          await prismaUserDataUrl.user.update({
            where: {
              id: userDetails.id,
            },
            data: {
              verifyDetails: "sms",
              otp: otp.toString(),
            },
          });
        } else if (token) {
          await prismaUserDataUrl.user.update({
            where: {
              id: verified.data.id,
            },
            data: {
              verifyDetails: "sms",
              otp: otp.toString(),
            },
          });
        }
        let smsSent: senderPromise = (await sendSMS(
          data.verify as string,
          otp.toString()
        )) as senderPromise;
        if (smsSent.error) {
          resolve({ status: false, message: "Invalid phone number" });
        } else if (smsSent.data) {
          resolve({
            status: true,
            message: "OTP has been sent to sms",
            data: smsSent.otp,
          });
        }
      }
    } catch (error) {
      console.log("error in service", error);
      reject({ status: false, message: "internal server error", data: error });
    }
  });
}

export function OTPcheckerService(
  token: any,
  data: any
): Promise<PromiseResult> {
  return new Promise(async (resolve, reject) => {
    try {
      let verified = (await tokenVerify(token)) as tokenVerifyType | any;
      if (verified.data === "error") {
        console.log("error in token");
        resolve({ status: false, message: "error on token" });
      }
      if (token) {
        let otpCheck = await prismaUserDataUrl.user.findFirst({
          where: {
            id: verified.data.id,
          },
          select: {
            otp: true,
            verifyDetails: true,
          },
        });
        if (otpCheck?.otp === data.otp) {
          resolve({ status: true, message: "OTP matched" });
        } else {
          resolve({ status: false, message: "Wrong OTP" });
        }
      }
      let otpCheck = await prismaUserDataUrl.user.findFirst({
        where: {
          otp: data.otp as string,
        },
        select: {
          id: true,
          verifyDetails: true,
        },
      });
      if (otpCheck !== null) {
        if (otpCheck.verifyDetails === "email") {
          await prismaUserDataUrl.user.update({
            where: {
              id: otpCheck.id,
            },
            data: {
              emailVerified: true,
            },
          });
          resolve({ status: true, message: "OTP matched" });
        } else if (otpCheck.verifyDetails === "sms") {
          await prismaUserDataUrl.user.update({
            where: {
              id: otpCheck.id,
            },
            data: {
              phoneNumberVerified: true,
            },
          });
          resolve({ status: true, message: "OTP matched" });
        }
      } else {
        resolve({ status: false, message: "Wrong OTP" });
      }
    } catch (error) {
      console.log("error in service", error);
      reject({ status: false, message: "internal server error", data: error });
    }
  });
}
