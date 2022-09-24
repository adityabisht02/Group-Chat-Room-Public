const mongoose = require('mongoose')


const messageSchema = new mongoose.Schema({
  name:String,
  message:String,
  date:String,
  isFileName:Boolean,   //to check whether message is a file
  filename:String,
  filepath:String
});

const Message = mongoose.model('Message', messageSchema);

module.exports=Message;