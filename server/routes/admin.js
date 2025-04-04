import express from "express";
const router = express.Router();
import Post from "../models/Post.js";
import User from "../models/User.js";
import dotenv from "dotenv";
// Importer la fonction de sociaux.js
import { tweetArticleSummary } from "../helpers/sociaux.js";
dotenv.config();
// bcrypt est une bibliothèque utilisée pour sécuriser les mots de passe en les hachant avant de les stocker dans une base de données.
// Les mots de passe ne doivent jamais être stockés en texte brut dans une base de données, car cela représente un énorme risque de sécurité si la base est compromise.
// bcrypt permet de hachager (transformer) un mot de passe en une chaîne de caractères complexe qui n'est pas réversible, c’est-à-dire qu’on ne peut pas retrouver le mot de passe original depuis le haché sans une attaque par force brute.
// Lorsqu’un utilisateur s’inscrit, le mot de passe est haché avec bcrypt avant d'être enregistré.
// Lorsqu’un utilisateur se connecte, le mot de passe saisi est comparé au mot de passe haché stocké en utilisant bcrypt pour vérifier s'ils correspondent.
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

import fs from "fs/promises";

import { processImage } from "../helpers/imageProcessor.js";
// dompurify pour nettoyer le HTML généréé par marked afin de supprimer tout contenu potentiellement dangereux (comme des balises <script> ou des événements JavaScript).
import createDomPurify from "dompurify";
import { JSDOM } from "jsdom";
// marked transforme le Markdown en HTML
import { marked } from "marked";
import { renderMarkdown } from "../helpers/markdownRenderer.js"; // Importer le renderer
import { deletePostImages } from "../helpers/imageDeleter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dompurify = createDomPurify(new JSDOM().window);
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
// Le layout spécifique pour la fonction render()
const adminLayout = "../views/layouts/admin.ejs";
const jwtSecret = process.env.JWT_SECRET;

/**
 *
 * Check Login
 */
