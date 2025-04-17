export function init() {
    console.log('Editor init'); 
    const width = 320; // We will scale the photo width to this
    let height = 0; // This will be computed based on the input stream
  
    // |streaming| indicates whether or not we're currently streaming
    // video from the camera. Obviously, we start at false.
    let streaming = false;
  
    // The various HTML elements we need to configure or control. These
    // will be set by the startup() function.
    let video = null;
    let canvas = null;
    let photo = null;
    let startButton = null;

    let originalPhoto = null;


  
    function showViewLiveResultButton() {
      if (window.self !== window.top) {
        // Ensure that if our document is in a frame, we get the user
        // to first open it in its own tab or window. Otherwise, it
        // won't be able to request permission for camera access.
        document.querySelector(".content-area").remove();
        const button = document.createElement("button");
        button.textContent = "Open example in new window";
        document.body.append(button);
        button.addEventListener("click", () =>
          window.open(
            location.href,
            "MDN",
            "width=850,height=700,left=150,top=150",
          ),
        );
        return true;
      }
      return false;
    }
  
    function startup() {
      if (showViewLiveResultButton()) {
        return;
      }

        let overlay = document.getElementById("overlay");
        const overlaySelect = document.getElementById("overlay-select");

        overlaySelect.addEventListener("change", () => {
            const selected = overlaySelect.value;
            if (selected === "") {
              overlay.style.display = "none";
            } else {
              overlay.src = `/assets/media/preview/${selected}.png`;
              overlay.style.display = "block";
            }
          });

        overlay.setAttribute("width", width);
        overlay.setAttribute("height", height);

      video = document.getElementById("video");
      canvas = document.getElementById("canvas");
      photo = document.getElementById("photo");
      startButton = document.getElementById("start-button");
  
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
        (ev) => {
          if (!streaming) {
            height = video.videoHeight / (video.videoWidth / width);
  
            // Firefox currently has a bug where the height can't be read from
            // the video, so we will make assumptions if this happens.
            if (isNaN(height)) {
              height = width / (4 / 3);
            }
  
            video.setAttribute("width", width);
            video.setAttribute("height", height);
            canvas.setAttribute("width", width);
            canvas.setAttribute("height", height);
            streaming = true;
          }
        },
        false,
      );
  
      startButton.addEventListener(
        "click",
        (ev) => {
          takePicture();
          ev.preventDefault();
        },
        false,
      );
  
      clearPhoto();
    }
  
    // Fill the photo with an indication that none has been captured.
    function clearPhoto() {
      const context = canvas.getContext("2d");
      context.fillStyle = "#AAA";
      context.fillRect(0, 0, canvas.width, canvas.height);
  
      const data = canvas.toDataURL("image/png");
      photo.setAttribute("src", data);
    }
  
    // Capture a photo by fetching the current contents of the video
    // and drawing it into a canvas, then converting that to a PNG
    // format data URL. By drawing it on an offscreen canvas and then
    // drawing that to the screen, we can change its size and/or apply
    // other changes before drawing it.
    function takePicture() {
        const context = canvas.getContext("2d");
        const overlay = document.getElementById("overlay"); // garante que temos o overlay aqui
      
        if (width && height) {
          canvas.width = width;
          canvas.height = height;
      
          // 1. desenha o vídeo
          context.drawImage(video, 0, 0, width, height);
            // 2. salva a imagem original
          originalPhoto = canvas.toDataURL("image/png");
      
          // 3. se o overlay estiver visível, desenha por cima
          if (overlay.style.display !== "none") {
            context.drawImage(overlay, 0, 0, width, height);
          }
      
          // 4. salva no <img>
          const data = canvas.toDataURL("image/png");
          photo.setAttribute("src", data);
        } else {
          clearPhoto();
        }
      }
    
    //   ajax with simple fetch post without then
    function uploadPhoto() {
        document.getElementById("save-button").addEventListener("click", async (e) => {
          e.preventDefault();
      
          const canvas = document.getElementById("canvas");
      
          // Garante que a imagem existe
          if (!canvas) {
            alert("Capture a foto antes de salvar.");
            return;
          }
      
          const overlay = document.getElementById("overlay-select").value;
      
          // Converte o conteúdo do canvas em um BLOB (arquivo real)
          canvas.toBlob(async (blob) => {
            if (!blob) {
              alert("Erro ao gerar a imagem.");
              return;
            }
      
            const formData = new FormData();
            formData.append("photo", blob, "captured.png"); // Nome do arquivo enviado
            formData.append("overlay", overlay);
      
            try {
              const response = await fetch('/api/?page=upload_photo', {
                method: 'POST',
                credentials: 'include',
                body: formData
              });
              
              const data = await response.json();
      
              if (response.ok && data.status === 'success') {
                window.location.href = data.redirect;
              } else {
                alert(data.message || 'Erro ao enviar a foto.');
              }
            } catch (error) {
              console.error('Erro ao enviar a foto:', error);
              alert('Erro ao enviar a foto. Tente novamente mais tarde.');
            }
          }, 'image/png'); // <- tipo do arquivo
        });
      }
      
  
    // Set up our event listener to run the startup process
    // once loading is complete.
    window.addEventListener("load", startup, false);

    startup();
    uploadPhoto();
}
// const routeModules = {