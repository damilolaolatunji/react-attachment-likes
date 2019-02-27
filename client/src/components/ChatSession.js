import React from "react";
import Proptypes from "prop-types";
import { format } from "date-fns";
import { ThumbsUp } from "react-feather";

const ChatSession = props => {
  const { messages, likeImage, currentUser, currentRoom } = props;
  return messages.map(message => {
    const time = format(new Date(`${message.updatedAt}`), "HH:mm");
    let isLiked = false;
    let attachmentLikes = [];
    if (
      message.attachment &&
      currentRoom.customData &&
      currentRoom.customData.attachments &&
      currentRoom.customData.attachments[message.id]
    ) {
      const roomAttachments = currentRoom.customData.attachments;
      attachmentLikes = roomAttachments[message.id].likes;
      isLiked = roomAttachments[message.id].likes.includes(currentUser.id);
    }

    return (
      <li className="message" key={message.id}>
        <div>
          <span className="user-id">{message.senderId}</span>
          <span>{message.text}</span>
          {message.attachment ? (
            <div className="media">
              <div className="media-image">
                <img
                  className="image-attachment"
                  src={message.attachment.link}
                  alt={message.attachment.name}
                />
                <button
                  className="media-likes like-image"
                  onClick={() => likeImage(message.id)}
                  title={`Liked by ${attachmentLikes.join(", ")}`}
                >
                  <ThumbsUp className={isLiked ? "liked" : ""} />
                  <span className="likes-number">{attachmentLikes.length}</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <span className="message-time">{time}</span>
      </li>
    );
  });
};

ChatSession.propTypes = {
  messages: Proptypes.arrayOf(Proptypes.object).isRequired,
  likeImage: Proptypes.func.isRequired,
  currentUser: Proptypes.object.isRequired,
  currentRoom: Proptypes.object.isRequired
};

export default ChatSession;
