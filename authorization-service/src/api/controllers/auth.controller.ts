import { Request, Response, NextFunction } from "express";
import {
  authorization,
  kycDoneService,
  kycList,
  userlistService,
  adminLevelCheck,
  countSellers,
  editSellerService,
  activeInactiveSellerService,
  activeInactiveProductService,
  createAdminsService,
  forgotPasswordService,
  dashBoardInformations,
  verificationService,
  OTPcheckerService,
} from "../../services/auth.services";
import asynErr from "../../utils/asyncErr";
import ErrorHandler from "../../utils/errorHandler";
import statusCode from "../../utils/statusCode";

export const authorizationController = asynErr(
  async (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization as string;
    let services: any = await authorization(token);
    if (services.status === true) {
      res.status(statusCode.OK).json({
        success: true,
        message: services.message,
        kycStatus: services.kycStatus,
        statusCode: services.statusCode,
      });
    } else if (services.status === false) {
      res
        .status(statusCode.NOTFOUND)
        .json({ success: false, error: services.message });
    } else {
      throw new ErrorHandler("Validation error", statusCode.UNAUTHORIZED);
    }
  }
);

export const userlist = asynErr(
  async (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization as string;
    let query = req.query as any;
    let services: any = await userlistService(token, query);
    if (services.status === true) {
      res.status(statusCode.OK).json({
        success: true,
        message: services.message,
        data: services.data,
      });
    } else if (services.status === false) {
      res
        .status(statusCode.NOTFOUND)
        .json({ success: false, error: services.message });
    } else {
      throw new ErrorHandler(
        "internal server error",
        statusCode.INTERNALSERVERERROR
      );
    }
  }
);

export const kycDone = asynErr(
  async (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization as string;
    let id = req.query.id as string;
    let services: any = await kycDoneService(token, id);
    if (services.status === true) {
      res.status(statusCode.OK).json({
        success: true,
        message: services.message,
        data: services.data,
      });
    } else if (services.status === false) {
      res
        .status(statusCode.NOTFOUND)
        .json({ success: false, error: services.message });
    } else {
      throw new ErrorHandler(
        "internal server error",
        statusCode.INTERNALSERVERERROR
      );
    }
  }
);

export const kycListController = asynErr(
  async (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization as string;
    let id = req.query.id as string;
    let services: any = await kycList(token, id);
    if (services.status === true) {
      res.status(statusCode.OK).json({
        success: true,
        message: services.message,
        data: services.data,
      });
    } else if (services.status === false) {
      res
        .status(statusCode.NOTFOUND)
        .json({ success: false, error: services.message });
    } else {
      throw new ErrorHandler(
        "internal server error",
        statusCode.INTERNALSERVERERROR
      );
    }
  }
);

export const adminLevelCheckController = asynErr(
  async (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization as string;
    let services: any = await adminLevelCheck(token);
    if (services.status === true) {
      res
        .status(statusCode.OK)
        .json({ success: true, message: services.message });
    } else if (services.status === false) {
      res
        .status(statusCode.UNAUTHORIZED)
        .json({ success: false, error: services.message });
    } else {
      throw new ErrorHandler(
        "internal server error",
        statusCode.INTERNALSERVERERROR
      );
    }
  }
);

export const countSellersController = asynErr(
  async (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization as string;
    let services: any = await countSellers(token);
    if (services.status === true) {
      res.status(statusCode.OK).json({
        success: true,
        message: services.message,
        activeSellers: services.activeSellers,
        inactiveSellers: services.inactiveSellers,
        totalSellers: services.totalSellers,
      });
    } else if (services.status === false) {
      res
        .status(statusCode.NOTFOUND)
        .json({ success: false, error: services.message });
    } else {
      throw new ErrorHandler(
        "internal server error",
        statusCode.INTERNALSERVERERROR
      );
    }
  }
);

export const editSellerController = asynErr(
  async (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization as string;
    let id = req.query.id as string;
    let data: object = req.body;
    let file = req.files;
    let services: any = await editSellerService(data, file, token, id);
    if (services.status === true) {
      res
        .status(statusCode.OK)
        .json({ success: true, message: services.message });
    } else if (services.status === false) {
      res
        .status(statusCode.NOTFOUND)
        .json({ success: false, error: services.message });
    } else {
      throw new ErrorHandler(
        "internal server error",
        statusCode.INTERNALSERVERERROR
      );
    }
  }
);

