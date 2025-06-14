import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullName:{type:String},
    email:{type:String},
    password:{type:String},
    createdAt:{type:Date,default: Date.now},
    lastCheckedNotificationsAt: {
      type: Date,
      default: Date.now}
})

export default mongoose.model("User", userSchema);