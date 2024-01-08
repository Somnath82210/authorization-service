import dotenv from 'dotenv'
import jwt from 'jsonwebtoken';
dotenv.config()

export async function tokenVerify(token:string){
    return new Promise((resolve,reject)=>{
        let splitToken = token.split(" ")[1]
        let secret = process.env.JWT_SECRET as string;
         jwt.verify(splitToken, secret,  (err: any, decoded: any) => {
            if (err) {
                console.log("err in token",err)
                resolve({data:"error"})
            } else {
                resolve({data:decoded})
            }
         })
    })
}