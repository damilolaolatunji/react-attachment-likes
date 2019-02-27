import Chatkit from "@pusher/chatkit-client";
import axios from "axios";

function likeImage(id) {
  const { currentRoom, currentUser } = this.state;
  const roomAttachments = currentRoom.customData.attachments;
  const userId = currentUser.id;

  const index = roomAttachments[id].likes.indexOf(userId);
  if (index !== -1) {
    roomAttachments[id].likes.splice(index, 1);
  } else {
    roomAttachments[id].likes.push(userId);
  }

  const roomData = currentRoom.customData || {};
  roomData.attachments = roomAttachments;

  return currentUser.updateRoom({
    roomId: currentRoom.id,
    customData: roomData
  });
}

function toggleFileUploadDialog() {
  this.setState({
    showFileUploadDialog: !this.state.showFileUploadDialog
  });
}

function uploadAttachment(event) {
  event.preventDefault();
  const { fileMessage, currentUser, currentRoom } = this.state;
  const file = this.fileAttachment.current.files[0];

  currentUser
    .sendMessage({
      text: fileMessage || file.name,
      roomId: currentRoom.id,
      attachment: {
        file,
        name: file.name
      }
    })
    .then(messageId => {
      const roomData = currentRoom.customData || {};

      const roomAttachments = roomData.attachments || {};
      roomAttachments[messageId] = {
        likes: []
      };

      roomData.attachments = roomAttachments;

      return currentUser.updateRoom({
        roomId: currentRoom.id,
        customData: roomData
      });
    })
    .catch(console.error);

  this.setState({
    showFileUploadDialog: false,
    fileMessage: ""
  });
}

function sendMessage(event) {
  event.preventDefault();
  const { newMessage, currentUser, currentRoom } = this.state;

  if (newMessage.trim() === "") return;

  currentUser.sendMessage({
    text: newMessage,
    roomId: `${currentRoom.id}`
  });

  this.setState({
    newMessage: ""
  });
}

function handleInput(event) {
  const { value, name } = event.target;

  this.setState({
    [name]: value
  });
}

function connectToRoom(id = "<your room id>") {
  const { currentUser } = this.state;

  this.setState({
    messages: []
  });

  return currentUser
    .subscribeToRoom({
      roomId: `${id}`,
      messageLimit: 100,
      hooks: {
        onMessage: message => {
          this.setState({
            messages: [...this.state.messages, message]
          });
        },
        onPresenceChanged: () => {
          const { currentRoom } = this.state;
          this.setState({
            roomUsers: currentRoom.users.sort(a => {
              if (a.presence.state === "online") return -1;

              return 1;
            })
          });
        }
      }
    })
    .then(currentRoom => {
      const roomName =
        currentRoom.customData && currentRoom.customData.isDirectMessage
          ? currentRoom.customData.userIds.filter(
              id => id !== currentUser.id
            )[0]
          : currentRoom.name;

      this.setState({
        currentRoom,
        roomUsers: currentRoom.users,
        rooms: currentUser.rooms,
        roomName
      });
    })
    .catch(console.error);
}

function connectToChatkit(event) {
  event.preventDefault();

  const { userId } = this.state;

  if (userId === null || userId.trim() === "") {
    alert("Invalid userId");
    return;
  }

  this.setState({
    isLoading: true
  });

  axios
    .post("http://localhost:5200/users", { userId })
    .then(() => {
      const tokenProvider = new Chatkit.TokenProvider({
        url: "http://localhost:5200/authenticate"
      });

      const chatManager = new Chatkit.ChatManager({
        instanceLocator: "<your chatkit instance locator>",
        userId,
        tokenProvider
      });

      return chatManager
        .connect({
          onAddedToRoom: room => {
            const { rooms } = this.state;
            this.setState({
              rooms: [...rooms, room]
            });
          },
          onRoomUpdated: room => {
            const { rooms, currentRoom } = this.state;
            const index = rooms.findIndex(e => e.id === room.id);

            rooms[index] = room;

            this.setState({
              rooms
            });

            if (currentRoom.id === room.id) {
              this.setState({
                currentRoom: room
              });
            }
          }
        })
        .then(currentUser => {
          this.setState(
            {
              currentUser,
              showLogin: false,
              isLoading: false,
              rooms: currentUser.rooms
            },
            () => connectToRoom.call(this)
          );
        });
    })
    .catch(console.error);
}

function createPrivateRoom(id) {
  const { currentUser, rooms } = this.state;
  const roomName = `${currentUser.id}_${id}`;

  const isPrivateChatCreated = rooms.filter(room => {
    if (room.customData && room.customData.isDirectMessage) {
      const arr = [currentUser.id, id];
      const { userIds } = room.customData;

      if (arr.sort().join("") === userIds.sort().join("")) {
        return {
          room
        };
      }
    }

    return false;
  });

  if (isPrivateChatCreated.length > 0) {
    return Promise.resolve(isPrivateChatCreated[0]);
  }

  return currentUser.createRoom({
    name: `${roomName}`,
    private: true,
    addUserIds: [`${id}`],
    customData: {
      isDirectMessage: true,
      userIds: [currentUser.id, id]
    }
  });
}

function sendDM(id) {
  createPrivateRoom.call(this, id).then(room => {
    connectToRoom.call(this, room.id);
  });
}

export {
  sendMessage,
  handleInput,
  connectToRoom,
  connectToChatkit,
  sendDM,
  toggleFileUploadDialog,
  uploadAttachment,
  likeImage
};
