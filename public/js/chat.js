"use strict";

const socket = io();

const input = document.querySelector("#input");
const messageForm = document.querySelector("#message-form");
const messageFormInput = messageForm.querySelector("input");
const messageFormButton = messageForm.querySelector("button");
const locationButton = document.querySelector("#send-location");
const messages = document.querySelector("#messages");

// mustache templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    // This function determines if the reader was at the head of the chat
    // (e.g., not reading back in the history), and if so, it auto-scrolls.
    // Invoked when new messages come in.

    const newMessage = messages.lastElementChild;

    // calculate height of new message
    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

    // height of message box interior
    const visibleHeight = messages.offsetHeight;

    // height of message box
    const containerHeight = messages.scrollHeight;

    // distance already scrolled from top
    const scrollOffset = messages.scrollTop + visibleHeight;

    // if we were at the bottom before the newest message was added...
    if (containerHeight - newMessageHeight <= scrollOffset) {
        // ... scroll to bottom
        messages.scrollTop = messages.scrollHeight; 
    }
}

socket.on("message", (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text, 
        createdAt: moment(message.createdAt).format("H:mm")  // moment library is included in index.html
    });
    messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
})

socket.on("locationMessage", (message) => {
    console.log(message);
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format("H:mm")
    });
    messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
})

socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html;
} )

messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // disable until send completes
    messageFormButton.setAttribute("disabled", "disabled");
    const message = input.value;

    socket.emit("sendMessage", message, (error) => {
        // re-enable
        messageFormButton.removeAttribute("disabled");
        // clear input form
        messageFormInput.value = "";
        messageFormInput.focus();
        if (error) {
            return console.log(error);
        }
        console.log("Message delivered.");
    });
})

locationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by this browser.");
    }

    locationButton.setAttribute("disabled", "disabled");

    navigator.geolocation.getCurrentPosition((position) => {
        const coords = {
            "latitude": position.coords.latitude,
            "longitude": position.coords.longitude
        }
        socket.emit("locationMessage", coords, () => console.log("Location shared!"));
        locationButton.removeAttribute("disabled");
    });
})

socket.emit("join", { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = "/";    // redirect to login
    }
});