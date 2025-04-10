document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------
  // BANNIÈRE (déjà existante)
  // ---------------------------
  const bannerDiv = document.querySelector("#banner-edit");
  const bannerUpload = document.querySelector("#banner-upload");
  const savedImage = sessionStorage.getItem("tempBannerImage");
  const currentUrl = window.location.pathname;

  function restoreSavedBanner() {
    if (savedImage && bannerDiv) {
      console.log("Restoring saved banner in Base64:", savedImage);
      bannerDiv.style.backgroundImage = `url("${savedImage}")`;
    }
  }
  restoreSavedBanner();

  if (bannerUpload) {
    bannerUpload.addEventListener("change", () => {
      const [file] = bannerUpload.files;
      if (file && file.type.includes("image")) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const base64Image = e.target.result;
          // Nettoyage
          sessionStorage.removeItem("tempBannerImage");
          // Stocker la nouvelle bannière
          sessionStorage.setItem("tempBannerImage", base64Image);
          // Actualiser le fond
          if (bannerDiv) {
            bannerDiv.style.backgroundImage = `url("${base64Image}")`;
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // ---------------------------
  // ILLUSTRATIONS
  // ---------------------------

  // Sélecteur des wrappers
  const uploadWrappers = [...document.querySelectorAll(".upload-wrapper")];
  const previewDiv = document.querySelector(".product-image");

  // Sélecteurs pour le lien Markdown + bouton
  const linkImageInput = document.getElementById("link-image");
  const copyLinkBtn = document.getElementById("copy-link-btn");

  // Bouton "Copier" pour le lien Markdown
  if (copyLinkBtn && linkImageInput) {
    copyLinkBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(linkImageInput.value).then(() => {
        alert("Lien copié !");
      });
    });
  }

  /**
   * Récupère depuis sessionStorage le tableau d'illustrations
   * ex: [ { uid: "temp-illust-1", url: "...", filename: "monimage.jpg" }, ... ]
   */
  function getStoredIllustrations() {
    return JSON.parse(sessionStorage.getItem("illustrations")) || [];
  }

  /**
   * Sauvegarde (remplace) le tableau d'illustrations dans sessionStorage
   */
  function setStoredIllustrations(illustrations) {
    sessionStorage.setItem("illustrations", JSON.stringify(illustrations));
  }

  /**
   * Met à jour ou ajoute une illustration dans le tableau
   * (si uid existe déjà, on écrase l'ancienne)
   */
  function updateIllustration(uid, url, filename) {
    const stored = getStoredIllustrations();
    // Chercher si on a déjà un objet avec le même uid
    const existing = stored.find((obj) => obj.uid === uid);
    if (existing) {
      existing.url = url;
      existing.filename = filename;
    } else {
      stored.push({ uid, url, filename });
    }
    setStoredIllustrations(stored);
  }

  /**
   * Restaure l'affichage des images à partir du sessionStorage
   *  - Applique background-image sur chaque label
   *  - (Facultatif) met à jour .product-image pour le dernier
   *  - (Facultatif) remplit le #link-image
   */
  function restoreIllustrations() {
    const stored = getStoredIllustrations();
    stored.forEach((item) => {
      const { uid, url, filename } = item;
      // Retrouver le wrapper correspondant
      const wrapper = document.querySelector(
        `.upload-wrapper[data-tempid="${uid}"]`
      );
      if (!wrapper) return; // peut avoir été supprimé

      const label = wrapper.querySelector(".upload-image");
      const deleteBtn = wrapper.querySelector(".delete-image");
      if (label) {
        label.style.backgroundImage = `url("${url}")`;
        // Afficher le bouton "delete"
        if (deleteBtn) {
          deleteBtn.style.display = "block";
          deleteBtn.hidden = false;
        }
      }
    });
  }

  // Appeler la fonction pour restaurer à l'ouverture
  restoreIllustrations();

  // Pour chaque wrapper, on gère le "change" + "click" du label
  uploadWrappers.forEach((wrapper) => {
    // Récupérer l'input et le label
    const input = wrapper.querySelector(".fileupload");
    const label = wrapper.querySelector(".upload-image");
    const deleteBtn = wrapper.querySelector(".delete-image");

    // Lire l'uid (data-tempid)
    const tempId = wrapper.dataset.tempid;

    // 1) Événement "change" (upload)
    if (input) {
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
              const markdownLink = `![${file.name}](${fullUrl})`;

              // 1️⃣ Mettre à jour l'affichage du label
              if (label) {
                label.style.backgroundImage = `url("${fullUrl}")`;
              }
              // Bouton delete
              if (deleteBtn) {
                deleteBtn.style.display = "block";
                deleteBtn.hidden = false;
              }

              // 2️⃣ Mettre à jour le .product-image
              if (previewDiv) {
                previewDiv.style.backgroundImage = `url("${fullUrl}")`;
              }
              // 3️⃣ Mettre le lien Markdown dans #link-image
              if (linkImageInput) {
                linkImageInput.value = markdownLink;
              }

              // 4️⃣ Mettre à jour sessionStorage
              updateIllustration(tempId, fullUrl, file.name);
            } else {
              alert("Erreur lors de l'upload.");
            }
          })
          .catch((error) => {
            console.error("Erreur d'upload :", error);
          });
      });
    }

    // 2) Événement "click" sur le label (pour ré-activer l'image)
    if (label) {
      label.addEventListener("click", function (e) {
        // Si pas d'image en background, on laisse le comportement natif (ouvrir input)
        if (
          !label.style.backgroundImage ||
          label.style.backgroundImage === "none"
        ) {
          return;
        }

        // Vérifier si ce label est déjà "actif" => si tu gères une classe "active"
        if (this.classList.contains("active")) {
          e.preventDefault();
          return;
        }

        // Récupérer les infos depuis sessionStorage
        const stored = getStoredIllustrations();
        const item = stored.find((obj) => obj.uid === tempId);
        if (!item) {
          return; // pas de data trouvée
        }

        const { url, filename } = item;
        const markdownLink = `![${filename}](${url})`;

        // Appliquer dans .product-image
        if (previewDiv) {
          previewDiv.style.backgroundImage = `url("${url}")`;
        }

        // Mettre à jour le champ #link-image
        if (linkImageInput) {
          linkImageInput.value = markdownLink;
        }

        // Gérer la classe "active" sur les autres labels
        document
          .querySelectorAll(".upload-image.active")
          .forEach((lab) => lab.classList.remove("active"));
        this.classList.add("active");

        // Empêcher l'ouverture de l'explorateur (puisqu'on veut juste réactiver l'aperçu)
        e.preventDefault();
      });
    }

    // 3) Éventuellement, un bouton "delete" pour retirer l'image
    if (deleteBtn) {
      deleteBtn.addEventListener("click", function (e) {
        e.preventDefault();
        // Remettre le label sans image
        label.style.backgroundImage = "none";
        this.hidden = true;
        // Retirer l'entrée de sessionStorage
        let stored = getStoredIllustrations();
        stored = stored.filter((obj) => obj.uid !== tempId);
        setStoredIllustrations(stored);
        // Retirer l'image du .product-image si c'était celle active
        if (label.classList.contains("active") && previewDiv) {
          previewDiv.style.backgroundImage = "none";
          linkImageInput.value = "";
        }
        label.classList.remove("active");
      });
    }
  });

  // ---------------------------
  // LOGIQUE DE FORM / SUBMIT
  // ---------------------------
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", (event) => {
      const previewButton = document.querySelector(".btn-preview");
      if (event.submitter === previewButton) {
        console.log(
          "Preview button clicked, skipping sessionStorage cleanup..."
        );
        // on ne supprime pas les data
        return;
      }
      // Sinon, soumission "Add" => on peut nettoyer
      console.log("Form submitted, clearing sessionStorage...");
      sessionStorage.removeItem("tempBannerImage");
      sessionStorage.removeItem("illustrations");
    });
  }

  // ---------------------------
  // Nettoyage banner si on retourne au dashboard
  // ---------------------------
  function cleanupBanner() {
    if (savedImage && bannerDiv) {
      sessionStorage.removeItem("tempBannerImage");
      bannerDiv.style.backgroundImage = "";
    }
  }
  if (currentUrl.includes("dashboard")) {
    console.log(
      "Cleaning up sessionStorage and banner image on page refresh..."
    );
    cleanupBanner();
  }
});
