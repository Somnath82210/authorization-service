export type kycData = {
  id?: string;
  kycStatus?: number | null;
  userId?: string;
  statusCode?: number | null;
  adminApprove?: boolean | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type adminLevelCheck = {
  id?: string;
  isAdmin: boolean | null;
}[];

export type authorizationData = {
  id?: string;
  kycStatus?: number | null;
  statusCode: number | null;
}[];

export type kycFullData = {
  id?: string;
  userId?: string;
  businessName: string;
  companyTitle: string;
  legalName: string;
  logo?: string;
  info: string;
  website?: string | null;
  address: string;
  city: string;
  country: string;
  state: string;
  pinCode: string;
  geolocation: string;
  contactEmail: string;
  contactPhone: number | null;
  pan: string;
  gstin: string;
  fssaiNo?: string | null;
  canceledCheque: string;
  addressProof: string;
  idProof: string;
  locationAvail: string;
  organization: string | null;
  packageWeight: string | null;
  hsn: string | null;
  distrLicenseNo: string | null;
}[];
export type bankDetailsType = {
  id?: string;
  userId?: string;
  accountHolderName: string;
  accountNumber: number | null;
  bankName: string;
  bankCity: string;
  branch: string;
  IfscCode: string;
}[];

export type ondcType = {
  id?: string;
  userId?: string;
  timeToShip: string;
  cancellable: boolean;
  returnable: boolean;
  sellerPickupReturn?: boolean | null;
  availableCOD: boolean | null;
  defaultCategoryId: string;
  consumerCare: string;
}[];

export type storeTimeType = {
  id?: string;
  userId?: string;
  type: string;
  days: string;
  startTime: string;
  endTime: string;
}[];

export type userData = {
  id?: string;
  isAdmin: boolean | null;
  adminLevel: number | null;
}[];
export type tokenVerifyType = {
  data: {
    id: string;
    email: string;
    hashedPassword: string;
    kycStatus: number;
    statusCode: number;
    isAdmin: boolean;
    adminLevel: number;
  };
};
export interface PromiseResult {
  status: boolean;
  message: string;
  data?: any;
}
export interface senderPromise {
  data: string;
  otp: string;
  error: string;
}
