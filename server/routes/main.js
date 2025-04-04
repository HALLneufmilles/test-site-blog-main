import express from "express";
import Post from "../models/Post.js";
// app.use((req, res, next) => {
//   res.locals.data = res.locals.data || null; // S'assurer que data existe
//   next();
// });

const router = express.Router();
/* Lorsque tu appelles res.render("search", { locals, data, currentRoute: '/' }), cela implique plusieurs choses, surtout dans le contexte de l'utilisation d'un layout :

1- Layout par défaut : Si tu ne spécifies pas explicitement un autre layout dans la méthode res.render(), Express va utiliser le layout par défaut défini dans server.js avec app.set("layout", "./layouts/main").

2- Inclusion dans le Layout : Le contenu de search.ejs sera inséré dans l'élément <%- body %> du layout principal, c'est-à-dire main.ejs. Par conséquent, les valeurs définies dans locals seront disponibles non seulement dans search.ejs, mais également dans tous les éléments inclus dans le layout par défaut.

3- Disponibilité de locals : Cela signifie que les valeurs définies dans l'objet locals seront disponibles pour tous les fichiers EJS qui sont rendus dans le cadre du layout par défaut. Cela inclut les partials comme header.ejs, footer.ejs, et tout autre fichier partiel qui est inclus via le layout principal main.ejs. */

/**
 * GET  HOME
 **/
// (3) Accède à la page d'accueil et Récupération des Posts pour la route Home + pagination.
router.get("/", async (req, res) => {
  //' Local' pour la balise <head> de 'main.ejs'

  try {
    const locals = {
      title: "MaVitrineDuWeb - Le Blog",
      description:
        "Découvrez nos articles sur la création de sites web professionnels à moindre coût et sans compromis sur la qualité."
    };
    // On défini le nombre de post par page
    let perPage = 6;
    // la page par defaut est la page 1. Query représante une option après "?" dans l'url qu'on introduit sous fomre de clef = Valeur comme dans  <a href="/?page=<%= nextPage %>" dans 'index.ejs' .
    let page = req.query.page || 1;
    // https://chatgpt.com/share/672e0389-1c94-800d-b388-659e73d9334c
    // Utilise l'agrégation MongoDB pour manipuler les documents. L'agrégation est utilisée ici pour exécuter une série d'opérations sur la collection posts.

    /*    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec(); */

    // Utilisez `find()` avec le tri
    const data = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage);
    // console.log("data index :", data);

    // https://chatgpt.com/share/672e0389-1c94-800d-b388-659e73d9334c
    // Count is deprecated - please use countDocuments
    // const count = await Post.count();
    //Cette ligne permet de compter tous les documents présents dans la collection Post. {} signifie qu'il n'y a pas de conditions particulières, donc tous les documents sont comptés.
    const count = await Post.countDocuments({});
    // Convertit la variable page en un entier (base 10 par défaut)
    const nextPage = parseInt(page) + 1;
    // Cette ligne détermine s'il y a une page suivante.
    // Math.ceil(count / perPage) calcule le nombre total de pages nécessaires pour afficher tous les articles.
    // Si count vaut 25 et perPage est 10, alors le nombre total de pages sera 3 (Math.ceil(25 / 10) = 3). Le Math.ceil() est utilisé pour arrondir vers le haut afin d'inclure tous les articles même s'il reste moins de perPage articles sur la dernière page.
    // nextPage <= Math.ceil(count / perPage) vérifie si la page suivante (nextPage) est inférieure ou égale au nombre total de pages disponibles.
    // hasNextPage sera alors true ou false en fonction du résultat de la comparaison.
    const hasNextPage = nextPage <= Math.ceil(count / perPage);
    // render() stipule les données et la vue du dossier "views" à insérer dans l'élément "body" du layout. Sans layout indiqué en second argument, le layout indiqué par défaut dans 'server.js' sera utilisé. Les fichiers à la racine du dossier "views" sont fait pour être utilisé avec le layout par défaut. c'est la raison pour laquelle il n'est pas nécessaire de stipuler le layout par défaut lorqu'on utilise ces vues.
    // Demade au server d'insérer les données et sa vue 'index.ejs' située à la racine du dossier "views" dans l'élément "body" du layout. Pas de layout indiqué en second argument donc le layaout par defaut indiqué dans 'server.js' sera utilisé.
    res.render("index", {
      locals,
      data,
      current: page,
      // si hasNextPage = true, nextPage = nextPage
      nextPage: hasNextPage ? nextPage : null,
      // currentRoute est envoyée dans la vue pour être comparée à la vue spécifiée dans le lien du fichier 'header.ejs'.
      // https://chatgpt.com/share/672e0389-1c94-800d-b388-659e73d9334c
      currentRoute: "/blog",
      count,
      perPage
    });

    // const data = await Post.find();
    // res.render("index", { locals, data });
  } catch (error) {
    console.log(error);
  }
});

