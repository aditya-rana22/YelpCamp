function previewMultiple(event) {
  const files = event.target.files;
  const previewContainer = document.getElementById("formFile");
  previewContainer.innerHTML = "";
  var number = images.files.length;
  for (let i = 0; i < files.length; i++) {
    const url = URL.createObjectURL(files[i]);
    const img = document.createElement("img");
    img.src = url;
    img.style.maxWidth = "150px";
    img.style.margin = "5px";
    img.classList.add("img-thumbnail");
    previewContainer.appendChild(img);
  }
}
