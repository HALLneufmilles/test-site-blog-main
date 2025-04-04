// document.addEventListener("DOMContentLoaded", () => {
//   const bannerImage = document.querySelector("#banner-upload");
//   const bannerDiv = document.querySelector("#banner-edit"); // Sélection de la div banner

//   const cardImage = document.querySelector("#card-upload");
//   const cardDiv = document.querySelector("#card-edit");
//   console.log(cardDiv);

//   let bannerPath;
//   // Déclenche l'envoie de l'image dans le server et Affiche l'image dans la vue :

//   bannerImage.addEventListener("change", () => {
//     uploadImage(bannerImage, "img-banner");
//   });

//   cardImage.addEventListener("change", () => {
//     uploadImage(cardImage, "img-card");
//   });

//   const uploadImage = (uploadFile, uploadDiv) => {
//     const [file] = uploadFile.files;
//     console.log("file :", file);
//     if (file && file.type.includes("image")) {
//       // FormData pour l'upload de l'image
//       const formdata = new FormData();
//       formdata.append("image", file);

//       // Effectuer la requête fetch vers `/upload` pour sauvegarder l'image
//       fetch("/upload", {
//         method: "POST",
//         body: formdata
//       })
//         .then((res) => res.json())
//         .then((data) => {
//           console.log("data :", data);

//           if (uploadDiv == "img-banner") {
//             bannerPath = `${location.origin}/${data}`;
//             console.log("location.origin : ", location.origin);

//             bannerDiv.style.backgroundImage = `url("${bannerPath}")`;
//             // Mettre à jour le champ caché pour envoyer le chemin de l'image à la base de données lors de la soumission du formulaire
//             // document.querySelector("#banner-image-path").value = data;
//           } else {
//             bannerPath = `${location.origin}/${data}`;
//             cardDiv.style.backgroundImage = `url("${bannerPath}")`;
//           }
//         })
//         .catch((error) => {
//           console.error(
//             "Erreur lors du chargement de l'image dans la vue:",
//             error
//           );
//         });
//     } else {
//       alert("Veuillez sélectionner un fichier image.");
//     }
//   };
// });

/* document.addEventListener("DOMContentLoaded", () => {
  const bannerImage = document.querySelector("#banner-upload");
  const bannerDiv = document.querySelector("#banner-edit"); // Sélection de la div banner

  // Déclenche l'envoi de l'image et affiche l'image dans la vue :

  if (bannerImage) {
    bannerImage.addEventListener("change", () => {
      displayImage(bannerImage, bannerDiv);
    });
  }

  const displayImage = (uploadFile, uploadDiv) => {
    const [file] = uploadFile.files;
    if (file && file.type.includes("image")) {
      // création d'une URL temporaire générée par le navigateur
      const objectURL = URL.createObjectURL(file);
      console.log("objectURL: ", objectURL);

      uploadDiv.style.backgroundImage = `url("${objectURL}")`;
    }
  };
}); */

// document.addEventListener("DOMContentLoaded", () => {
//   const bannerDiv = document.querySelector("#banner-edit");
//   const bannerUpload = document.querySelector("#banner-upload");
//   const previewButton = document.querySelector(".btn-preview");
//   const savedImage = sessionStorage.getItem("tempBannerImage");
//   console.log("savedImage :", savedImage);

//   // Restaurer l'image temporaire au retour de preview-post.ejs
//   if (bannerDiv && savedImage) {
//     console.log("savedImage in if :", savedImage);

//     bannerDiv.style.backgroundImage = `url("${savedImage}")`;
//   }

//   // Mettre à jour l'image lorsqu'un fichier est sélectionné
//   if (bannerUpload) {
//     bannerUpload.addEventListener("change", () => {
//       if (savedImage) {

//       } else {
//         const [file] = bannerUpload.files;
//         if (file && file.type.includes("image")) {
//           const objectURL = URL.createObjectURL(file);
//           bannerDiv.style.backgroundImage = `url("${objectURL}")`;

//           // Mettre à jour immédiatement dans sessionStorage
//           sessionStorage.setItem("tempBannerImage", objectURL);
//         }
//       }
//     });
//   }
// });
/* console.log("editor.js loaded");
document.addEventListener("DOMContentLoaded", () => {
  const bannerDiv = document.querySelector("#banner-edit");
  const bannerUpload = document.querySelector("#banner-upload");
  const savedImage = sessionStorage.getItem("tempBannerImage");
  console.log("DOM fully loaded and parsed");
  console.log("savedImage :", savedImage);

  // Restaurer l'image temporaire au retour de preview-post.ejs
  if (bannerDiv && savedImage) {
    console.log("savedImage in if :", savedImage);
    bannerDiv.style.backgroundImage = `url("${savedImage}")`;
    return;
  }

  // Mettre à jour l'image lorsqu'un fichier est sélectionné
  if (bannerUpload) {
    bannerUpload.addEventListener("change", () => {
      const [file] = bannerUpload.files;
      if (file && file.type.includes("image")) {
        // Supprimer l'ancien tempBannerImage si existant
        const previousImage = sessionStorage.getItem("tempBannerImage");
        if (previousImage) {
          console.log("Supprimer previousImage :", previousImage);
          URL.revokeObjectURL(previousImage); // Libérer l'URL temporaire
          sessionStorage.removeItem("tempBannerImage"); // Supprimer de sessionStorage
        }

        // Créer une nouvelle URL temporaire et mettre à jour sessionStorage
        const objectURL = URL.createObjectURL(file);
        console.log("Nouvelle image sauvegardée :", objectURL);
        sessionStorage.setItem("tempBannerImage", objectURL);

        // Mettre à jour l'image de la bannière
        bannerDiv.style.backgroundImage = `url("${objectURL}")`;
      }
    });
  }
}); */

