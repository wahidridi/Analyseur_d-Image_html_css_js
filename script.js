// Références DOM
const fileInput = document.getElementById('file-input');
const imageContainer = document.getElementById('image-container');
const paramsTbody = document.getElementById('params-tbody');

// Fonction pour afficher un message dans la zone image
function showImageMessage(msg) {
  imageContainer.innerHTML = `<span style="color:#999;">${msg}</span>`;
}

// Fonction pour afficher une image HTML dans la zone imageContainer
function displayImageElement(imgElement) {
  imageContainer.innerHTML = "";
  imageContainer.appendChild(imgElement);
}

// Fonction pour nettoyer la zone paramètres
function clearParameters() {
  paramsTbody.innerHTML = '<tr><td colspan="2" style="text-align:center; color:#666;">Aucune image analysée</td></tr>';
}

// Fonction pour mettre à jour le tableau des paramètres
function updateParameters(imgFile, imageElement, imagePixelsData) {
  const fileSizeKo = (imgFile.size / 1024).toFixed(2) + ' Ko';
  const width = imageElement.naturalWidth || imageElement.width;
  const height = imageElement.naturalHeight || imageElement.height;
  const type = imgFile.type || 'Inconnu';
  const rawSizeBytes = width * height * 4; // RGBA 8 bits * 4 composants
  let compressionPercent = 0;
  let dynamicRange = 'N/A';

  if (imagePixelsData) {
    let minLum = 255;
    let maxLum = 0;
    for (let i = 0; i < imagePixelsData.length; i += 4) {
      const r = imagePixelsData[i];
      const g = imagePixelsData[i + 1];
      const b = imagePixelsData[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum < minLum) minLum = lum;
      if (lum > maxLum) maxLum = lum;
    }
    dynamicRange = (maxLum - minLum).toFixed(1);
    compressionPercent = (100 * (1 - (imgFile.size / rawSizeBytes))).toFixed(1);
    if (compressionPercent < 0) compressionPercent = 0;
  }

  paramsTbody.innerHTML = `
    <tr><td>Taille fichier</td><td>${fileSizeKo}</td></tr>
    <tr><td>Format</td><td>${type}</td></tr>
    <tr><td>Résolution</td><td>${width} x ${height} px</td></tr>
    <tr><td>Taille brute pixels</td><td>${(rawSizeBytes / 1024).toFixed(2)} Ko</td></tr>
    <tr><td>Taux de compression approximatif</td><td>${compressionPercent} %</td></tr>
    <tr><td>Plage dynamique (luminosité)</td><td>${dynamicRange} (0-255)</td></tr>
  `;
}

// Fonction pour analyser l’image en extrayant pixels via canvas
function analyzeImage(imageElement, file) {
  const canvas = document.createElement('canvas');
  canvas.width = imageElement.naturalWidth || imageElement.width;
  canvas.height = imageElement.naturalHeight || imageElement.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageElement, 0, 0);

  try {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    updateParameters(file, imageElement, imgData.data);
  } catch (e) {
    updateParameters(file, imageElement, null);
  }
}

// Fonction de chargement et affichage d’image depuis un fichier local
function loadImageFromFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    alert('Veuillez sélectionner un fichier image valide.');
    return;
  }
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      displayImageElement(img);
      analyzeImage(img, file);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Gestion événement sur sélection fichier
fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    loadImageFromFile(e.target.files[0]);
  } else {
    showImageMessage("Pas d'image chargée");
    clearParameters();
  }
});

// Initialisation
showImageMessage("Pas d'image chargée");
clearParameters();
