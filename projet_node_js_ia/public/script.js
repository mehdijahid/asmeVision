// document.getElementById("uploadBtn").addEventListener("click", async () => {

//   const fileInput = document.getElementById("fileInput");
//   const result = document.getElementById("result");
//   if (!fileInput.files.length) {
//     alert("Choisis une image !");
//     return;
//   }
//   const formData = new FormData();
//   formData.append("image", fileInput.files[0]);
//   result.textContent = "Analyse en cours...";
//   const res = await fetch("/analyze", {method: "POST",body: formData});
//   const data = await res.json();
//   result.textContent = data.description || "Erreur lors de l'analyse.";
// });