// Middleware de vérification du Token pour autoriser l'accès au tableau de bord.
// // Middleware de vérification du Token pour autoriser l'accès au tableau de bord.
// Un middleware est une fonction qui intercepte une requête HTTP avant qu'elle n'atteigne sa destination finale (la route cible).
// Si un token valide est trouvé, l'utilisateur est autorisé à accéder à la route.
// next : Une fonction à appeler pour passer à l'étape suivante
const authMiddleware = (req, res, next) => {
  // récupération du tocken dans les cookies
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // pour vérifier la validité du token.
    const decoded = jwt.verify(token, jwtSecret);
    // Si le token est valide, le userId contenu dans le token est ajouté à l'objet req (requête) .
    /*  En ajoutant userId à req, nous permettons aux autres routes d'utiliser l'identifiant de l'utilisateur pour récupérer des informations supplémentaires ou pour vérifier ses permissions. */
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

/**
 * GET  Admin - Login page
 **/
// *
// Accéder à la page admin :
router.get("/admin", async (req, res) => {
  try {
    // *'Local' pour la balise <head> du layout spécifique 'admin.ejs'.
    const locals = {
      title: "Admin",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    };
    // render() stipule les données et la vue du dossier "views" à insérer dans l'élément "body" du layout. Sans layout indiqué en second argument, le layout indiqué par défaut dans 'server.js' sera utilisé. Les fichiers à la racine du dossier "views" sont par convention utilisés avec le layout par défaut. c'est la raison pour laquelle il n'est pas nécessaire de stipuler le layout par défaut lorqu'on utilise ces vues.
    // Demade au server d'insérer les données et sa vue 'index.ejs' située dans le dossier "views/admin", dans l'élément "body" du layout. Ici on indique un layout spécifique à utiliser pour cette vue : adminLayout.
    res.render("admin/index", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
  // *FIN Récupération des Posts
});

/**
 * POST  Admin - Check login
 **/
// *
// "Check Login 2" Authentification d'un utilisateur avec JWT .
/* Pour rappel : 
  1- Lorsque l'utilisateur ouvre une page du site, une requête est envoiyée au serve et session() de 'server.js' crée automatiquement une session avec 'saveUninitialized: true,' valable selon la durée définie également dans session() par 'cookie: {maxAge:36000}' .
  2- l'ID de session est stocké côté client et server, mais les données utilisateur sont stockées uniquement côté serveur (apparement pas très bon pour la sécurité. risque de piratage du server.) */

// Ici on part du principe que l'utilisateur s'est déja enregistré et que son mot de passe à été hashé durant l'inscription.
/* Pour rappel Dans une session basée sur un ID de session, le serveur génère un ID unique qui est ensuite stocké dans un cookie côté client. Le serveur stocke également cet ID en interne, ainsi que les données de session associées à l'utilisateur. 

// Ici pour la première visite l'utilisateur, lorsqu'il ouvre la page du site cela envoie une requête au server qui commence par regader si une session est en cours pour cet utilisateur. Si s'est le cas cela veut dire qu'il vient seulement de s'enregistré et donc qu'il n'a pas encore de Token. Pour cela le serveur commence par regarder dans les cookie du navigateur si il y à un ID de session. S'il y à un ID de session et qu'il est toujours valide cela veut dire qu'une session est bien en cours , l'utilisateur sera autorisé à ajouté de nouveaux posts. Sinon, l'utilisateur devra se reconnecter en entrant Login et mot de passe. le serveur intercepte la requêtre du formulaire, récupère mot de passe et username, commence par chercher le username dans la base de données, si ok compare le mot de passe du formulaire avec celui de la base de données, si ok , cette fois plutôt que de créer un ID de session, il va créer un Token qui sera vailde selon la periode de temps défini dans session() de 'server.js et contiendra: 
1- le username qui servira au server pour identifier l'utilisateur lors des prochaines requêtes. Un JWT ne contient jamais de mot de passe ! 
2- les autres informations nom sensibles.
Le mot de passe hashé restera côté serveur. Ainsi en cas de piratage du server, le pirate n'auras pas accès au nom d'utilisateur et au cas où quelqu'un aurait accès au navigateur, le pirate n'aura pas accès au mot de passe.
*/
/* Les JWT (Token) ont 2 avantages :
Rappel : Le token JWT est utilisé principalement pour l'authentification et la vérification de l'identité de l'utilisateur, et non pour stocker toutes les données de l'utilisateur.
      1- Chaque fois qu'un utilisateur se connecte, un nouveau JWT est généré avec une nouvelle date d'expiration. Cela limite la durée de validité d'un token, ce qui réduit le risque en cas de vol de token.
      2- Le token est signé et contient des informations minimales (username + infos non sensibles), permettant au serveur de vérifier l'identité sans requête supplémentaire. Seul le mot de passe reste dans le server et en cas de piratage, l'absence du username empêche le vol d'informations.
      3- Chaque connexion génère un nouveau token avec une nouvelle date d'expiration, limitant la durée de validité.
   Note : Le JWT est encodé en Base64, mais pas chiffré, donc ne jamais y mettre de données sensibles comme des mots de passe. */
router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // création du Tocken
    const token = jwt.sign({ userId: user._id }, jwtSecret);
    // Le token est ensuite envoyé au navigateur sous forme de cookie :
    // Les cookies HTTP-only sont accessibles uniquement par le serveur et non par JavaScript côté client, ce qui permet de réduire le risque d'attaques de type XSS (Cross-Site Scripting)."
    res.cookie("token", token, { httpOnly: true });
    // On redirige vers '/dashboard' mais la route '/dashboard' est protégée par le middleware "authMiddleware" chargé  valider l'authentification par le Token.
    res.redirect("/blog/dashboard");
  } catch (error) {
    console.log(error);
  }
});

/**
 * GET  Admin - Dashboard
 **/
// *
// Donner l'accès au dashbord
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Dashboard",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    };

    const data = await Post.find();
    res.render("admin/dashboard", {
      locals,
      data,
      layout: adminLayout
    });
  } catch (error) {
    console.log(error);
  }
});

/**
 * GET  Admin - Create New Post Page
 **/
