// import { marked } from "marked";

/* // Créer un renderer personnalisé
const renderer = new marked.Renderer();

// Fonction utilitaire pour extraire les IDs et classes
const parseAttributes = (text) => {
  const match = text.match(/\{([^}]+)\}$/);
  let id = "";
  let classes = "";

  if (match) {
    const attributes = match[1];
    text = text.replace(/\{([^}]+)\}$/, ""); // Supprimer la syntaxe {} du texte

    // Extraire les IDs et classes
    attributes.split(" ").forEach((attr) => {
      if (attr.startsWith("#")) {
        id = attr.slice(1); // Retirer le #
      } else if (attr.startsWith(".")) {
        classes += ` ${attr.slice(1)}`; // Retirer le .
      }
    });
  }

  return { text, id, classes: classes.trim() };
};

// Titres (h1, h2, etc.)
renderer.heading = (text, level) => {
  const { text: cleanText, id, classes } = parseAttributes(text);
  return `<h${level} id="${id}" class="${classes}">${cleanText}</h${level}>`;
};

// Paragraphes
renderer.paragraph = (text) => {
  const { text: cleanText, id, classes } = parseAttributes(text);
  return `<p id="${id}" class="${classes}">${cleanText}</p>`;
};

// Liens
renderer.link = (href, title, text) => {
  const { text: cleanText, id, classes } = parseAttributes(text);
  const target = href.startsWith("http")
    ? ' target="_blank" rel="noopener noreferrer"'
    : "";
  return `<a href="${href}" id="${id}" class="${classes}"${target} title="${title || ""}">${cleanText}</a>`;
};

// Listes (ul / ol)
renderer.list = (body, ordered) => {
  const tag = ordered ? "ol" : "ul";
  return `<${tag}>${body}</${tag}>`;
};

// Élément de liste (li)
renderer.listitem = (text) => {
  const { text: cleanText, id, classes } = parseAttributes(text);
  return `<li id="${id}" class="${classes}">${cleanText}</li>`;
};

// Tableaux
renderer.table = (header, body) => {
  return `<table>
    <thead>${header}</thead>
    <tbody>${body}</tbody>
  </table>`;
}; */

/* // Blocs de code avec coloration syntaxique
renderer.code = (code, language) => {
  const validLanguage = hljs.getLanguage(language) ? language : "plaintext";
  const highlightedCode = hljs.highlight(code, {
    language: validLanguage
  }).value;
  return `<pre><code class="language-${validLanguage}">${highlightedCode}</code></pre>`;
};

// Configurer Marked
marked.setOptions({
  renderer,
  breaks: true, // Gérer les sauts de ligne
  gfm: true // GitHub Flavored Markdown
});

// Fonction pour rendre le Markdown
export const renderMarkdown = (markdown) => {
  return marked(markdown);
};
 */

// Configuration de Highlight.js avec Marked
/* marked.setOptions({
  langPrefix: "language-", // Ajouter "language-" pour les classes CSS
  gfm: true, // GitHub Flavored Markdown
  breaks: true // Sauts de ligne automatiques
});

// Fonction pour rendre le Markdown
export const renderMarkdown = (markdown) => {
  return marked(markdown);
}; */

import MarkdownIt from "markdown-it";
import { full as emoji } from "markdown-it-emoji";
import markdownItFootnote from "markdown-it-footnote";
import markdownItAttrs from "markdown-it-attrs"; // Import du plugin markdown-it-attrs
import markdownItContainer from "markdown-it-container";

// Initialiser Markdown-it
const md = new MarkdownIt({
  html: true, // Autoriser le HTML brut
  linkify: true, // Convertir les liens en hyperliens
  typographer: true, // Activer les guillemets typographiques
  langPrefix: "language-", // Préfixe pour Highlight.js
  breaks: true // Gérer les sauts de ligne automatiques
});
// Ajout du plugin emoji
md.use(emoji);
// Ajouter le plugin pour les notes de bas de page
md.use(markdownItFootnote);

// Ajouter le plugin pour les classes/ID
md.use(markdownItAttrs);

// Ajouter le conteneur personnalisé pour YouTube
md.use(markdownItContainer, "YouTube", {
  render: (tokens, idx) => {
    const token = tokens[idx];

    if (token.nesting === 1) {
      // Début du conteneur
      const info = token.info.trim();
      // console.log("Contenu brut de info :", info);

      // Extraire l'identifiant en supprimant "YouTube"
      const videoId = info.replace(/^YouTube\s*/, "").trim();
      // console.log("Identifiant de la vidéo :", videoId);

      // Validation de l'identifiant
      if (!/^[a-zA-Z0-9_-]+$/.test(videoId)) {
        // console.log("Identifiant de vidéo invalide :", videoId);
        return `<div class="iframe-yt error">Invalid YouTube Video ID</div>`;
      }

      // Construire l'URL et le balisage iframe
      const videoUrl = `https://www.youtube.com/embed/${videoId}`;
      return `
        <div class="iframe-yt">
          <iframe src="${videoUrl}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      `;
    } else {
      // Fin du conteneur
      return "";
    }
  }
});

export const renderMarkdown = (markdown) => {
  return md.render(markdown);
};
