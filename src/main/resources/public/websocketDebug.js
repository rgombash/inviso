//Establish the WebSocket connection and set up event handlers
var webSocket = new WebSocket("ws://" + location.hostname + ":" + location.port + "/wsapi");
webSocket.onmessage = function (msg) { updateChat(msg); };
webSocket.onclose = function () { cancelKeepAlive(); alert("WebSocket connection closed") };
webSocket.onopen = function () {  keepAlive(); }

//Send message if "Send" is clicked
id("send").addEventListener("click", function () {
    sendMessage(id("message").value);
});

//Send message if enter is pressed in the input field
id("message").addEventListener("keypress", function (e) {
    if (e.keyCode === 13) { sendMessage(e.target.value); }
});

//Send a message if it's not empty, then clear the input field
function sendMessage(message) {
    if (message !== "") {
        webSocket.send(message);
        id("message").value = "";
    }
}

//Update the chat-panel, and the list of connected users
function updateChat(msg) {
    var data = JSON.parse(msg.data);
    console.log(data);
    insert("chat", data.userMessage, data.Sender, data.SendDate);
    id("userlist").innerHTML = "";
    data.userlist.forEach(function (user) {
        insert_userlist("userlist", "<li>" + user + "</li>");
    });
}

//Helper function for inserting HTML as the first child of an element
function insert_userlist(targetId, message) {
    id(targetId).insertAdjacentHTML("afterbegin", message);
}

function insert(targetId, message, sender, date) {
    message2 = '<article><b>' + sender + '</b><span class=\"timestamp\">' + date + '</span><p>' + message + '</p></article>';
    id(targetId).insertAdjacentHTML("afterbegin", message2);
}

//Helper function for selecting element by id
function id(id) {
    return document.getElementById(id);
}

var timerID = 0;

function keepAlive() {
    var timeout = 60000;
    if (webSocket.readyState == webSocket.OPEN) {
        webSocket.send('{"command":"keepalive"}');
    }
    timerId = setTimeout(keepAlive, timeout);
}

function cancelKeepAlive() {
    if (timerId) {
        clearTimeout(timerId);
    }
}