// *
// accès a la page "Créer un post"
router.get("/add-post", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    };

    const data = await Post.find();
    res.render("admin/add-post", {
      locals,
      layout: adminLayout
    });
  } catch (error) {
    console.log(error);
  }
});

/**
 * POST  Admin - Create New Post with Image Upload
 **/

router.post("/add-post", authMiddleware, async (req, res) => {
  try {
    if (!req.files || !req.files.bannerImage) {
      return res.status(400).send("L'image est requise pour créer un post");
    }

    const bannerImages = await processImage(req.files.bannerImage);

    const newPost = new Post({
      title: req.body.title,
      description: req.body.description,
      body: req.body.body,
      bannerImages
    });

    await newPost.save();
    console.log("newPost.save :", newPost);

    const articleData = {
      title: newPost.title,
      description: newPost.description,
      url: `https://mavitrineduweb.fr/blog/post/${newPost._id}`
    };
    console.log("articleData :", articleData);

    // Publier sur Twitter (X)
    // Appel à la fonction pour publier sur Twitter
    // await tweetArticleSummary(articleData);

    // 3) (Optionnel) PING Google pour signaler la mise à jour du sitemap
    // try {
    //   const pingUrl =
    //     "https://www.google.com/ping?sitemap=https://mavitrineduweb.fr/sitemap.xml";
    //   await fetch(pingUrl);
    //   console.log("Ping Google Sitemap: succès !");
    // } catch (pingError) {
    //   console.error("Impossible de ping Google :", pingError);
    // }

    res.redirect("/blog/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de la création du post");
  }
});

/**
 * POST  Admin - Prévisualiser un post en cours de création
 **/

router.post("/preview-addpost", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Preview Post",
      description: "Preview the post before adding."
    };

    const data = {
      title: req.body.title,
      description: req.body.description,
      body: req.body.body,
      bannerImage: req.files.bannerImage,
      createdAt: new Date(),
      // sanitizedHtml: dompurify.sanitize(marked.parse(req.body.body))
      sanitizedHtml: dompurify.sanitize(renderMarkdown(req.body.body))
    };
    // console.log("Date de création (createdAt):", data.createdAt);
    // console.log("Type de createdAt:", typeof data.createdAt);
    // console.log("Valeur de createdAt:", data.createdAt);

    // Rendre la vue de prévisualisation
    res.render("admin/preview-post", {
      locals,
      data,
      layout: adminLayout
    });
  } catch (error) {
    console.error("Erreur lors de la prévisualisation du post :", error);
    res.status(500).send("Erreur lors de la prévisualisation du post");
  }
});

/**
 * GET  Admin - accéder au post à modifier
 **/
// *
// accéder à la page du post à modifier
router.get("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    };

    const data = await Post.findOne({ _id: req.params.id });
    // console.log("data get edit-post / id :", data);

    // Récupérer tempBannerImage depuis la requête si disponible
    // const tempBannerImage = req.query.tempBannerImage || null;

    res.render("admin/edit-post", {
      locals,
      data: {
        ...data.toObject()
      },
      layout: adminLayout
    });
  } catch (error) {
    console.log(error);
  }
});

/**
 * PUT  Admin - Edit post
 **/
// *
// Modifier un post
/* Part 10 du tuto, time 7.37
https://chatgpt.com/share/673e1cd8-ea44-800d-b7e7-a84618775dac */
/* findByIdAndUpdate est une méthode de Mongoose utilisée pour trouver un document dans la collection MongoDB par son identifiant unique (_id) et le mettre à jour avec les nouvelles données fournies. */

