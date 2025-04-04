// import "emoji-picker-element";

document.addEventListener("DOMContentLoaded", () => {
  const textarea = document.getElementById("textarea-body");
  const emojiPicker = document.getElementById("emoji-picker");
  if (!emojiPicker || !textarea) {
    return; // Arrête le script si les éléments ne sont pas trouvés
  }

  emojiPicker.addEventListener("emoji-click", (event) => {
    const emoji = event.detail.unicode;

    // Obtenir la position du curseur
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;

    // Insérer l'emoji à la position du curseur
    textarea.value =
      textarea.value.substring(0, startPos) +
      emoji +
      textarea.value.substring(endPos);

    // Mettre à jour la position du curseur après l'insertion
    textarea.selectionStart = textarea.selectionEnd = startPos + emoji.length;

    // Focus sur la textarea pour éviter la perte de focus après l'insertion
    textarea.focus();
  });
});
