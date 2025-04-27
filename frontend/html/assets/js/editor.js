let csrfToken = null;
let editImageId = null;
let mode = 'camera'; // 'camera' or 'upload'
let width = 320;
let height = 0;
let streaming = false;
let selectedFile = null;
let video = null;
let uploadCanvas = null;
let overlayCanvas = null;
let startButton = null;
let stream = null;

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

function updateOverlayPreview(selectedOverlays) {
    if (!overlayCanvas) {
        console.error('overlayCanvas not initialized');
        return;
    }
    const ctx = overlayCanvas.getContext("2d");
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    
    if (selectedOverlays.length === 0) {
        overlayCanvas.style.display = "none";
        return;
    }

    overlayCanvas.width = width;
    overlayCanvas.height = height;
    overlayCanvas.style.display = "block";

    let loadedImages = 0;
    selectedOverlays.forEach(overlay => {
        const img = new Image();
        img.src = `/assets/media/preview/${overlay.name}.${overlay.type}`;
        img.onload = () => {
            ctx.drawImage(img, 0, 0, width, height);
            loadedImages++;
            if (loadedImages === selectedOverlays.length) {
                overlayCanvas.style.display = "block";
            }
        };
        img.onerror = () => {
            console.error(`Failed to load overlay: ${overlay.name}.${overlay.type}`);
        };
    });
}

function updateSelectedOverlays() {
    const items = document.querySelectorAll('.overlay-item');
    const selectedOverlays = Array.from(items)
        .filter(item => item.classList.contains('selected'))
        .map(item => ({ name: item.dataset.overlay, type: item.dataset.type }));
    
    updateOverlayPreview(selectedOverlays);
    if (startButton) {
        startButton.disabled = selectedOverlays.length === 0 || (mode === 'upload' && !selectedFile && !editImageId);
    }
}

function startEditMode(photo) {
    if (!startButton || !video || !uploadCanvas || !overlayCanvas) {
        console.error('DOM elements not initialized');
        const flash = document.getElementById('flashMessage');
        flash.textContent = 'Erro: Interface não inicializada.';
        flash.style.color = 'red';
        return;
    }

    editImageId = photo.id;
    mode = 'upload';
    const uploadModeButton = document.getElementById("upload-mode");
    const cameraModeButton = document.getElementById("camera-mode");
    uploadModeButton.classList.add('active');
    cameraModeButton.classList.remove('active');
    video.style.display = 'none';
    startButton.textContent = 'Save Edited Photo';
    startButton.disabled = true;

    // Carregar imagem original via endpoint
    const img = new Image();
    img.src = `/api/?page=get_original_image&image_id=${photo.id}`;
    img.onload = () => {
        height = img.height / (img.width / width);
        uploadCanvas.setAttribute("width", width);
        uploadCanvas.setAttribute("height", height);
        overlayCanvas.setAttribute("width", width);
        overlayCanvas.setAttribute("height", height);
        const context = uploadCanvas.getContext("2d");
        context.drawImage(img, 0, 0, width, height);

        // Pre-selecionar overlays
        const overlays = photo.overlays ? JSON.parse(photo.overlays) : [];
        const items = document.querySelectorAll('.overlay-item');
        items.forEach(item => {
            item.classList.remove('selected');
            if (overlays.includes(item.dataset.overlay)) {
                item.classList.add('selected');
            }
        });
        updateSelectedOverlays();
    };
    img.onerror = () => {
        console.error(`Failed to load image for image_id: ${photo.id}`);
        const flash = document.getElementById('flashMessage');
        flash.textContent = 'Erro ao carregar imagem original.';
        flash.style.color = 'red';
    };
}