export const activeInactiveController = asynErr(
  async (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization as string;
    let id = req.query.id as string;
    let status = req.body.statusCode as string;
    let services: any = await activeInactiveSellerService(token, id, status);
    if (services.status === true) {
      res.status(statusCode.OK).json({
        success: true,
        message: services.message,
        data: services.data,
      });
    } else if (services.status === false) {
      res
        .status(statusCode.UNAUTHORIZED)
        .json({ success: false, error: services.message });
    } else {
      throw new ErrorHandler(
        "internal server error",
        statusCode.INTERNALSERVERERROR
      );
    }
  }
);

export const activeInactiveProductController = asynErr(
  async (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization as string;
    let id = req.query.id as string;
    let data = req.body;
    let services: any = await activeInactiveProductService(token, id, data);
    if (services.status === true) {
      res.status(statusCode.OK).json({
        success: true,
        message: services.message,
        data: services.data,
      });
    } else if (services.status === false) {
      res
        .status(statusCode.UNAUTHORIZED)
        .json({ success: false, error: services.message });
    } else {
      throw new ErrorHandler(
        "internal server error",
        statusCode.INTERNALSERVERERROR
      );
    }
  }
);

export const adminCreateController = asynErr(
  async (req: Request, res: Response, next: NextFunction) => {
    let data = req.body;
    let token = req.headers.authorization as string;
    let services: any = await createAdminsService(data, token);
    if (services.status === true) {
      res.status(statusCode.OK).json({
        success: true,
        message: services.message,
        data: services.data,
      });
    } else if (services.status === false) {
      res
        .status(statusCode.UNAUTHORIZED)
        .json({ success: false, error: services.message });
    } else {
      throw new ErrorHandler(
        "internal server error",
        statusCode.INTERNALSERVERERROR
      );
    }
  }
);

export const forgotPasswordController = asynErr(
  async (req: Request, res: Response, next: NextFunction) => {
    let data = req.body;
    let services = await forgotPasswordService(data);
    if (services.status === true) {
      res.status(statusCode.OK).json({
        success: true,
        message: services.message,
        data: services.data,
      });
    } else if (services.status === false) {
      res
        .status(statusCode.UNAUTHORIZED)
        .json({ success: false, error: services.message });
    } else {
      throw new ErrorHandler(
        "internal server eroor",
        statusCode.INTERNALSERVERERROR
      );
    }
  }
);

export const dashBoardInformationController = asynErr(
  async (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization as string;
    let services = await dashBoardInformations(token);
    if (services.status === true) {
      res.status(statusCode.OK).json({
        success: true,
        message: services.message,
        data: services.data,
      });
    } else if (services.status === false) {
      res
        .status(statusCode.UNAUTHORIZED)
        .json({ success: false, error: services.message });
    } else {
      throw new ErrorHandler(
        "internal server eroor",
        statusCode.INTERNALSERVERERROR
      );
    }
  }
);

export const verificationController = asynErr(
  async (req: Request, res: Response, next: NextFunction) => {
    let data = req.body;
    let token = req.headers.authorization;
    let services = await verificationService(token, data);
    if (services.status === true) {
      res.status(statusCode.OK).json({
        success: true,
        message: services.message,
        data: services.data,
      });
    } else if (services.status === false) {
      res
        .status(statusCode.UNAUTHORIZED)
        .json({ success: false, error: services.message });
    } else {
      throw new ErrorHandler(
        "internal server eroor",
        statusCode.INTERNALSERVERERROR
      );
    }
  }
);

export const OTPverificationController = asynErr(
  async (req: Request, res: Response, next: NextFunction) => {
    let data = req.body;
    let token = req.headers.authorization as string;
    let services = await OTPcheckerService(token, data);
    if (services.status === true) {
      res.status(statusCode.OK).json({
        success: true,
        message: services.message,
        data: services.data,
      });
    } else if (services.status === false) {
      res
        .status(statusCode.UNAUTHORIZED)
        .json({ success: false, error: services.message });
    } else {
      throw new ErrorHandler(
        "internal server eroor",
        statusCode.INTERNALSERVERERROR
      );
    }
  }
);
