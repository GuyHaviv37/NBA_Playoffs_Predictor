const mongoose = require('mongoose');
const localPassport = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    username : {type : String , required : true , unique : true},
    password : String,
    email : {type : String , required : true , unique : true},
    resetPasswordToken : String,
    resetPasswordExpire : Date,
    isAdmin : {type:Boolean , default:false},
    bracket : {type : mongoose.Schema.Types.ObjectId, ref : "Bracket"}
});

userSchema.plugin(localPassport);

module.exports = mongoose.model('User',userSchema);