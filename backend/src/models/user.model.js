import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    fullname:{
        type: String,
        required: true,
    },
    password: {
        type:String,
        required:true,
        unique:true,
        minlength:6
    },
    profilePic: {
        type: String,
        default: ""
    }

},
{ timestamps: true });

export const User = mongoose.model("User", userSchema);