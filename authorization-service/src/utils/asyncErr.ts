import ErrorHandler from "./errorHandler";
import { Request, Response, NextFunction } from "express";

const asyncErr = (controller:any) => async (req: Request, res:Response, next:NextFunction) => {
  try {
    await controller(req, res, next);
  } catch (error:any) {
    next(new ErrorHandler(error.message, error.statusCode));
  }
};

export default asyncErr;
