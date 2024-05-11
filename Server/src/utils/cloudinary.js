import dotenv from 'dotenv';
dotenv.config()
import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'

          

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadonCloudinary= async (localFilepath)=>{
    try {
        if(!localFilepath) return null;
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilepath,{resource_type:"auto" })
        fs.unlinkSync(localFilepath);
        return response
    } catch (error) {
        console.log(error)
        fs.unlinkSync(localFilepath);
        return null
    }

}

export {uploadonCloudinary};