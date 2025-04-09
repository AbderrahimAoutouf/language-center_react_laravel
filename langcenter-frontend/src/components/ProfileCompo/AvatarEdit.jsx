import React, { useState, useEffect } from 'react';
import Avatar from 'react-avatar-edit';
import photoProfile from '../../images/user.png';

function AvatarEdit({ setImageData }) {
  const [imgCrop, setImgCrop] = useState(null);
  const [storeImage, setStoreImage] = useState([]);

  // This useEffect applies a monkey patch to the Canvas prototype
  // to always set willReadFrequently to true when getContext is called
  useEffect(() => {
    // Store the original getContext method
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    
    // Override the getContext method
    HTMLCanvasElement.prototype.getContext = function(contextType, contextAttributes = {}) {
      // Automatically add willReadFrequently for 2d contexts
      if (contextType === '2d') {
        contextAttributes.willReadFrequently = true;
      }
      
      // Call the original method with our modified attributes
      return originalGetContext.call(this, contextType, contextAttributes);
    };
    
    // Cleanup function to restore the original method when component unmounts
    return () => {
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    };
  }, []);

  const onClose = () => {
    setImgCrop(null);
  };

  const onCrop = (preview) => {
    setImgCrop(preview);
  };

  const saveImage = () => {
    if (!imgCrop) return;
    
    const newImage = { imgCrop };
    setStoreImage([...storeImage, newImage]);
    
    if (typeof setImageData === 'function') {
      setImageData(imgCrop);
    }
  };

  const profileImageShow = storeImage.map((item) => item.imgCrop);

  return (
    <div className='EditAvatar'>
      <div className='d-flex flex-column align-items-center'>
        <img
          src={profileImageShow.length ? profileImageShow[0] : photoProfile}
          alt="Profile Preview"
          style={{ width: '150px', height: '150px', borderRadius: '50%' }}
          className='mb-3'
        />
        <button
          type="button"
          className="btn btn-danger"
          data-bs-toggle="modal"
          data-bs-target="#exampleModal"
        >
          Changer Photo de profile
        </button>
      </div>

      <div
        className="modal fade"
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">Photo de profile</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <Avatar
                width={400}
                height={300}
                onCrop={onCrop}
                onClose={onClose}
                // Only using width as per error message
                imageWidth={400}
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={saveImage}
                data-bs-dismiss="modal"
                disabled={!imgCrop}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AvatarEdit;