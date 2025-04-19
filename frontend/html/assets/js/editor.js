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
        if (selected === "totoro") {
          overlay.src = `/assets/media/preview/${selected}.gif`;
          overlay.style.display = "block";
          startButton.disabled = false;
        } else {
          overlay.src = `/assets/media/preview/${selected}.png`;
          overlay.style.display = "block";
          startButton.disabled = false;
        }
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
  
      data.photos.forEach((photo) => {
        const card = document.createElement("div");
        card.className = "card shadow-sm p-2";
        const fullPath = `/api/${photo.image_path}`;
        const filename = photo.image_path.split("/").pop();
  
        card.innerHTML = `
          <img src="${fullPath}" class="card-img-top mb-2" alt="User photo" />
          <button id="${filename}" class="btn btn-sm btn-danger">Delete</button>
        `;
  
        // Adiciona o botão ao DOM
        gallery.appendChild(card);
  
        // Adiciona o event listener ao botão delete recém-criado
        const deleteButton = card.querySelector(".btn-danger");
        deleteButton.addEventListener("click", async (e) => {
          e.preventDefault();
          try {
            const response = await fetch(`/api/?page=delete_photo&image_name=${filename}`, {
              method: 'DELETE',
              credentials: 'include'
            });

            const data = await response.json();
  
            if (response.ok && data.status === 'success') {
              await loadGallery(); // recarrega a galeria
            } else {
              alert(data.message || 'Erro ao excluir a foto.');
            }
          } catch (error) {
            console.error('Erro ao excluir a foto:', error);
            alert('Erro ao excluir a foto. Tente novamente mais tarde.');
          }
        });
      });
    } catch (error) {
      console.error("Erro ao carregar a galeria:", error);
    }
  }
  

  window.addEventListener("load", startup, false);
  startup();
  loadGallery();
}
