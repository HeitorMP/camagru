export function init() {
  console.log('Editor init');

  const width = 320;
  let height = 0;
  let streaming = false;

  let video = null;
  let uploadCanvas = null;
  let startButton = null;



  function showViewLiveResultButton() {
    if (window.self !== window.top) {
      document.querySelector(".content-area").remove();
      const button = document.createElement("button");
      button.textContent = "Open example in new window";
      document.body.append(button);
      button.addEventListener("click", () =>
        window.open(location.href, "MDN", "width=850,height=700,left=150,top=150")
      );
      return true;
    }
    return false;
  }

  function startup() {
    if (showViewLiveResultButton()) return;

    const overlaySelect = document.getElementById("overlay-select");
    const overlay = document.getElementById("overlay");
    startButton = document.getElementById("start-button");

    video = document.getElementById("video");
    uploadCanvas = document.getElementById("upload-canvas");

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error(`An error occurred: ${err}`);
      });

    video.addEventListener(
      "canplay",
      () => {
        if (!streaming) {
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

    overlaySelect.addEventListener("change", () => {
      const selected = overlaySelect.value;
      if (selected === "") {
        overlay.style.display = "none";
        startButton.disabled = true;
      } else {
        overlay.src = `/assets/media/preview/${selected}.png`;
        overlay.style.display = "block";
        startButton.disabled = false;
      }
    });

    startButton.addEventListener("click", async (e) => {
      e.preventDefault();
      if (overlay.style.display === "none") {
        alert("Select overlay.");
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
    context.drawImage(video, 0, 0, width, height);

    uploadCanvas.toBlob(async (blob) => {
      if (!blob) {
        alert("Erro ao gerar a imagem.");
        return;
      }

      const formData = new FormData();
      formData.append("photo", blob, "captured.png");
      formData.append("overlay", overlay);

      try {
        const response = await fetch('/api/?page=upload_photo', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
          await loadGallery();
        } else {
          alert(data.message || 'Erro ao enviar a foto.');
        }
      } catch (error) {
        console.error('Erro ao enviar a foto:', error);
        alert('Erro ao enviar a foto. Tente novamente mais tarde.');
      }
    }, 'image/png');
  }

  async function loadGallery() {
    try {
      const response = await fetch('/api/?page=get_gallery', {
        credentials: 'include'
      });

      const data = await response.json();
      const gallery = document.getElementById("gallery");
      gallery.innerHTML = "";

      console.log('Resposta do servidor:', data);
      console.log('data:', data.photos);

      data.photos.forEach((photo) => {
        const card = document.createElement("div");
        card.className = "card shadow-sm p-2";
        const fullPath = `/api/${photo.image_path}`;

        card.innerHTML = `
          <img src="${fullPath}" class="card-img-top mb-2" alt="User photo" />
          <button class="btn btn-sm btn-danger">Delete</button>
        `;

        const deleteButton = card.querySelector("button");
        deleteButton.addEventListener("click", async () => {
          if (!confirm("Are you sure you want to delete this photo?")) return;

          const res = await fetch(`/api/?page=delete_photo&filename=${encodeURIComponent(photo.filename)}`, {
            method: "DELETE",
            credentials: "include"
          });

          const result = await res.json();

          if (result.status === "success") {
            await loadGallery();
          } else {
            alert(result.message || "Failed to delete photo.");
          }
        });

        gallery.appendChild(card);
      });
    } catch (error) {
      console.error("Erro ao carregar a galeria:", error);
    }
  }

  window.addEventListener("load", startup, false);
  startup();
  loadGallery();
}