// *(2) Récupération des Posts pour la route Home.
// router.get("", async (req, res) => {
// *'Local' pour la balise <head> de 'main.ejs'
// const locals = {
//   title: "Node Blog",
//   description: "Simple Blog created with NodeJs, Express & MongoDb."
// };
// try {
// *requête Mongoose qui récupère tous les documents de la collection Post construite dans 'Post.ejs'. Le mot clé 'await' est utilisé car Post.find() doit être est une opération asynchrone qui retourne une Promise. Cela garantit que le code attend la fin de la récupération des données avant de passer à l'étape suivante.
// * En résumé, Post.find() interroge la collection Post de la base de données MongoDB et renvoie tous les documents (posts) présents dans cette collection.
// const data = await Post.find();
// render() stipule les données et la vue du dossier "views" à insérer dans l'élément "body" du layout. Sans layout indiqué dans l'objet de données, le layout par défaut dans 'server.js' sera utilisé. Dans 'admin.js' tu remarqueras qu'on stipule le layout avec 'layout: adminLayout'. Les fichiers à la racine du dossier "views" sont fait pour être utilisé avec le layout par convention. c'est la raison pour laquelle il n'est pas nécessaire de stipuler le layout par défaut lorqu'on utilise ces vues.
// Demade au server d'insérer les données et sa vue 'index.ejs' située à la racine du dossier "views" dans l'élément "body" du layout. Pas de layout indiqué en second argument donc le layaout par defaut indiqué dans 'server.js' sera utilisé.
//   res.render("index", { locals, data });
// } catch (error) {
//   console.log(error);
// }
// *FIN Récupération des Posts
// });

/** (4)
 * Récupération et affichage d'un post :
 * GET /
 * acéder à un post en fonction de son :id
 */
router.get("/post/:id", async (req, res) => {
  try {
    // "slug" est le numéro de l'id de l'article.
    // Comme dans 'index.ejs' on choisi d'afficher l'artcle par son id placé en paramètre de l'url(voir index.ejs), onutilise 'req.params'.
    let slug = req.params.id;
    // On récupère l'article avec son ID
    const data = await Post.findById({ _id: slug });
    // On crée 'locals' qui sera toujours utilisé dans la balise <head> de 'main.ejs'.
    // Il est préférable de mettre 'const locals' après 'const data'.
    // "title" représente maintenant le titre de l'article. Il s'affichera dans l'onglet du navigateur.
    const random3Posts = await Post.aggregate([{ $sample: { size: 3 } }]);
    // console.log("data post :", data);

    const locals = {
      title: data.title,
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    };
    // render() stipule les données et la vue du dossier "views" à insérer dans l'élément "body" du layout. Sans layout indiqué dans l'objet de données, le layout par défaut dans 'server.js' sera utilisé. Dans 'admin.js' tu remarqueras qu'on stipule le layout avec 'layout: adminLayout'. Les fichiers à la racine du dossier "views" sont fait pour être utilisé avec le layout par convention. c'est la raison pour laquelle il n'est pas nécessaire de stipuler le layout par défaut lorqu'on utilise ces vues.
    // Demade au server d'insérer les données et sa vue 'post.ejs' située à la racine du dossier "views" dans l'élément "body" du layout. Pas de layout indiqué en second argument donc le layaout par defaut indiqué dans 'server.js' sera utilisé.
    res.render("post", {
      locals,
      data,
      random3Posts,
      // currentRoute est envoyée dans la vue pour être comparée à la vue spécifiée dans le lien du fichier 'header.ejs'.
      // https://chatgpt.com/share/672e0389-1c94-800d-b388-659e73d9334c
      currentRoute: `/post/${slug}`
    });
  } catch (error) {
    console.log(error);
  }
});

/** (5)
 * Récupération et affichage d'un post :
 * POST / Post - SearchTerm
 */
