document.addEventListener("DOMContentLoaded", () => {
  const bannerDiv = document.querySelector("#banner-edit");
  const bannerUpload = document.querySelector("#banner-upload");
  const savedImage = sessionStorage.getItem("tempBannerImage");
  console.log("Current tempBannerImage in sessionStorage:", savedImage);
  const currentUrl = window.location.pathname;
  console.log("currentUrl:", currentUrl);

  const fileInputs = [...document.querySelectorAll(".fileupload")];
  const uploadLabels = [...document.querySelectorAll(".upload-image")];
  const deleteButtons = [...document.querySelectorAll(".delete-image")];
  const previewDiv = document.querySelector(".product-image");

  // Sélecteur du bouton de copie
  const copyLinkBtn = document.getElementById("copy-link-btn");
  // Sélecteur de l'input
  const linkImageInput = document.getElementById("link-image");

  const illustrationImageUrls = [];
  const illustrationImageFilenames = [];

  // Écouteur "click" pour copier
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener("click", () => {
      if (linkImageInput) {
        // On copie la value de l'input
        navigator.clipboard.writeText(linkImageInput.value).then(() => {
          alert("Lien copié !");
        });
      }
    });
  }

  fileInputs.forEach((input, index) => {
    input.addEventListener("change", function () {
      const file = this.files[0];
      if (!file || !file.type.includes("image")) {
        alert("Veuillez sélectionner une image.");
        return;
      }

      const formData = new FormData();
      formData.append("image", file);

      fetch("/blog/upload-illustration", {
        method: "POST",
        body: formData
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const fullUrl = `${window.location.origin}${data.imageUrl}`;

            illustrationImageUrls[index] = fullUrl;
            illustrationImageFilenames[index] = file.name;

            const markdownLink = `![${file.name}](${fullUrl})`;

            if (linkImageInput) {
              linkImageInput.value = markdownLink;
            }

            // 1️⃣ Ajouter le fond d'image dans le label
            uploadLabels[index].style.backgroundImage = `url("${fullUrl}")`;
            deleteButtons[index].style.display = "block";
            deleteButtons[index].hidden = false;

            // 2️⃣ Ajouter la classe active et retirer des autres
            uploadLabels.map((label) => label.classList.remove("active"));
            uploadLabels[index].classList.add("active");

            // 3️⃣ Afficher l'image dans .product-image
            if (previewDiv) {
              previewDiv.style.backgroundImage = `url("${fullUrl}")`;
            }
            // 4️⃣ Sauvegarde sessionStorage
            let savedList =
              JSON.parse(sessionStorage.getItem("tempImages")) || [];
            savedList.push(fullUrl);
            sessionStorage.setItem("tempImages", JSON.stringify(savedList));
          } else {
            alert("Erreur lors de l'upload.");
          }
        })
        .catch((error) => {
          console.error("Erreur d'upload :", error);
        });
    });

    uploadLabels[index].addEventListener("click", function (e) {
      const bgImage = this.style.backgroundImage;
      const fullUrl = illustrationImageUrls[index];
      const fileName = illustrationImageFilenames[index];

      if (!bgImage || bgImage === "none") {
        // S'il n'y a pas d'image, on laisse le comportement natif s'exécuter
        return;
      }

      // Si ce label est déjà actif, empêcher l'ouverture de l’explorateur
      if (this.classList.contains("active")) {
        e.preventDefault(); // 🛑 Empêche l’ouverture
        return;
      }

      const markdownLink = `![${fileName}](${fullUrl})`;
      linkImageInput.value = markdownLink;

      // Sinon : afficher l’image correspondante dans preview
      previewDiv.style.backgroundImage = bgImage;

      // Gérer les classes actives
      uploadLabels.forEach((label) => label.classList.remove("active"));
      this.classList.add("active");

      e.preventDefault(); // On empêche quand même l’ouverture de l’explorateur pour éviter de modifier cette image
    });
  });

  // Fonction pour restaurer une image sauvegardée
  const restoreSavedImage = () => {
    if (savedImage) {
      if (bannerDiv) {
        console.log("Restoring saved image in Base64:", savedImage);
        bannerDiv.style.backgroundImage = `url("${savedImage}")`;
      }
    } else {
      console.log("No image found in sessionStorage to restore.");
    }
  };

  // Appeler la fonction de restauration au chargement
  restoreSavedImage();

  // Écouteur pour la mise à jour de l'image
  if (bannerUpload) {
    bannerUpload.addEventListener("change", () => {
      const [file] = bannerUpload.files;
      if (file && file.type.includes("image")) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const base64Image = e.target.result;

          // Supprimer l'ancien tempBannerImage si existant
          const previousImage = sessionStorage.getItem("tempBannerImage");
          if (previousImage) {
            console.log("Removing previous image:", previousImage);
            sessionStorage.removeItem("tempBannerImage");
          }

          // Stocker l'image en Base64 dans sessionStorage
          sessionStorage.setItem("tempBannerImage", base64Image);
          console.log("New image saved in Base64:", base64Image);

          // Mettre à jour l'image de la bannière
          if (bannerDiv) {
            bannerDiv.style.backgroundImage = `url("${base64Image}")`;
          }
        };
        reader.readAsDataURL(file); // Convertir le fichier en Base64
      }
    });
  }

  // Gestionnaire de soumission pour éviter de nettoyer sessionStorage lors de la prévisualisation
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", (event) => {
      const previewButton = document.querySelector(".btn-preview");
      if (event.submitter === previewButton) {
        console.log(
          "Preview button clicked, skipping sessionStorage cleanup..."
        );
        return; // Ne pas nettoyer `sessionStorage`
      }

      console.log("Form submitted, clearing sessionStorage...");
      sessionStorage.removeItem("tempBannerImage");
    });
  }

  // Fonction pour nettoyer sessionStorage et l'image de la bannière
  const cleanupBanner = () => {
    if (savedImage) {
      // Si une image est sauvegardée dans sessionStorage
      console.log(
        "Cleaning up sessionStorage as we're leaving the edit page..."
      );
      sessionStorage.removeItem("tempBannerImage");

      // Supprimer l'image de la bannière si elle existe
      if (bannerDiv) {
        console.log("Clearing banner image from the DOM.");
        bannerDiv.style.backgroundImage = ""; // Réinitialiser le fond
      }
    }
  };

  if (currentUrl.includes("dashboard")) {
    console.log(
      "Cleaning up sessionStorage and banner image on page refresh..."
    );
    cleanupBanner();
  }
  // Ajouter un écouteur pour 'beforeunload' pour nettoyer avant que l'utilisateur quitte 'add-post.ejs'
  /*   window.addEventListener("beforeunload", () => {
    if (currentUrl.includes("add-post")) {
      console.log("Cleaning up sessionStorage before leaving add-post.ejs...");
      cleanupBanner();
    }
  }); */

  // Ajouter un écouteur pour 'pageshow' afin de gérer les pages restaurées depuis le cache
  /*   window.addEventListener("pageshow", (event) => {
    console.log("event ;", event);

    // Vérifie si la page est restaurée depuis le cache
    console.log("Page restored from cache, cleaning sessionStorage...");
    cleanupBanner();
  });
 */
  // Ajouter un écouteur pour 'popstate' afin de détecter la navigation en arrière
  /*   window.addEventListener("popstate", () => {
    console.log("Navigating with popstate, cleaning sessionStorage...");
    cleanupBanner();
  }); */
});
