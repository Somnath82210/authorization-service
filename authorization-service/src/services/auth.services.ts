import dotenv from "dotenv";
import jwt from "jsonwebtoken";

import { kycData, authorizationData, kycFullData, bankDetailsType, ondcType, storeTimeType, userData, adminLevelCheck } from "../utils/types";
import {prismaKycUrl, prismaUserDataUrl } from "../db/connect";

dotenv.config();



export function authorization(token: string) {
  return new Promise(async (resolve, reject) => {
    try {
      let secret = process.env.JWT_SECRET as string;
      if (typeof token === "undefined") {
        console.log("enter token");
        resolve({ status: false, message: "enter token" });
      }
      let splitToken = token.split(" ")[1];
      jwt.verify(splitToken, secret, async function (err, decoded: any) {
        if (err) {
          console.log("error in token");
          resolve({ status: false, message: "no token" });
        }

        let userAuthStatus: authorizationData  = await prismaUserDataUrl.user.findMany({
          where: {
            id: decoded.id,
          },
          select: {
            kycStatus: true,
            statusCode: true
          },
        });
        // await prisma.$disconnect();
        resolve({
          status: true,
          message: "valid data",
          kycStatus: userAuthStatus[0].kycStatus,
          statusCode: userAuthStatus[0].statusCode
        });
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
      let splitToken = token.split(" ")[1];
      let secret = process.env.JWT_SECRET as string;
      jwt.verify(splitToken, secret, async function (err, decoded: any) {
        if (err) {
          console.log("error in token", err);
          resolve({ status: false, message: "no token" });
        }
        if (decoded.isAdmin === true) {
          let kycDoneData = await prismaKycUrl.kycDone.findMany({
            where: {
              userId: id,
              kycStatus: 5
            }, select: {
              adminApprove: true
            }
          })
          if (kycDoneData.length > 0) {
            resolve({ status: false, message: "admin approve already done" });
          } else {
            // let userDatabasePrisma = new PrismaClient({ datasources: { db: { url: userDataUrl } } })
            await prismaKycUrl.kycDone.create({
              data: {
                userId: id,
                kycStatus: 5,
                adminApprove: true
              },
            });
            // await kycDataPrisma.$disconnect();
            await prismaUserDataUrl.user.updateMany({
              where: {
                id: id
              },
              data: {
                kycStatus: 5
              }
            })
            // await userDatabasePrisma.$disconnect();
            resolve({
              status: true,
              message: "kyc done",
            });
          }

        } else {
          resolve({ status: false, message: "not priviledged" });
        }
        // let userDatabasePrisma = new PrismaClient({datasources:{db:{url:userDataUrl}}})
      });
    } catch (error) {
      console.log("error from kyc service", error);
      reject({ status: false });
    }
  });
}

export function kycList(token: string, id: string) {
  return new Promise(async (resolve, reject) => {
    try {
      if (typeof token === "undefined") {
        console.log("enter token");
        resolve({ status: false, message: "enter token" });
      }
      let splitToken = token.split(" ")[1];
      let secret = process.env.JWT_SECRET as string;
      jwt.verify(splitToken, secret, async function (err, decoded: any) {
        if (err) {
          console.log("error in token");
          reject({ status: false });
        }
        if (decoded.isAdmin === true) {
          let kycData: any = [];
          await prismaKycUrl.kyc.findMany({
            where: {
              userId: id
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
              userId: true
            },
          }).then((resonse: kycFullData) => {
            kycData.push(resonse[0])
            prismaKycUrl.bankDetails.findMany({
              where: {
                userId: id
              },
              select: {
                accountHolderName: true,
                accountNumber: true,
                bankName: true,
                bankCity: true,
                branch: true,
                IfscCode: true
              }
            }).then((res: bankDetailsType) => {
              kycData.push(res[0])
              prismaKycUrl.ondc.findMany({
                where: {
                  userId: id
                },
                select: {
                  timeToShip: true,
                  cancellable: true,
                  returnable: true,
                  sellerPickupReturn: true,
                  availableCOD: true,
                  defaultCategoryId: true,
                  consumerCare: true
                }
              }).then((ondcres: ondcType) => {
                kycData.push(ondcres[0])
                prismaKycUrl.storeTiming.findMany({
                  where: {
                    userId: id
                  },
                  select: {
                    type: true,
                    days: true,
                    startTime: true,
                    endTime: true,
                    userId: true
                  }
                }).then((endresponse: storeTimeType) => {
                  kycData.push(endresponse[0])
                  const mergedObject = Object.assign({}, ...kycData);
                  // prismaKycUrl.$disconnect();
                  console.log(mergedObject)
                  if (Object.keys(mergedObject).length > 0) {
                    resolve({ status: true, message: "full kyc list", data: mergedObject });
                  } else {
                    resolve({ status: false, message: "no kyc found on this id" });
                  }
                })
              })
            })
          });
        } else {
          resolve({ status: false, message: "not privileged to see list" })
        }
      });
    } catch (error) {
      console.log("error from kyc list", error);
      reject({ success: false, message: "internal server error" });
    }
  });
}

export function userlistService(token: string) {
  return new Promise(async (resolve, reject) => {
    try {
      let splitToken = token.split(" ")[1];
      let secret = process.env.JWT_SECRET as string;
      jwt.verify(splitToken, secret, async function (err, decoded: any) {
        if (err) {
          console.log("error in token");
          resolve({ status: false, message: "no token" });
        }
        // let prisma = new PrismaClient({ datasources: { db: { url: userDataUrl } } })
        await prismaUserDataUrl.user.findMany({
          where: {
            id: decoded.id
          },
          select: {
            isAdmin: true,
            adminLevel: true
          }
        }).then((response: userData) => {
          if (response[0].isAdmin === true) {
            prismaUserDataUrl.user.findMany({
              where: {
                adminId: decoded.id
              },
            }).then((response: any) => {
              // console.log("response[0]", response)
              resolve({ status: true, message: "User Lists", data: response })
              // prisma.$disconnect()
            })
          } else {
            prismaUserDataUrl.user.findMany({
              where: {
                id: decoded.id
              },
            }).then((response: any) => {
              console.log("response[0]elsseee", response)
              resolve({ status: true, message: "User Lists", data: response })
              // prisma.$disconnect()
            })
          }
        })

      })
    } catch (error) {
      console.log("error in permission", error);
      reject({ status: false, message: "error in service" })
    }
  })
}

export function adminLevelCheck(token: string) {
  return new Promise(async (resolve, reject) => {
    try {
      if (typeof token === 'undefined') {
        console.log("no token");
        resolve({ status: false, message: "no token" })
      }
      let splitToken = token.split(" ")[1]
      let secret = process.env.JWT_SECRET as string;
      await jwt.verify(splitToken, secret, (err: any, decoded: any) => {
        if (err) {
          console.log("error in token", err);
          resolve({ status: false, message: "error in token" })
        }
        // const prisma = new PrismaClient({ datasources: { db: { url: newURL } } })
        prismaUserDataUrl.user.findMany({
          where: {
            id: decoded.id
          },
          select: {
            isAdmin: true
          }
        }).then((response: adminLevelCheck) => {
          // prisma.$disconnect();
          if (response.length > 0) {
            if (decoded.isAdmin === true && response[0].isAdmin === true) {
              resolve({ status: true, message: "This is an Admin" })
            } else {
              resolve({ status: false, message: "Not an Admin" })
            }
          } else {
            resolve({ status: false, message: "No user found" })
          }
        })
      })
    } catch (error) {
      console.log("error in service", error)
      reject({ status: false, message: "internal server error", data: error })
    }
  })
}

export function countSellers(token: string) {
  return new Promise(async (resolve, reject) => {
    try {
      if (typeof token === 'undefined') {
        console.log("no token");
        resolve({ status: false, message: "no token" })
      }
      let splitToken = token.split(" ")[1]
      let secret = process.env.JWT_SECRET as string;
      await jwt.verify(splitToken, secret, (err: any, decoded: any) => {
        if (err) {
          console.log("error in token", err);
          resolve({ status: false, message: "error in token" })
        }
        if (decoded.isAdmin === false) {
          console.log("not authorized");
          resolve({ status: false, message: "not authorized" })
        }
        // const prisma = new PrismaClient({ datasources: { db: { url: newURL } } });
        prismaUserDataUrl.user.findMany({
          where: {
            isAdmin: false,
            statusCode: 0
          }, select: {
            id: true
          }
        }).then(async (response: any) => {
          let inActiveSellers = await prismaUserDataUrl.user.findMany({
            where: {
              isAdmin: false,
              statusCode: 1
            }, select: {
              id: true
            }
          })
          let totalSellerArr = inActiveSellers.concat(response);
          // await prisma.$disconnect();
          resolve({ status: true, message: "seller counts", activeSellers: response.length, inactiveSellers: inActiveSellers.length, totalSellers: totalSellerArr.length })
        })
      })
    } catch (error) {
      console.log("error in service", error)
      reject({ status: false, message: "internal server error", data: error })
    }
  })
}

export function editSellerService(data:any,file:any,token:string,id:string) {
  return new Promise(async (resolve, reject) => {
    try {
      if (typeof token === 'undefined') {
        console.log("no token");
        resolve({ status: false, message: "no token" })
      }
      let splitToken = token.split(" ")[1]
      let secret = process.env.JWT_SECRET as string;
      await jwt.verify(splitToken, secret, async (err: any, decoded: any) => {
        if (err) {
          console.log("error in token", err);
          resolve({ status: false, message: "error in token" })
        }
        let adminCheck = await prismaUserDataUrl.user.findMany({
          where: {
            id: decoded.id
          }, select: {
            isAdmin: true
          }
        })
        if(adminCheck.length<0){
          resolve({ status: false, message: "no user found" });
        } else if(adminCheck[0].isAdmin===false){
          resolve({ status: false, message: "User is not admin" });
        } else {
         await prismaKycUrl.kyc.updateMany({
            where:{
              userId:id
            }, data
          }).then((res:any)=>{
            console.log("kyc length",Object.keys(res).length)
            resolve({ status: true, message: "kyc updated" });
          }).catch((err:any)=>{
            console.log(" because you edited bank details")
             prismaKycUrl.bankDetails.updateMany({
              where:{
                  userId:id
              }, data
            }).then((resp:any)=>{
              console.log("bank length",Object.keys(resp).length)
              resolve({ status: true, message: "bank details updated" });
            }).catch((err:any)=>{
              console.log(" because you edited ondc")
              prismaKycUrl.ondc.updateMany({
                where:{
                    userId:id
                }, data
              }).then((respon:any)=>{
                console.log("ondc length",Object.keys(respon).length)
                resolve({ status: true, message: "ondc updated" });
              }).catch((err:any)=>{
                console.log(" because you edited storetime")
                prismaKycUrl.storeTiming.updateMany({
                  where:{
                      userId:id
                  }, data
                }).then((response:any)=>{
                  console.log("store length",Object.keys(response).length)
                  resolve({ status: true, message: "store time updated" });
                }).catch((err:any)=>{
                  console.log(err.name + " because you inserted wrong input which is not in database")
                  resolve({status:false, message:"wrong input among all"})
                })
              })
            })
          })
        }
      })
    } catch (error) {
      console.log("error in service", error)
      reject({ status: false, message: "internal server error", data: error })
    }
  })
}

export function activeInactiveSellerService(token: string, id: string, status: string) {
  return new Promise(async (resolve, reject) => {
    try {
      if (typeof token === 'undefined') {
        console.log("no token");
        resolve({ status: false, message: "no token" })
      }
      let splitToken = token.split(" ")[1]
      let secret = process.env.JWT_SECRET as string;
      if (typeof status === 'undefined') {
        resolve({ status: false, message: "input is empty" })
      }
      await jwt.verify(splitToken, secret, async (err: any, decoded: any) => {
        if (err) {
          console.log("error in token", err);
          resolve({ status: false, message: "error in token" })
        }
        // let prisma = new PrismaClient({ datasources: { db: { url: userDataUrl } } })
        let adminCheck = await prismaUserDataUrl.user.findMany({
          where: {
            id: decoded.id
          }, select: {
            isAdmin: true
          }
        })
        if (adminCheck[0].isAdmin === true) {
          await prismaUserDataUrl.user.update({
            where: {
              id: id
            }, data: {
              statusCode: Number(status)
            }
          })
          // await prisma.$disconnect();
          resolve({ status: true, message: "status changed", data: status })
        } else {
          // await prisma.$disconnect();
          resolve({ status: false, message: "User is not admin" });
        }
      })
    } catch (error) {
      console.log("error in service", error)
      reject({ status: false, message: "internal server error", data: error })
    }
  })
}
