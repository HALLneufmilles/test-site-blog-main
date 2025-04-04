document.addEventListener("DOMContentLoaded", function () {
  const allButtons = document.querySelectorAll(".searchBtn");
  const searchBar = document.querySelector(".searchBar");
  const searchInput = document.getElementById("searchInput");
  const searchClose = document.getElementById("searchClose");

  for (var i = 0; i < allButtons.length; i++) {
    allButtons[i].addEventListener("click", function () {
      searchBar.style.visibility = "visible";
      searchBar.classList.add("open");
      this.setAttribute("aria-expanded", "true");
      searchInput.focus();
    });
  }

  searchClose.addEventListener("click", function () {
    searchBar.style.visibility = "hidden";
    searchBar.classList.remove("open");
    this.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const readMoreBtns = document.querySelectorAll(".read-more");
  const readLessBtns = document.querySelectorAll(".read-less");

  readMoreBtns.forEach((readMoreBtn) => {
    readMoreBtn.addEventListener("click", function (event) {
      event.preventDefault();
      const authorContainer = this.closest(".intro");
      const collapsed = authorContainer.querySelector(".collapsed");
      const fullText = authorContainer.querySelector(".full-text");

      collapsed.style.display = "none"; // Masquer le texte tronqué
      fullText.style.display = "inline"; // Afficher le texte complet

      this.style.display = "none";
      authorContainer.querySelector(".read-less").style.display =
        "inline-block";
    });
  });

  readLessBtns.forEach((readLessBtn) => {
    readLessBtn.addEventListener("click", function (event) {
      event.preventDefault();
      const authorContainer = this.closest(".intro");
      const collapsed = authorContainer.querySelector(".collapsed");
      const fullText = authorContainer.querySelector(".full-text");

      fullText.style.display = "none"; // Masquer le texte complet
      collapsed.style.display = "inline"; // Réafficher le texte tronqué

      this.style.display = "none";
      authorContainer.querySelector(".read-more").style.display =
        "inline-block";
    });
  });
});