export async function init() {
    function getOverlays() {
        return [
            { name: '42-piscine', type: 'png' },
            { name: 'shadow', type: 'png' },
            { name: 'crt', type: 'png' },
        ];
    }

    await fetchCsrfToken();

    function startup() {
        startButton = document.getElementById("start-button");
        const fileInput = document.getElementById("file-input");
        const cameraModeButton = document.getElementById("camera-mode");
        const uploadModeButton = document.getElementById("upload-mode");
        const overlayGrid = document.querySelector(".overlay-grid");

        if (!startButton || !fileInput || !cameraModeButton || !uploadModeButton || !overlayGrid) {
            console.error('Required DOM elements not found');
            const flash = document.getElementById('flashMessage');
            flash.textContent = 'Erro: Elementos da interface não encontrados.';
            flash.style.color = 'red';
            return;
        }

        video = document.getElementById("video");
        uploadCanvas = document.getElementById("upload-canvas");
        overlayCanvas = document.getElementById("overlay-canvas");

        if (!video || !uploadCanvas || !overlayCanvas) {
            console.error('Canvas or video elements not found');
            const flash = document.getElementById('flashMessage');
            flash.textContent = 'Erro: Canvas ou vídeo não encontrados.';
            flash.style.color = 'red';
            return;
        }

        // Preencher o grid de overlays dinamicamente
        const overlayOptions = getOverlays();
        overlayGrid.innerHTML = ''; // Limpar o grid
        overlayOptions.forEach((overlayObj) => {
            const overlayItem = document.createElement("div");
            overlayItem.className = "overlay-item";
            overlayItem.dataset.overlay = overlayObj.name;
            overlayItem.dataset.type = overlayObj.type;
            overlayItem.setAttribute('tabindex', '0'); // Suporte a teclado
            overlayItem.innerHTML = `
                <img src="/assets/media/preview/${overlayObj.name}.${overlayObj.type}" alt="${overlayObj.name}">
            `;
            overlayGrid.appendChild(overlayItem);
        });

        // Adicionar eventos aos overlays
        const items = document.querySelectorAll('.overlay-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                item.classList.toggle('selected');
                updateSelectedOverlays();
            });
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    item.classList.toggle('selected');
                    updateSelectedOverlays();
                }
            });
        });

        function switchToCameraMode() {
            mode = 'camera';
            editImageId = null; // Resetar modo de edição
            cameraModeButton.classList.add('active');
            uploadModeButton.classList.remove('active');
            video.style.display = 'block';
            selectedFile = null;
            startButton.textContent = 'Take Photo';
            initializeCamera();
            clearCanvas();
        }

        function switchToUploadMode() {
            mode = 'upload';
            editImageId = null; // Resetar modo de edição
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
            const overlayCtx = overlayCanvas.getContext("2d");
            overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
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
                    overlayCanvas.setAttribute("width", width);
                    overlayCanvas.setAttribute("height", height);
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
                        overlayCanvas.setAttribute("width", width);
                        overlayCanvas.setAttribute("height", height);
                        const context = uploadCanvas.getContext("2d");
                        context.drawImage(img, 0, 0, width, height);
                        startButton.disabled = document.querySelectorAll('.overlay-item.selected').length === 0;
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(selectedFile);
            }
        });

        startButton.addEventListener("click", async (e) => {
            e.preventDefault();
            const selectedOverlays = Array.from(document.querySelectorAll('.overlay-item.selected'))
                .map(item => ({ name: item.dataset.overlay, type: item.dataset.type }));
            
            if (selectedOverlays.length === 0) {
                const flash = document.getElementById('flashMessage');
                flash.textContent = 'Select at least one overlay first.';
                flash.style.color = 'red';
                return;
            }
            await takeAndUploadPhoto(selectedOverlays);
        });

        // Inicializar o preview com nenhum overlay
        updateOverlayPreview([]);
    }

    async function takeAndUploadPhoto(selectedOverlays) {
        const context = uploadCanvas.getContext("2d");

        if (!width || !height) return;

        uploadCanvas.width = width;
        uploadCanvas.height = height;

        if (mode === 'camera') {
            context.drawImage(video, 0, 0, width, height);
        } else if (mode === 'upload' && (selectedFile || editImageId)) {
            const img = new Image();
            img.src = selectedFile ? URL.createObjectURL(selectedFile) : uploadCanvas.toDataURL();
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
                    const flash = document.getElementById('flashMessage');
                    flash.textContent = 'Erro: Token de segurança não disponível.';
                    flash.style.color = 'red';
                    return;
                }
            }

            const formData = new FormData();
            formData.append("photo", blob, "captured.png");
            formData.append("overlays", JSON.stringify(selectedOverlays.map(o => o.name)));
            formData.append("csrf_token", csrfToken);
            if (editImageId) {
                formData.append("image_id", editImageId);
            }

            const uploadBtn = document.getElementById("start-button");
            if (uploadBtn) {
                uploadBtn.textContent = "Uploading...";
                uploadBtn.disabled = true;
            }

            try {
                const endpoint = editImageId ? '/api/?page=edit_photo' : '/api/?page=upload_photo';
                const response = await fetch(endpoint, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                const data = await response.json();
                console.log(data);

                if (response.ok && data.status === 'success') {
                    editImageId = null; // Resetar modo de edição
                    startButton.textContent = "Take/Upload Photo";
                    await loadGallery();
                } else {
                    const flash = document.getElementById('flashMessage');
                    flash.textContent = data.message || 'Error saving image. Try again.';
                    flash.style.color = 'red';
                }
            } catch (error) {
                const flash = document.getElementById('flashMessage');
                flash.textContent = 'Error saving image. Try again.';
                flash.style.color = 'red';
            }
            if (uploadBtn) {
                uploadBtn.textContent = editImageId ? "Save Edited Photo" : "Take/Upload Photo";
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
            if (!data || !data.photos || data.photos.length === 0) {
                return;
            }
            console.log(data);

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
                        <button id="edit-${photo.id}" class="btn btn-sm btn-primary mt-2">Edit</button>
                        <button id="delete-${filename}" class="btn btn-sm btn-danger mt-2">Delete</button>
                    </div>
                `;

                gallery.appendChild(card);

                const editButton = card.querySelector(".btn-primary");
                editButton.addEventListener("click", async (e) => {
                    e.preventDefault();
                    startEditMode(photo);
                });

                const deleteButton = card.querySelector(".btn-danger");
                deleteButton.addEventListener("click", async (e) => {
                    e.preventDefault();
                    if (!csrfToken) {
                        await fetchCsrfToken();
                        if (!csrfToken) {
                            const flash = document.getElementById('flashMessage');
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


        startup();
        loadGallery();

}