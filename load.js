function loadHTML(id, file) {
  fetch(file)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
    });
}

document.addEventListener("DOMContentLoaded", function() {
  loadHTML("header", "/other/header.html");
  loadHTML("footer", "/other/footer.html");
});