/* router.put("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    // Récupérer le document existant
    const post = await Post.findById(req.params.id);
    console.log("post put(/edit-post/:id before :", post);

    if (!post) {
      return res.status(404).send("Post introuvable");
    }

    // Mettre à jour les champs
    post.title = req.body.title;
    post.description = req.body.description;
    post.body = req.body.body;
    post.updatedAt = Date.now();

    // Vérifier si une nouvelle image a été envoyée
    if (req.files && req.files.bannerImage) {
      // capter les anciennes images si une nouvelle image est envoyée
      const { ImgBase, ImgConvert, smallImgBase, smallImgConvert } =
        post.bannerImages;

      // Supprimer les anciennes images de /public/uploads/
      const filesToDelete = [
        ImgBase,
        ImgConvert,
        smallImgBase,
        smallImgConvert
      ].map((file) => path.join(process.cwd(), "public", file));
      for (const filePath of filesToDelete) {
        try {
          await fs.unlink(filePath); // Supprimer le fichier
          console.log(`Fichier supprimé : ${filePath}`);
        } catch (err) {
          console.error(
            `Erreur lors de la suppression de ${filePath}:`,
            err.message
          );
        }
      }

      const bannerImages = await processImage(req.files.bannerImage);
      post.bannerImages = bannerImages;
      // console.log("Une nouvelle image a été envoyée :", req.files.bannerImage);
    } else {
      console.log("Aucune image n'a été envoyée.");
    }

    // Appeler save() applique les middlewares de Post.js, y compris pre("validate")
    await post.save();

    // Redirection après mise à jour
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de la mise à jour du post");
  }
}); */

/**
 * PUT  Admin - Edit post
 **/
// *
// Modifier un post existant :
/* Part 10 du tuto, time 7.37 */
router.put("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send("Post introuvable");
    }

    post.title = req.body.title;
    post.description = req.body.description;
    post.body = req.body.body;
    post.updatedAt = Date.now();

    if (req.files && req.files.bannerImage) {
      await deletePostImages(post.bannerImages); // Suppression des anciennes images
      const bannerImages = await processImage(req.files.bannerImage);
      post.bannerImages = bannerImages;
    }

    await post.save();

    // 3) (Optionnel) PING Google
    try {
      const pingUrl =
        "https://www.google.com/ping?sitemap=https://mavitrineduweb.fr/sitemap.xml";
      await fetch(pingUrl);
      console.log("Ping Google Sitemap: succès !");
    } catch (pingError) {
      console.error("Impossible de ping Google :", pingError);
    }

    res.redirect("/blog/dashboard");
  } catch (error) {
    console.error("Erreur lors de la mise à jour du post :", error);
    res.status(500).send("Erreur lors de la mise à jour du post");
  }
});

/* router.put("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send("Post introuvable");
    }

    // Mise à jour des champs
    post.title = req.body.title;
    post.description = req.body.description;
    post.body = req.body.body;
    post.updatedAt = Date.now();

    // Vérification de la nouvelle image
    if (req.files && req.files.bannerImage) {
      const { ImgBase, ImgConvert, smallImgBase, smallImgConvert } =
        post.bannerImages;

      const filesToDelete = [
        ImgBase,
        ImgConvert,
        smallImgBase,
        smallImgConvert
      ].map((file) => path.join(process.cwd(), "public", file));

      // Suppression des anciennes images
      for (const filePath of filesToDelete) {
        try {
          await fs.access(filePath); // Vérifie si le fichier existe
          console.log(`Tentative de suppression : ${filePath}`);

          await fs.unlink(filePath); // Supprime le fichier
          console.log(`Fichier supprimé : ${filePath}`);
        } catch (err) {
          if (err.code === "ENOENT") {
            console.log(`Fichier introuvable, déjà supprimé : ${filePath}`);
          } else {
            console.error(`Erreur lors de la suppression : ${filePath}`, err);
          }
        }
      }

      // Traitement de la nouvelle image
      const bannerImages = await processImage(req.files.bannerImage);
      post.bannerImages = bannerImages;
    } else {
      console.log("Aucune image n'a été envoyée.");
    }

    await post.save(); // Sauvegarde les modifications
    res.redirect("/blog/dashboard");
  } catch (error) {
    console.error("Erreur lors de la mise à jour du post :", error);
    res.status(500).send("Erreur lors de la mise à jour du post");
  }
}); */

/**
 * POST Admin - Preview Post
 **/
