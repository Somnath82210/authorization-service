import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv';
dotenv.config()

let baseUrl = process.env.DATABASE_URL;
let kycUrl = baseUrl + "kycDatabase";
let userDataUrl = baseUrl + 'userDatabase';
declare global {
    var prismaKycUrl: PrismaClient | undefined
    var prismaUserDataUrl: PrismaClient | undefined
    
}

const prismaKycUrl = globalThis.prismaKycUrl || new PrismaClient({ datasources: { db: { url: kycUrl } } });
const prismaUserDataUrl = globalThis.prismaUserDataUrl || new PrismaClient({ datasources: { db: { url: userDataUrl } } });
if(process.env.NODE_ENV != 'production') {
    globalThis.prismaKycUrl = prismaKycUrl
    globalThis.prismaUserDataUrl = prismaUserDataUrl
}

export { prismaKycUrl, prismaUserDataUrl}
