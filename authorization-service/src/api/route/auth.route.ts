import {
    adminLevelCheckController,
    authorizationController,
    kycDone,
    kycListController,
    userlist,
    countSellersController,
    activeInactiveController,
    editSellerController,
    activeInactiveProductController
} from "../controllers/auth.controller";
import express from "express";
import multer from 'multer';

let routes = express.Router()

const upload = multer({ dest: 'public/uploads/' });

routes.get('/authenticate', authorizationController);
routes.post('/checkout?:id', kycDone);
routes.get('/kyclist?:id', kycListController);
routes.get('/userlist', userlist);
routes.get('/checkadmin', adminLevelCheckController);
routes.get('/count', countSellersController);
routes.put('/changeaccstatus?:id', activeInactiveController);
routes.put('/kyc?:id',upload.any(), editSellerController);
routes.put('/pdtactive?:id', activeInactiveProductController);
export default routes;