router.post("/preview-post/:id", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Preview Post",
      description: "Preview the post before updating."
    };

    // Récupérer le post existant pour obtenir les images actuelles
    // const post = await Post.findById(req.body.postId);

    const post = await Post.findById(req.params.id);
    // console.log("post :", post);

    if (!post) {
      return res.status(404).send("Post introuvable");
    }

    const data = {
      _id: req.params.id,
      title: req.body.title,
      description: req.body.description,
      body: req.body.body,
      bannerImage: post.bannerImages.ImgBase,
      createdAt: post.createdAt, // Conserver la date de création
      sanitizedHtml: dompurify.sanitize(renderMarkdown(req.body.body))
    };
    // console.log("data.bannerImage :", data.bannerImage);

    // Rendre la vue de prévisualisation
    res.render("admin/preview-post", {
      locals,
      data,
      layout: adminLayout
    });
  } catch (error) {
    console.error("Erreur lors de la prévisualisation du post :", error);
    res.status(500).send("Erreur lors de la prévisualisation du post");
  }
});

/* router.post("/preview-post/:id", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Preview Post",
      description: "Preview the post before updating."
    };

    // Récupérer le post existant pour obtenir les images actuelles
    // const post = await Post.findById(req.body.postId);

    const post = await Post.findById(req.params.id);
    console.log("post :", post);

    if (!post) {
      return res.status(404).send("Post introuvable");
    }

    // Déterminer quelle image utiliser pour la prévisualisation
    let bannerImage;
    if (req.files?.bannerImage) {
      console.log(
        "Nouvelle image détectée pour la prévisualisation :",
        req.files.bannerImage.name
      );

      // Créer un chemin vers le dossier uploads
      const uploadsDir = path.join(process.cwd(), "public", "uploads");

      // S'assurer que le dossier uploads existe
      await fs.mkdir(uploadsDir, { recursive: true });

      // Déplacer le fichier téléchargé dans le dossier uploads
      const uploadPath = path.join(uploadsDir, req.files.bannerImage.name);
      await req.files.bannerImage.mv(uploadPath);

      // Utiliser ce chemin pour la prévisualisation
      bannerImage = `/uploads/${req.files.bannerImage.name}`;
    } else {
      console.log(
        "Utilisation de l'image existante dans 'post' pour la prévisualisation."
      );

      // Utiliser l'image existante
      bannerImage = post.bannerImages.ImgBase;
    }

    // Récupérer les autres données pour la prévisualisation
    const data = {
      _id: req.params.id,
      title: req.body.title,
      description: req.body.description,
      body: req.body.body,
      // bannerImage,
      createdAt: post.createdAt, // Conserver la date de création
      sanitizedHtml: dompurify.sanitize(marked.parse(req.body.body))
    };

    // Rendre la vue de prévisualisation
    res.render("admin/preview-post", {
      locals,
      data,
      layout: adminLayout
    });
  } catch (error) {
    console.error("Erreur lors de la prévisualisation du post :", error);
    res.status(500).send("Erreur lors de la prévisualisation du post");
  }
}); */

/* router.post("/preview-post", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Preview Post",
      description: "Preview the post before updating."
    };
    // console.log("req.files.bannerImage :", req.files.bannerImage);

    // Récupérer les données soumises dans le formulaire
    const data = {
      title: req.body.title,
      description: req.body.description,
      body: req.body.body,
      bannerImage: req.files?.bannerImage?.name || "/img/default-img.png",
      createdAt: new Date(),
      sanitizedHtml: dompurify.sanitize(marked.parse(req.body.body))
    };
    console.log("data :", data);

    res.render("admin/preview-post", {
      locals,
      data,
      layout: adminLayout
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Erreur lors de la prévisualisation du post");
  }
}); */

/**
 * POST  Admin - Register
 **/
// *
/* Pour rappel : 
  1- Lorsque l'utilisateur ouvre une page du site, une requête est envoiyée au serve et session() de 'server.js' crée automatiquement une session avec 'saveUninitialized: true,' valable selon la durée définie également dans session() par 'cookie: {maxAge:36000}' .
  2- l'ID de session est stocké côté client et server, mais les données utilisateur sont stockées uniquement côté serveur (apparement pas très bon pour la sécurité. risque de piratage du server.) */
