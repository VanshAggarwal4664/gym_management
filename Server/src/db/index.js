import mongoose from "mongoose";
import { DB_Name } from "../constants.js";

const connectDB=async()=>{
    try {
       
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_Name}`)
        console.log(`Database Connected Successfully !! ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDb Connection error:",error);
    }
}

export default connectDB;