/* document.addEventListener("DOMContentLoaded", () => {
  const bannerDiv = document.querySelector("#banner-edit");
  const bannerUpload = document.querySelector("#banner-upload");
  const savedImage = sessionStorage.getItem("tempBannerImage");
  console.log("savedImage :", savedImage);

  // Restaurer l'image temporaire au retour de preview-post.ejs
  if (bannerDiv && savedImage) {
    console.log("Restoring image from Base64:", savedImage);
    bannerDiv.style.backgroundImage = `url("${savedImage}")`;
  }

  // Mettre à jour l'image lorsqu'un fichier est sélectionné
  if (bannerUpload) {
    bannerUpload.addEventListener("change", () => {
      const [file] = bannerUpload.files;
      if (file && file.type.includes("image")) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const base64Image = e.target.result;

          // Stocker l'image en Base64 dans sessionStorage
          sessionStorage.setItem("tempBannerImage", base64Image);
          console.log("Nouvelle image sauvegardée en Base64 :", base64Image);

          // Mettre à jour l'image de la bannière
          bannerDiv.style.backgroundImage = `url("${base64Image}")`;
        };
        reader.readAsDataURL(file); // Convertir le fichier en Base64
      }
    });
  }
}); */

/* document.addEventListener("DOMContentLoaded", () => {
  const bannerDiv = document.querySelector("#banner-edit");
  const bannerUpload = document.querySelector("#banner-upload");
  const savedImage = sessionStorage.getItem("tempBannerImage");
  console.log("savedImage :", savedImage);

  // Restaurer l'image temporaire au retour de preview-post.ejs
  if (bannerDiv && savedImage) {
    console.log("Restoring saved image:", savedImage);
    bannerDiv.style.backgroundImage = `url("${savedImage}")`;

    // Injecter l'image temporaire dans l'input file
    fetch(savedImage)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "tempImage.jpg", { type: blob.type });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        bannerUpload.files = dataTransfer.files;
        console.log("Temp image re-injected into file input");
      })
      .catch((err) => console.error("Error reinjecting temp image:", err));
  }

  // Mettre à jour l'image lorsqu'un fichier est sélectionné
  if (bannerUpload) {
    bannerUpload.addEventListener("change", () => {
      const [file] = bannerUpload.files;
      if (file && file.type.includes("image")) {
        // Supprimer l'ancien tempBannerImage si existant
        const previousImage = sessionStorage.getItem("tempBannerImage");
        if (previousImage) {
          console.log("Supprimer previousImage :", previousImage);
          URL.revokeObjectURL(previousImage); // Libérer l'URL temporaire
          sessionStorage.removeItem("tempBannerImage"); // Supprimer de sessionStorage
        }

        // Créer une nouvelle URL temporaire et mettre à jour sessionStorage
        const objectURL = URL.createObjectURL(file);
        console.log("Nouvelle image sauvegardée :", objectURL);
        sessionStorage.setItem("tempBannerImage", objectURL);

        // Mettre à jour l'image de la bannière
        bannerDiv.style.backgroundImage = `url("${objectURL}")`;
      }
    });
  }
}); */

/* document.addEventListener("DOMContentLoaded", () => {
  const bannerDiv = document.querySelector("#banner-edit");
  const bannerUpload = document.querySelector("#banner-upload");
  const savedImage = sessionStorage.getItem("tempBannerImage");
  console.log("savedImage :", savedImage);

  // Restaurer l'image temporaire au retour de preview-post.ejs
  if (bannerDiv && savedImage) {
    console.log("Restoring saved image in Base64:", savedImage);
    bannerDiv.style.backgroundImage = `url("${savedImage}")`;
  }

  // Mettre à jour l'image lorsqu'un fichier est sélectionné
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
            console.log("Supprimer previousImage :", previousImage);
            sessionStorage.removeItem("tempBannerImage");
          }

          // Stocker l'image en Base64 dans sessionStorage
          sessionStorage.setItem("tempBannerImage", base64Image);
          console.log("Nouvelle image sauvegardée en Base64 :", base64Image);

          // Mettre à jour l'image de la bannière
          bannerDiv.style.backgroundImage = `url("${base64Image}")`;
        };
        reader.readAsDataURL(file); // Convertir le fichier en Base64
      }
    });
  }
  window.addEventListener("beforeunload", () => {
    const tempImage = sessionStorage.getItem("tempBannerImage");
    if (tempImage) {
      URL.revokeObjectURL(tempImage); // Révoquer l'URL blob
      console.log("Temp banner image revoked on page unload:", tempImage);
    }
  });
}); */

document.addEventListener("DOMContentLoaded", () => {
  const bannerDiv = document.querySelector("#banner-edit");
  const bannerUpload = document.querySelector("#banner-upload");
  const savedImage = sessionStorage.getItem("tempBannerImage");
  console.log("Current tempBannerImage in sessionStorage:", savedImage);
  const currentUrl = window.location.pathname;
  console.log("currentUrl:", currentUrl);

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

  // Nettoyage au rafraîchissement de 'add-post.ejs'
  // if (currentUrl.includes("add-post") && savedImage) {
  //   console.log(
  //     "Cleaning up sessionStorage and banner image on page refresh..."
  //   );
  //   cleanupBanner();
  // }

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
