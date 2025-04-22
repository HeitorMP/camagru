let csrfToken = null;
async function fetchCsrfToken() {
  try {
      const response = await fetch('/api/?page=auth_check', {
          method: 'GET',
          credentials: 'include'
      });
      const data = await response.json();
      csrfToken = data.csrf_token || null;

  } catch (error) {
      const flash = document.getElementById('flashMessage');
      flash.textContent = 'Csrf token invalid. Try again';
      flash.style.color = 'red';
  }
}

export async function init() {

  const width = 320;
  let height = 0;
  let streaming = false;
  let mode = 'camera'; // 'camera' or 'upload'
  let selectedFile = null;

  let video = null;
  let uploadCanvas = null;
  let startButton = null;
  let stream = null;

  function getOverlays() {
    return [
      { name: '42-piscine', type: 'png' },
      { name: 'shadow', type: 'png' },
      { name: 'crt', type: 'png' },
      { name: 'rain', type: 'gif' }, 
    ];
  }
  

  await fetchCsrfToken();

  function startup() {
    const overlaySelect = document.getElementById("overlay-select");
    const overlay = document.getElementById("overlay");
    startButton = document.getElementById("start-button");
    const fileInput = document.getElementById("file-input");
    const cameraModeButton = document.getElementById("camera-mode");
    const uploadModeButton = document.getElementById("upload-mode");

    const overlayOptions = getOverlays();
      overlayOptions.forEach((overlayObj) => {
      const option = document.createElement("option");
      option.value = overlayObj.name;
      option.dataset.type = overlayObj.type; // Armazena o tipo como atributo de dados
      option.textContent = overlayObj.name;
      overlaySelect.appendChild(option);
    });


    video = document.getElementById("video");
    uploadCanvas = document.getElementById("upload-canvas");

    function switchToCameraMode() {
      mode = 'camera';
      cameraModeButton.classList.add('active');
      uploadModeButton.classList.remove('active');
      video.style.display = 'block';
      selectedFile = null;
      startButton.textContent = 'Take Photo';
      startButton.disabled = overlaySelect.value === '';
      initializeCamera();
      clearCanvas();
    }

    function switchToUploadMode() {
      mode = 'upload';
      uploadModeButton.classList.add('active');
      cameraModeButton.classList.remove('active');
      video.style.display = 'none';
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
      }
      startButton.textContent = 'Upload Photo';
      startButton.disabled = true;
      fileInput.click();
      clearCanvas();
    }

    function clearCanvas() {
      const context = uploadCanvas.getContext("2d");
      context.clearRect(0, 0, uploadCanvas.width, uploadCanvas.height);
    }

    function initializeCamera() {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((mediaStream) => {
          stream = mediaStream;
          video.srcObject = stream;
          video.play();
        })
        .catch((err) => {
          const flash = document.getElementById('flashMessage');
          flash.textContent = 'Unable to access camera. Please check your permissions.';
          flash.style.color = 'red';
        });
    }

    cameraModeButton.addEventListener('click', switchToCameraMode);
    uploadModeButton.addEventListener('click', switchToUploadMode);

    video.addEventListener(
      "canplay",
      () => {
        if (!streaming && mode === 'camera') {
          height = video.videoHeight / (video.videoWidth / width);
          if (isNaN(height)) height = width / (4 / 3);

          video.setAttribute("width", width);
          video.setAttribute("height", height);
          uploadCanvas.setAttribute("width", width);
          uploadCanvas.setAttribute("height", height);
          streaming = true;
        }
      },
      false
    );

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        selectedFile = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            height = img.height / (img.width / width);
            uploadCanvas.setAttribute("width", width);
            uploadCanvas.setAttribute("height", height);
            const context = uploadCanvas.getContext("2d");
            context.drawImage(img, 0, 0, width, height);
            startButton.disabled = overlaySelect.value === '';
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(selectedFile);
      }
    });

    overlaySelect.addEventListener("change", () => {
      const selectedOption = overlaySelect.selectedOptions[0];
      const selected = selectedOption.value;
      const type = selectedOption.dataset.type;
      const overlay = document.getElementById("overlay");
    
      if (selected === "") {
        overlay.style.display = "none";
        startButton.disabled = true;
      } else {
        overlay.src = `/assets/media/preview/${selected}.${type}`;
        overlay.style.display = "block";
        startButton.disabled = mode === 'upload' && !selectedFile;
      }
    });
    

    startButton.addEventListener("click", async (e) => {
      e.preventDefault();
      if (overlay.style.display === "none") {
        const flash = document.getElementById('flashMessage');
        flash.textContent = 'Select an overlay first.';
        flash.style.color = 'red';
        return;
      }
      await takeAndUploadPhoto();
    });
  }

  async function takeAndUploadPhoto() {
    const overlay = document.getElementById("overlay-select").value;
    const context = uploadCanvas.getContext("2d");

    if (!width || !height) return;

    uploadCanvas.width = width;
    uploadCanvas.height = height;

    if (mode === 'camera') {
      context.drawImage(video, 0, 0, width, height);
    } else if (mode === 'upload' && selectedFile) {
      const img = new Image();
      img.src = URL.createObjectURL(selectedFile);
      await new Promise((resolve) => {
        img.onload = () => {
          context.drawImage(img, 0, 0, width, height);
          resolve();
        };
      });
    } else {
      const flash = document.getElementById('flashMessage');
      flash.textContent = 'No file selected.';
      flash.style.color = 'red';
      return;
    }

    uploadCanvas.toBlob(async (blob) => {
      if (!blob) {
        const flash = document.getElementById('flashMessage');
        flash.textContent = 'Error generating image.';
        flash.style.color = 'red';
        return;
      }

      if (!csrfToken) {
        await fetchCsrfToken();
        if (!csrfToken) {
            flash.textContent = 'Erro: Token de segurança não disponível.';
            flash.style.color = 'red';
            return;
        }
    }

      const formData = new FormData();
      formData.append("photo", blob, "captured.png");
      formData.append("overlay", overlay);
      formData.append("csrf_token", csrfToken );
      const uploadBtn = document.getElementById("start-button");
      if (uploadBtn) {
        uploadBtn.textContent = "Uploading...";
        uploadBtn.disabled = true;
      }

      try {
        const response = await fetch('/api/?page=upload_photo', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
        // console.log(response.text());
        const data = await response.json();
        console.log(data);

        if (response.ok && data.status === 'success') {
          await loadGallery();
        } else {
          const flash = document.getElementById('flashMessage');
          flash.textContent = data.message || 'Error sending image. Try again.';
          flash.style.color = 'red';
        }
      } catch (error) {
        const flash = document.getElementById('flashMessage');
        flash.textContent = 'Error sending image. Try again.';
        flash.style.color = 'red';
      }
      if (uploadBtn) {
        uploadBtn.textContent = "Take/Upload Photo";
        uploadBtn.disabled = false;
      }
    }, 'image/png');

  }

  async function loadGallery() {
    
    try {
      const response = await fetch('/api/?page=get_gallery', {
        credentials: 'include',
        method: 'GET',
      });

      const data = await response.json();
      const gallery = document.getElementById("gallery-editor");
      gallery.innerHTML = "";

      data.photos.forEach((photo) => {
        const card = document.createElement("div");
        card.className = "card shadow-sm p-2";
        const fullPath = `/api/${photo.image_path}`;
        const filename = photo.image_path.split("/").pop();

        card.innerHTML = `
          <div class="d-flex flex-column align-items-center">
            <img src="${fullPath}" class="card-img-top mb-2" style="max-width: 100%; width: 250px; border-radius: 8px;" alt="User photo" />
            <button id="${filename}" class="btn btn-sm btn-danger mt-2">Delete</button>
          </div>
        `;

        gallery.appendChild(card);

        const deleteButton = card.querySelector(".btn-danger");
        deleteButton.addEventListener("click", async (e) => {
          e.preventDefault();
          if (!csrfToken) {
            await fetchCsrfToken();
            if (!csrfToken) {
                flash.textContent = 'Erro: Token de segurança não disponível.';
                flash.style.color = 'red';
                return;
            }
          }
          try {
            const response = await fetch(`/api/?page=delete_photo`, {
              headers: {
                'Content-Type': 'application/json'
              },
              method: 'DELETE',
              credentials: 'include',
              body: JSON.stringify({ filename: filename, csrf_token: csrfToken }),
            });
            const data = await response.json();

            if (response.ok && data.status === 'success') {
              await loadGallery();
            } else {
              const flash = document.getElementById('flashMessage');
              flash.textContent = data.message || 'Error deleting image. Try again.';
              flash.style.color = 'red';
            }
          } catch (error) {
            const flash = document.getElementById('flashMessage');
            flash.textContent = 'Error deleting image. Try again.';
            flash.style.color = 'red';
          }
        });
      });
    } catch (error) {
      const flash = document.getElementById('flashMessage');
      flash.textContent = 'Error loading gallery. Try again later.';
      flash.style.color = 'red';
    }
  }

  window.addEventListener("load", startup, false);
  startup();
  loadGallery();
}