import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema= new mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowecase: true,
            trim: true, 
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowecase: true,
            trim: true, 
        },
        password:{
            type:String,
            required:[true ,"Password Is required"],
        },
        refreshToken:{
            type:String,

        },
        coverImage:{
            type:String, //cloudinary url
            
        }
    }
)

// yaha password ko encrypt kar rahe h or yaha humne arrow function isliye use nahi kiya kyuki arrow function ke pass this ka context nahi hota

      userSchema.pre("save", async function(next){
           if(!this.isModified("password")) return next();
           this.password= await bcrypt.hash(this.password,10)
           next();
      } )

      // yaha hum password and encrypt password ko check kar rahe h
      userSchema.methods.isPasswordCorrect= async function(password){
        return bcrypt.compare(password,this.password)
      }

      //yaha hum access token genrate kar rahe h
      userSchema.methods.genrateAccessToken=function(){
          return jwt.sign(
            {_id: this._id, email: this.email, username:this.username},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
        )
          
      }
     
      userSchema.methods.genrateRefreshToken=function(){
        return jwt.sign(
            {_id: this._id},
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
        )
      }


const User= mongoose.model('User',userSchema);

export default User