// On enregistre un nouvel utilisateur.
// Ici l'utilisateur doit s'enregistrer. le formulaire envoi une requête POST '/register' que le server écoute avec 'router.post("/register", ...'. Le server récupère les données d'authentification, encode le password, puis crée un utilisateur dans la base de données. Comme pour "check Login 1" il s'agit d'une authentification stateful. L'ID de session est stocké côté client et server, mais les données utilisateur sont stockées uniquement côté serveur .
// '/register' POST vient de 'admin/index.ejs'
router.post("/register", async (req, res) => {
  try {
    // On récupère les informations d'inscription (username et password) que l'utilisateur a envoyées via le formulaire.
    const { username, password } = req.body;
    //bcrypt.hash(password, 10) utilise bcrypt pour transformer le mot de passe en une valeur hachée.
    // 10 est le nombre de tours de salage. Plus ce nombre est élevé, plus le processus de hachage est sécurisé (et coûteux en termes de temps de calcul).
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // User est le modèle lié à la collection du même nom + "s", crée dans Mongodb par Mongoost dans 'User.js'.
      // Donc ici on enregistre le username et le hashedPassword (mot de passe haché) dans la base de données.
      const user = await User.create({ username, password: hashedPassword });
      // Si l'utilisateur est créé avec succès, une réponse HTTP est envoyée par le seveur au navigateur avec le statut 201 (signifiant "Created"), et pour l'instant, un simple message JSON est renvoyé confirmant la création de l'utilisateur.
      // Les statut HTTP sont ajoutés dans les en-têtes de la réponse HTTP.
      res.status(201).json({ message: "User Created", user });
    } catch (error) {
      //  Ce code d'erreur 11000 est spécifique à MongoDB et indique une violation de la contrainte d'unicité (username déja utilisé).
      if (error.code === 11000) {
        // statut 409 indique un conflit avec username
        res.status(409).json({ message: "User already in use" });
      }
      // indiquer une erreur interne au serveur. Cela signifie que quelque chose s'est mal passé côté serveur qui a empêché de répondre correctement.
      res.status(500).json({ message: "Internal server error" });
    }
  } catch (error) {
    console.log(error);
  }
});

/**
 * DELETE  Admin - Delete Post
 **/
// *
/* Part 10 du tuto, time 7.37
https://chatgpt.com/share/673e1cd8-ea44-800d-b7e7-a84618775dac */

router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send("Post introuvable");
    }

    await deletePostImages(post.bannerImages); // Suppression des images associées

    await Post.deleteOne({ _id: req.params.id });
    res.redirect("/blog/dashboard");
  } catch (error) {
    // console.error("Erreur lors de la suppression du post :", error);
    res.status(500).send("Erreur lors de la suppression du post");
  }
});

/* router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
  try {
    // suppression des images du dossier "upload".
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send("Post introuvable");
    }
    const { ImgBase, ImgConvert, smallImgBase, smallImgConvert } =
      post.bannerImages;

    const filesToDelete = [
      ImgBase,
      ImgConvert,
      smallImgBase,
      smallImgConvert
    ].map((file) => path.join(process.cwd(), "public", file));

    // Suppression des anciennes images
    for (const filePath of filesToDelete) {
      try {
        await fs.access(filePath); // Vérifie si le fichier existe
        console.log(`Tentative de suppression : ${filePath}`);

        await fs.unlink(filePath); // Supprime le fichier
        console.log(`Fichier supprimé : ${filePath}`);
      } catch (err) {
        if (err.code === "ENOENT") {
          console.log(`Fichier introuvable, déjà supprimé : ${filePath}`);
        } else {
          console.error(`Erreur lors de la suppression : ${filePath}`, err);
        }
      }
    }
    // suppression de l'article de la base de données.
    await Post.deleteOne({ _id: req.params.id });
    res.redirect("/blog/dashboard");
  } catch (error) {
    console.log(error);
  }
}); */

/**
 * GET  Admin - Logout
 **/
// *
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  // res.json({ message: "Logout successful." });
  res.redirect("/blog");
});

export default router;
