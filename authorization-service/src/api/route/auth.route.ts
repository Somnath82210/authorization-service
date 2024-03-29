import {
  adminLevelCheckController,
  authorizationController,
  kycDone,
  kycListController,
  userlist,
  countSellersController,
  activeInactiveController,
  editSellerController,
  activeInactiveProductController,
  dashBoardInformationController,
  verificationController,
  OTPverificationController,
} from "../controllers/auth.controller";
import express from "express";
import multer from "multer";

let routes = express.Router();

const upload = multer({ dest: "public/uploads/" });

//POST
routes.post("/checkout?:id", kycDone);
routes.post("/verification", verificationController);
routes.post("/otpverify", OTPverificationController);
//GET
routes.get("/authenticate", authorizationController);
routes.get("/kyclist?:id", kycListController);
routes.get("/userlist", userlist);
routes.get("/checkadmin", adminLevelCheckController);
routes.get("/count", countSellersController);
routes.get("/dashboard", dashBoardInformationController);
//PUT
routes.put("/changeaccstatus?:id", activeInactiveController);
routes.put("/kyc?:id", upload.any(), editSellerController);
routes.put("/pdtactive?:id", activeInactiveProductController);
export default routes;
