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
} from "../utils/types";
import {
  prismaKycUrl,
  prismaUserDataUrl,
  prismaProductUrl,
  prismaAdminDataUrl
} from "../db/connect";
import { localDateChanger, encryptHash, stringToBool } from "../utils/helpers";
import { tokenVerify } from "../utils/authVerify";
dotenv.config();

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

export function userlistService(token: string) {
  return new Promise(async (resolve, reject) => {
    try {
      let verify: any = await tokenVerify(token);
      if (verify.data === "error") {
        console.log("error in token");
        resolve({ status: false, message: "error on token" });
      }
      await prismaUserDataUrl.user
        .findMany({
          where: {
            id: verify.data.id,
          },
          select: {
            isAdmin: true,
            adminLevel: true,
          },
        })
        .then((response: any) => {
          if (response[0].isAdmin === true && response[0].adminLevel === 3) {
            prismaUserDataUrl.user
              .findMany({
                where: {
                  OR: [{ adminLevel: 0 }, { adminLevel: 1 }, { adminLevel: 2 }],
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
            response[0].isAdmin === true &&
            response[0].adminLevel === 2
          ) {
            prismaUserDataUrl.user
              .findMany({
                where: {
                  parentId: {
                    hasSome: [verify.data.id],
                  },
                  OR: [{ adminLevel: 0 }, { adminLevel: 1 }],
                  statusCode: 0,
                },
              })
              .then((res: any) => {
                console.log(res);
                for (let i in res) {
                  res[i].updatedAt = localDateChanger(res[i].updatedAt);
                  res[i].createdAt = localDateChanger(res[i].createdAt);
                }
                resolve({ status: true, message: "user list", data: res });
              });
          } else if (
            response[0].isAdmin === true &&
            response[0].adminLevel === 1
          ) {
            prismaUserDataUrl.user
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
          } else if (response[0].isAdmin === false) {
            prismaUserDataUrl.user
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
        });
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
        await prismaUserDataUrl.user.create({
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phoneNumber: Number(data.phoneNumber),
            hashedPassword: hashedPassword,
            parentId:(verified.data.id==="652e0ec6b44f82ea2be52c46")? ["652e0ec6b44f82ea2be52c46"]:[verified.data.id,"652e0ec6b44f82ea2be52c46"],
            adminId: verified.data.id,
            isAdmin:data.isAdmin,
            adminLevel:Number(data.adminLevel)
          },
        }).then(async(res:any)=>{
          // await prismaAdminDataUrl.userAdmin.create({
          //   data:{
          //     email:
          //   }
          // })

        })
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

export function forgotPasswordService(data:any): Promise<PromiseResult> {
  return new Promise(async (resolve, reject) => {
    try {


    } catch (error) {
      console.log("error in service", error);
      reject({ status: false, message: "internal server error", data: error });
    }
  });
}
