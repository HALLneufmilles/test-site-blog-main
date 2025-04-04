import mongoose from "mongoose";
import createDomPurify from "dompurify";
import { JSDOM } from "jsdom";
import { renderMarkdown } from "../helpers/markdownRenderer.js"; // Importer le fichier markdownRenderer.js

// Configuration de dompurify
const dompurify = createDomPurify(new JSDOM().window);
// Config de dompurify pour autoriser les vidéos avec iframe'.
dompurify.setConfig({
  ADD_TAGS: ["iframe"],
  ADD_ATTR: [
    "allow",
    "allowfullscreen",
    "frameborder",
    "src", // Autorise l'attribut src pour les iframes
    "scrolling"
  ]
});

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  bannerImages: {
    ImgBase: { type: String, required: true },
    ImgConvert: { type: String, required: true },
    smallImgBase: { type: String, required: true },
    smallImgConvert: { type: String, required: true }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  sanitizedHtml: {
    type: String,
    required: true
  }
});

// Middleware Mongoose avant validation pour transformer le Markdown en HTML sécurisé
PostSchema.pre("validate", function (next) {
  if (this.body) {
    // Utilisation de renderMarkdown pour traiter le Markdown avec toutes les extensions
    const html = renderMarkdown(this.body);
    // Nettoyage du HTML avec dompurify
    this.sanitizedHtml = dompurify.sanitize(html);
  }

  next();
});

// Exporter le modèle en utilisant la base de données spécifique
const db = mongoose.connection.useDb("MVDW-Blog2");
export default db.model("Post", PostSchema);
