import momentTimeZone from 'moment-timezone';
import * as bcrypt from "bcryptjs"
import * as dotenv from 'dotenv'
dotenv.config()
export function encryptHash (data:string){
 let salt = process.env.SALT_ROUND;
 return  bcrypt.hash(data,Number(salt)||10);
}
export function comparePassword (inputPassword:string, hashedPassword:string){
return bcrypt.compare(inputPassword, hashedPassword)
}
export function findSimilarValues(data:any) {
    if (data.length === 0) {
      return [];
    }
    let newArr:string[] = []
   data.map((value:any)=>{
    for (let i in value.parentId){
        if(value.parentId[i]!==undefined){
            newArr.push(value.parentId[i])
        }
    }
   })
   let newSet = [... new Set(newArr)]
   return newSet
  }

  export function stringToBool(data:string){
    if(data==='true' || data ==='available' || data === '1' && typeof data==='string'){
        console.log("true data")
        return true
    } else if(data==='false' || data==='not available' || data === '0' && typeof data==='string'){
        console.log("elseif false")
        return false
    } else {
        console.log("false data")
        false
    }
} 

export function localDateChanger(date: any) {
    if (typeof date === 'undefined') {
      return date;
    }
const currentTimeZone = momentTimeZone.tz(date, 'Asia/Kolkata')
return currentTimeZone.format('YYYY-MM-DD HH:mm:ss');
}

