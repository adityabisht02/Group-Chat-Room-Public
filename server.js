require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");

//setting up siofu
var siofu = require("socketio-file-upload");
app.use(siofu.router);

//express.static middleware
app.use(express.static(path.join(__dirname, "public")));

//imports
const User = require("./models/users");
const Message = require("./models/messages");

//setting cors
var cors = require("cors");
app.use(cors());

//setting server
const server = app.listen(process.env.PORT || 5000, () => {
  console.log("listening on port 3000");
});
const io = require("socket.io")(server, { cors: { origin: "*" } });

//connecting the database
mongoose.connect(
  process.env.MONGO_URL
  
);

//apis for Rendering
app.get("/", function (req, res) {
  res.sendFile("./index.html");
});

//map to keep track of users in the current session with their socket ids
const users = {};

// io.on listens for events like user joining , sending message etc.
io.on("connection", (socket) => {
  //configuring siofu for file upload
  var uploader = new siofu();
  uploader.dir = "./public/uploads";
  uploader.listen(socket);

  uploader.on("saved", function (event) {
  
     uploadedfilepath= "./uploads/"+event.file.name;
      uploadedfilename=event.file.name;

    var x=new Date();
    var date=x.getHours()+":"+x.getMinutes();

    //save filename to messages DB and broadcast filename to other sockets
    const enteredfile= new Message({
      name: users[socket.id],
      isFileName:true,
      filename:uploadedfilename,
      filepath:uploadedfilepath,
      date: date,
    });
    enteredfile.save((err, savedmessage) => {
      if (err) {
        console.log(err);
      }       
      console.log(savedmessage);
    //tell clients that file is available on server
    socket.broadcast.emit("file-uploaded",savedmessage);
    });

    event.file.clientDetail.path=uploadedfilepath;
    event.file.clientDetail.name=uploadedfilename;

  });

  // Error handler:
  uploader.on("error", function (event) {
    console.log("Error from uploader");
  });

  //when new user joins we display all onlineusers and messages from DB and save the user
  socket.on("new-user-joined", (enteredname) => {
    users[socket.id] = enteredname;

    const newuser = new User({ name: enteredname });
    newuser.save(function (err, u) {
      if (err) return console.error(err);
      //user saved
    });

    User.find({}, function (err, foundusers) {
      if (err) {
        console.log(err);
      }
      socket.emit("get-online-users", foundusers);
    });

    Message.find({}, function (err, foundmessages){
      if (err) {
        console.log(err);
      }
      socket.emit("get-previous-messages", foundmessages);
    });

    socket.broadcast.emit("user-joined", users[socket.id]);
  });

  socket.on("send-message", (message, date) => {
    const enteredmessage = new Message({
      name: users[socket.id],
      message: message,
      date: date,
    });
    enteredmessage.save((err, savedmessage) => {
      if (err) {
        console.log(err);
      }

    });
    socket.broadcast.emit("receive", {
      message: message,
      name: users[socket.id],
    });
  });
});
