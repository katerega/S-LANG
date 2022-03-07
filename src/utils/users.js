const { generateLocationMessage } = require("./messages");

const users = new Array;

// id = socket.id
const addUser = ({ id, username, room }) => {
    // clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // validate data
    if (!username || !room) {
        return {
            error: "User name and room are required."
        }
    }

    // check uniqueness
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;       
    })

    // validate username
    if (existingUser) {
        return {
            error: "Name is already in use."
        }
    }

    // store user
    const user = { id, username, room };
    users.push(user);
    return { user };
}

const removeUser = (id) => {
    // returns -1 for no match, or index of match
    const index = users.findIndex((user) => user.id === id);  

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id);
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => user.room === room);
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}