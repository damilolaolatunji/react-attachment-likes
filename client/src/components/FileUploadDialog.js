import React from "react";
import Proptypes from "prop-types";
import { XSquare } from "react-feather";

const FileUploadDialog = props => {
  const {
    fileMessage,
    toggleFileUploadDialog,
    fileAttachment,
    handleInput,
    uploadAttachment
  } = props;

  return (
    <div className="dialog-container">
      <div className="dialog">
        <header className="dialog-header">
          <h4>Upload a file</h4>
          <button onClick={toggleFileUploadDialog}>
            <XSquare />
          </button>
        </header>
        <form className="dialog-form" onSubmit={uploadAttachment}>
          <input
            type="file"
            ref={fileAttachment}
            accept="image/png, image/jpeg"
          />
          <label className="dialog-label" htmlFor="new-message">
            Add a message about the file
          </label>
          <input
            id="new-message"
            className="dialog-input"
            autoFocus
            type="text"
            name="fileMessage"
            value={fileMessage}
            onChange={handleInput}
            placeholder="Enter your message"
          />
          <button type="submit" className="submit-btn">
            Upload
          </button>
        </form>
      </div>
    </div>
  );
};

FileUploadDialog.propTypes = {
  fileMessage: Proptypes.string.isRequired,
  handleInput: Proptypes.func.isRequired,
  uploadAttachment: Proptypes.func.isRequired,
  toggleFileUploadDialog: Proptypes.func.isRequired
};

export default FileUploadDialog;