// En utilisant router.post("/search", ...), tu fais en sorte que le serveur écoute les requêtes POST qui sont envoyées à /search.
router.post("/search", async (req, res) => {
  try {
    const locals = {
      title: "Search",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    };
    // Depuis 'search.ejs' Formulaire la valeur de input est récupérée dans l'attribut 'name=searchTerm'. Après la soumission du formulaire par l'utilisateur, le navigateur à crée la requête 'POST /seach' puis 'app.use(express.urlencoded({ extended: true }));' de 'server.js' la traité pour rendre 'searchTerm' disponible dans 'req.body'.
    let searchTerm = req.body.searchTerm;
    // suppression de tous caractères spéciaux:
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");
    // demande au server de rechercher dans la base de données le mot tapé (searchTerm) dans le formulaire :
    const data = await Post.find({
      // $or est un opérateur MongoDB utilisé pour effectuer une recherche conditionnelle. Il signifie "si au moins une des conditions suivantes est vraie".
      // Ici, cela signifie que l'on cherche des documents où soit le title ou le body correspond au terme de recherche.
      $or: [
        // Cette condition signifie : chercher dans le champ title les documents où le titre contient la chaîne searchNoSpecialChar (insensible à la casse: i).
        { title: { $regex: new RegExp(searchNoSpecialChar, "i") } },
        // Cette condition signifie : chercher dans le champ body les documents où le contenu contient la chaîne searchNoSpecialChar (insensible à la casse: i).
        { body: { $regex: new RegExp(searchNoSpecialChar, "i") } }
      ]
    });
    //render() stipule les données et la vue du dossier "views" à insérer dans l'élément "body" du layout. Sans layout indiqué dans l'objet de données, le layout par défaut dans 'server.js' sera utilisé. Dans 'admin.js' tu remarqueras qu'on stipule le layout avec 'layout: adminLayout'. Les fichiers à la racine du dossier "views" sont fait pour être utilisé avec le layout par convention. c'est la raison pour laquelle il n'est pas nécessaire de stipuler le layout par défaut lorqu'on utilise ces vues.
    // Demade au server d'insérer les données et sa vue 'search.ejs' située à la racine du dossier "views" dans l'élément "body" du layout. Pas de layout indiqué en second argument donc le layaout par defaut indiqué dans 'server.js' sera utilisé.
    res.render("search", {
      data,
      locals,
      // currentRoute est envoyée dans la vue pour être comparée à la vue spécifiée dans le lien du fichier 'header.ejs'.
      // https://chatgpt.com/share/672e0389-1c94-800d-b388-659e73d9334c
      currentRoute: "/"
    });

    //  res.send(searchTerm) envoie directement le contenu de la variable searchTerm (par exemple "valeur") comme réponse au navigateur.:
    // res.send(searchTerm);
  } catch (error) {
    console.log(error);
  }
});

router.get("/about", (req, res) => {
  res.render("about", {
    // currentRoute est envoyée dans la vue pour être comparée à la vue spécifiée dans le lien du fichier 'header.ejs'.
    currentRoute: "/about"
  });
});

export default router;
// (1) insersion manuel de document dans la base de données :

// const locals = {
//   title: "Node Blog",
//   description: "Simple Blog created with NodeJs, Express & MongoDb."
// };

// function insertPostData() {
//   Post.insertMany([
//     {
//       title: "Building APIs with Node.js",
//       body: "Learn how to use Node.js to build RESTful APIs using frameworks like Express.js",
//     },
//     {
//       title: "Deployment of Node.js applications",
//       body: "Understand the different ways to deploy your Node.js applications, including on-premises, cloud, and container environments...",
//     },
//     {
//       title: "Authentication and Authorization in Node.js",
//       body: "Learn how to add authentication and authorization to your Node.js web applications using Passport.js or other authentication libraries.",
//     },
//     {
//       title: "Understand how to work with MongoDB and Mongoose",
//       body: "Understand how to work with MongoDB and Mongoose, an Object Data Modeling (ODM) library, in Node.js applications.",
//     },
//     {
//       title: "build real-time, event-driven applications in Node.js",
//       body: "Socket.io: Learn how to use Socket.io to build real-time, event-driven applications in Node.js.",
//     },
//     {
//       title: "Discover how to use Express.js",
//       body: "Discover how to use Express.js, a popular Node.js web framework, to build web applications.",
//     },
//     {
//       title: "Asynchronous Programming with Node.js",
//       body: "Asynchronous Programming with Node.js: Explore the asynchronous nature of Node.js and how it allows for non-blocking I/O operations.",
//     },
//     {
//       title: "Learn the basics of Node.js and its architecture",
//       body: "Learn the basics of Node.js and its architecture, how it works, and why it is popular among developers.",
//     },
//     {
//       title: "NodeJs Limiting Network Traffic",
//       body: "Learn how to limit netowrk traffic.",
//     },
//     {
//       title: "Learn Morgan - HTTP Request logger for NodeJs",
//       body: "Learn Morgan.",
//     },
//   ]);
// }

// insertPostData();
