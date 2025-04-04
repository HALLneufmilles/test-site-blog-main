document.addEventListener("DOMContentLoaded", function () {
  // Vérifie si l'image temporaire existe dans sessionStorage
  const tempBannerImage = sessionStorage.getItem("tempBannerImage");
  const imgBanner = document.getElementById("img-banner");

  if (tempBannerImage) {
    // Met à jour img#img-banner dans preview-post.ejs
    if (imgBanner) {
      imgBanner.src = tempBannerImage;
      console.log("imgBanner.src :", imgBanner.src);
    }

    // Met à jour img#img-card dans preview-post.ejs
    const imgCard = document.getElementById("img-card");
    if (imgCard) {
      imgCard.src = tempBannerImage;
      console.log("imgCard.src :", imgCard.src);
    }
  }
});

/* document.addEventListener("DOMContentLoaded", function () {
  // Vérifie si une image temporaire est disponible
  const tempBannerImage = sessionStorage.getItem("tempBannerImage");

  const defaultBannerImage = "<%= data.bannerImage %>";

  // Met à jour les images dynamiquement
  const imgBanner = document.getElementById("img-banner");
  const imgCard = document.getElementById("img-card");

  if (tempBannerImage) {
    console.log("Using tempBannerImage:", tempBannerImage);
    if (imgBanner) imgBanner.src = tempBannerImage;
    if (imgCard) imgCard.src = tempBannerImage;
  } else {
    console.log("Using default image from server:", "<%= data.bannerImage %>");
    if (imgBanner) imgBanner.src = defaultBannerImage;
    if (imgCard) imgCard.src = defaultBannerImage;
  }
}); */
