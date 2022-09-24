
const socket = io("/");

//file uploader events 
var uploader = new SocketIOFileUpload(socket);
uploader.listenOnInput(document.getElementById("uploadedfile"));

//event that file is uploaded to server so it can be shown on uploaders side
uploader.addEventListener("complete", (event) => {
  console.log(event.detail.path);
  createYourFileMessage(event.detail.path,event.detail.name);

});

const audio = new Audio("./resources/ting.mp3");
const enteredname = prompt("Enter ur name to join chat");
const onlineMembersText = document.querySelector(".online-members-text");
const form = document.querySelector("form");
const inputMessage = document.querySelector(".enter-message");
const chatcontainer = document.querySelector(".chat-container");


//file upload functions
function createYourFileMessage(path,filename){
  filecontainer=document.createElement("div");
  filecontainer.classList.add("your-file-upload-container");

  urname = document.createElement("p");
  urname.innerHTML= enteredname;
  urname.classList.add("name");
  filecontainer.appendChild(urname);

  fileupload = document.createElement("div");
  fileupload.classList.add("your-file-upload");

  fileuploadtext= document.createElement("p");
  fileuploadtext.classList.add('file-upload-text');
  fileuploadtext.innerText = filename;
  fileupload.appendChild(fileuploadtext);

  link=document.createElement("a");
  link.setAttribute('href',path);
  link.setAttribute("target","blank");

  downloadicon=document.createElement("img");
  downloadicon.classList.add("download-icon");
  downloadicon.setAttribute("src","./resources/downloadpic.png");
  link.appendChild(downloadicon);
  fileupload.appendChild(link);
  filecontainer.appendChild(fileupload);

  x = new Date();
  currentdate = x.getHours() + ":" + x.getMinutes();
  date=document.createElement("p");
  date.classList.add("date");
  date.innerHTML = currentdate;
  filecontainer.appendChild(date);

  chatcontainer.appendChild(filecontainer);

}

function createGroupFileMessage(path,filename,name){
  filecontainer=document.createElement("div");
  filecontainer.classList.add("group-file-upload-container");

  urname = document.createElement("p");
  urname.innerHTML=name;
  urname.classList.add("name");
  filecontainer.appendChild(urname);

  fileupload = document.createElement("div");
  fileupload.classList.add("group-file-upload");

  fileuploadtext= document.createElement("p");
  fileuploadtext.classList.add('file-upload-text');
  fileuploadtext.innerText = filename;
  fileupload.appendChild(fileuploadtext);

  link=document.createElement("a");
  link.setAttribute('href',path);
  link.setAttribute("target","blank");

  downloadicon=document.createElement("img");
  downloadicon.classList.add("download-icon");
  downloadicon.setAttribute("src","./resources/downloadpic.png");
  link.appendChild(downloadicon);
  fileupload.appendChild(link);
  filecontainer.appendChild(fileupload);

  x = new Date();
  currentdate = x.getHours() + ":" + x.getMinutes();
  date=document.createElement("p");
  date.classList.add("date");
  date.innerHTML = currentdate;
  filecontainer.appendChild(date);

  chatcontainer.appendChild(filecontainer);
}




//messages functions
function createmessage(enteredname, enteredmsg, currentdate) {
  urmsg = document.createElement("div");
  urmsg.classList.add("your-msg-container");

  urname = document.createElement("p");
  urname.classList.add("name");
  urname.innerText = enteredname;
  urmsg.appendChild(urname);

  message = document.createElement("div");
  message.classList.add("your-message");

  p = document.createElement("p");
  p.innerText = enteredmsg;
  message.appendChild(p);
  urmsg.appendChild(message);

  date = document.createElement("p");
  date.innerText = currentdate;
  date.classList.add("date");
  urmsg.appendChild(date);

  chatcontainer.appendChild(urmsg);

  chatcontainer.scrollTo(0, chatcontainer.scrollHeight);
  socket.emit("send-message", enteredmsg, date.innerText);
}

function createGroupMessage(enteredname, enteredmsg, currentdate) {
  urmsg = document.createElement("div");
  urmsg.classList.add("group-msg-container");

  urname = document.createElement("p");
  urname.classList.add("name");
  urname.innerText = enteredname;
  urmsg.appendChild(urname);

  message = document.createElement("div");
  message.classList.add("group-message");

  p = document.createElement("p");
  p.innerText = enteredmsg;
  message.appendChild(p);
  urmsg.appendChild(message);

  date = document.createElement("p");
  date.innerText = currentdate;
  date.classList.add("date");
  urmsg.appendChild(date);
  chatcontainer.appendChild(urmsg);
  chatcontainer.scrollTo(0, chatcontainer.scrollHeight);
}

function addOnlineUser(user) {
  if (onlineMembersText.innerText == "No one online") {
    onlineMembersText.innerText = " " + user;
  } else {
    let str = onlineMembersText.innerText;
    onlineMembersText.innerText = str + ", " + user;
  }
}

function createUserJoinAlert(x) {
  container = document.createElement("div");
  container.classList.add("user-joined-alert");
  msg = document.createElement("p");
  msg.innerText = x + " joined the group";
  msg.classList.add("user-joined-alert-msg");
  container.appendChild(msg);
  chatcontainer.appendChild(container);

  chatcontainer.scrollTo(0, chatcontainer.scrollHeight);
}

socket.emit("new-user-joined", enteredname); //emits the new user joined event for backend to catch

//listen for file-uploaded signal and broadcast it to everyone except the uploader
socket.on("file-uploaded", (fileobj) => {
  createGroupFileMessage(fileobj.filepath,fileobj.filename,fileobj.name);
});

//get online users from backend
socket.on("get-online-users", (users) => {
  for (var i = 0; i < users.length; i++) {
    if (users[i].name != null) {
      addOnlineUser(users[i].name);
    }
  }
});

socket.on("user-joined", (enteredname) => {
  audio.play();
  console.log();
  createUserJoinAlert(enteredname);
  addOnlineUser(enteredname);
});

//getting previous messages from server
socket.on("get-previous-messages", (foundmessages) => {
  for (var i = 0; i < foundmessages.length; i++) {  
    if (foundmessages[i].name != null) {
      //if its your message
      if (foundmessages[i].name === enteredname) {
        //if its a file create file
        if(foundmessages[i].isFileName){
          createYourFileMessage("",foundmessages[i].filename);
        }
        //else create normal message
        else{
          createmessage(foundmessages[i].name,foundmessages[i].message,foundmessages[i].date);
        }
        
      } 
      //if its another users message
      else {
        //if its a file create file
        if(foundmessages[i].isFileName){
          createGroupFileMessage(foundmessages[i].filepath,foundmessages[i].filename,foundmessages[i].name);
        }
        //else create normal message
        else{
          createGroupMessage(
            foundmessages[i].name,
            foundmessages[i].message,
            foundmessages[i].date
          );
        }
        
      }
    }
  }
});

//listening for message broadcast of one client from server
socket.on("receive", (data) => {
  console.log(socket.id + " is the socket id");
  audio.play();

  x = new Date();
  currentdate = x.getHours() + ":" + x.getMinutes();
  createGroupMessage(data.name, data.message, currentdate);
});


// If the form gets submitted, send server the message
form.addEventListener("submit", (e) => {
  e.preventDefault();
  var message = inputMessage.value;
  x = new Date();
  currentdate = x.getHours() + ":" + x.getMinutes();
  createmessage("You", message, currentdate);
  inputMessage.value = "";
});
