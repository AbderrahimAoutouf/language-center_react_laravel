import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import photoProfile from '../../images/user.png';
import axios from '../../api/axios'; 

function AvatarEdit({ setImageData , teacherId}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedImage, setCroppedImage] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const uploadImage = async (croppedImageUrl) => {
    try {
      const formData = new FormData();
      const blob = await fetch(croppedImageUrl).then(r => r.blob());
      formData.append('avatar', blob, `teacher_${teacherId}_avatar.jpg`);
      
      const res = await axios.post(`/api/teachers/${teacherId}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return res.data.url; // Return the uploaded image URL
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const getCroppedImage = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    const canvas = document.createElement('canvas');
    const image = new Image();
    image.src = imageSrc;
    

    await new Promise((resolve) => {
      image.onload = resolve;
    
    });

    const ctx = canvas.getContext('2d');
    const { width, height } = croppedAreaPixels;
    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      width,
      height,
      0,
      0,
      width,
      height
    );

    const croppedImageUrl = canvas.toDataURL('image/jpeg');
    setCroppedImage(croppedImageUrl);

    if (typeof setImageData === 'function') {
      setImageData(croppedImageUrl);
    }
    const uploadedUrl = await uploadImage(croppedImageUrl);
    setImageData(uploadedUrl); 
  }, [imageSrc, croppedAreaPixels, setImageData, teacherId]);

  return (
    <div className="EditAvatar">
      <div className="d-flex flex-column align-items-center">
        <img
          src={croppedImage || photoProfile}
          alt="Profile Preview"
          style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            objectFit: 'cover', // Ensure the image fits properly
          }}
          className="mb-3"
        />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button
          type="button"
          className="btn btn-danger"
          data-bs-toggle="modal"
          data-bs-target="#cropModal"
          disabled={!imageSrc}
        >
          Changer Photo de profile
        </button>
      </div>

      <div
        className="modal fade"
        id="cropModal"
        tabIndex="-1"
        aria-labelledby="cropModalLabel"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="cropModalLabel">Crop Your Image</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {imageSrc && (
                <div style={{ position: 'relative', width: '100%', height: 400 }}>
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>
              )}
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
                onClick={getCroppedImage}
                data-bs-dismiss="modal"
                disabled={!imageSrc}
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