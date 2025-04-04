// besoin du fichier '.env':
// require('dotenv').config();

// importing packages
import express from "express";
// import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();
import mainRoutes from "./server/routes/main.js";
// expressEjsLayouts est un middleware fourni par le package express-ejs-layouts.
// Ce middleware est utilisé pour ajouter une fonctionnalité de "layout" (mise en page) dans EJS. Les layouts permettent d'avoir une structure commune sur plusieurs pages, comme un header, un footer, ou une barre de navigation.
import adminRoutes from "./server/routes/admin.js";
// route du fichier pour la création du sitemap.xlm.
import sitemapRoutes from "./server/routes/sitemapRoute.js";
import expressEjsLayouts from "express-ejs-layouts";
// "Les cookies sont des morceaux de données (tels que des identifiants, des informations de session, préférences come 'theme dark, les Jetons de token, etc.) que le navigateur stocke et renvoie automatiquement au serveur lors de chaque requête HTTP."
import session from "express-session";
// cookieParser() est un middleware qui sert à analyser (parser) les cookies envoyés par le navigateur au serveur dans chaque requête HTTP.
// Quand un utilisateur visite une page de ton site, le navigateur envoie automatiquement les cookies associés à ce domaine dans chaque requête HTTP.
// Le serveur, via Express, reçoit cette requête envoyée par le navigateur, avec ses cookie placés en en-tête. cookieParser() permet au serveur de récupérer les cookies en les rendant disponibles à travers req.cookies.
import cookieParser from "cookie-parser";
// connect-mongo : C'est un package qui permet de stocker les sessions (session() de 'Express-session') dans une base de données MongoDB. Cela permet de garder les informations de session persistantes, même après le redémarrage du serveur.
// "MongoStore" de 'connect-mongo' va donc créer la collection "sessions" dans la base de données.
import MongoStore from "connect-mongo";

import connectDB from "./server/config/db.js";
/* Part 10 du tuto, time 7.37
https://chatgpt.com/share/673e1cd8-ea44-800d-b7e7-a84618775dac 
*/
import methodOverride from "method-override";

import { isActiveRoute } from "./server/helpers/routeHelpers.js";

import fileupload from "express-fileupload";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to db
connectDB();
// PART 6 - Time 9.50
// middlewares utilisés pour parser les données du formulaire ou autres sources.
// express.urlencoded({ extended: true }) est le middleware qui parse les données sous forme de 'application/x-www-form-urlencodedpour' et les rendre accessibles via req.body.
app.use(express.urlencoded({ extended: true }));
// app.use(express.json()); est utilisé pour parser les données JSON et les rendre accessibles via req.body..
app.use(express.json());
/////////////////////////
// "app.use(cookieParser()); active le middleware cookieParser sur le serveur."
app.use(cookieParser());
/* Part 10 du tuto, time 7.37
https://chatgpt.com/share/673e1cd8-ea44-800d-b7e7-a84618775dac */
app.use(methodOverride("_method"));

// Lorsqu'un premier utilisateur se connect , une collection "sessions" est ajoutée dans Mongodb et une session y est ajoutée avec un ID propre. Cette ID est aussi enregistré automatiquement dans le navigateur en tant que cookie . Les données de session elles (Identifiants, Privilèges , Préférences etc...) sont stockées côté serveur (Sauf cas d'utilisation des Tokens qui les storent dans le navigateur ). Dès que l'utilisateur  revisite le site, 'session()' de "express-session" vérifie s'il y a une session active pour cet utilisateur. Si ce n'est pas le cas, une nouvelle session est créée avec un nouvel ID.
// Le middleware 'session()' est fourni par "express-session", qui est une solution standard pour gérer les sessions dans les applications Express.
//express-session n'est pas intégré directement dans Express, il à été installé au début du projet.
// Il permet de créer, gérer et stocker des sessions pour les utilisateurs.

app.use(
  session({
    // clé secrete utilisée pour générer les ID de session.
    // Pour gérer la sécurité dans une application, plus spécifiquement pour la gestion des mots de passe et des jetons d'authentification (JWT) on utilise dans 'admine.js' les modules 'bcrypt' et 'jsonwebtoken' qui seront liés à une "clé de sécurité".
    // 'secret' contient une clé secrète utilisée pour signer le cookie de session, assurant ainsi l'intégrité des données de session.
    // "keyboard cat" est simplement une chaîne de caractères qui sert de clé secrète. En pratique, il est préférable d'utiliser une clé secrète plus sécurisée et de la stocker dans une variable d'environnement.
    // !!!! Il est également conseillé de changer régulièrement la clé secrète, surtout si tu soupçonnes qu'elle a été compromise. !!!!
    secret: process.env.SESSION_SECRET,
    // false signifie que la session ne sera pas sauvegardée si elle n'a pas été modifiée. Cela permet d'économiser des ressources et de réduire la charge sur le serveur.
    resave: false,
    // 'saveUninitialized: true' signifie que dès qu'un utilisateur affiche une page du site. Cela est souvent utile pour conserver des informations sur les visiteurs avant même qu'ils soient authentifiés. Sur amazon par exemple on peut remplir sont panier avant d'être connecté. Cependant cela peut finir par prendre beaucoup de ressource server si beaucoup d'utilisateur , donc mef!
    saveUninitialized: true,
    // Comme dit plus haut lors de l'importation, "MongoStore" de 'connect-mongo' va créer la collection "sessions" dans la base de données.
    // Cela signifie que les sessions seront stockées dans MongoDB. Si le serveur redémarre, les utilisateurs ne seront pas déconnectés tant que leur session est encore valide, car la session est stockée de manière persistante dans la base de données.
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI
    }),
    cookie: {
      // Durée de vie du cookie de session : 30 jours (en millisecondes). Chaque jour a 24 heures. Chaque heure a 60 minutes. Chaque minute a 60 secondes. Chaque seconde a 1000 millisecondes.
      // maxAge: 30 * 24 * 60 * 60 * 1000
      // Ou 6mn:
      // maxAge: new Date(Date.now() + 360000)
      // Ou 6mn . Acause du décallage d'une heure je rajoute 1 heure soit 3600000 + 6mn 360000 = 3960000
      maxAge: 3960000
      /*  httpOnly: true, // Empêche l'accès aux cookies via JavaScript côté client
      sameSite: "strict" // Les cookies seront envoyés uniquement dans le même site, réduisant les risques de CSRF */
    }
  })
);

// Utilises expressEjsLayouts, cela signifie que tu veux définir un layout de base pour tes vues EJS. Le contenu spécifique de chaque page (par exemple index.ejs ou about.ejs) sera inséré dans une structure commune définie par le layout.
app.use(expressEjsLayouts);

// app.set("view engine", "ejs"); est utilisé pour indiquer à Express que tu veux utiliser EJS comme moteur de rendu pour tes vues.
// Cela signifie que lorsque tu appelles res.render("viewName"), Express sait qu'il doit chercher un fichier EJS (viewName.ejs) dans le dossier views par défaut.
// EJS (Embedded JavaScript Templating) permet d'utiliser du JavaScript directement dans le HTML et de générer dynamiquement des pages en fonction des données reçues.
app.set("view engine", "ejs");
// défini le layout principal qui sera utilisé pour les vues principales (celles à la racine du dossier views. Pour la page admin un autre layout sera utilisé : 'admin.ejs' situé dans le dossier "layout").
app.set("layout", "./layouts/main");
// configuration pour indiquer à Express de servir des fichiers statiques à partir du dossier public.
app.use(express.static("public"));
// enables form sharing
// app.use(express.json());
app.use(fileupload());
// isActiveRoute() impotée puis ajouté ici à 'app.locals' qui est un objet qui stocke des variables accessibles globalement dans toutes les vues rendues par Express.
// https://chatgpt.com/share/672e0389-1c94-800d-b388-659e73d9334c
app.locals.isActiveRoute = isActiveRoute;
// ajoute le préfixe "blog" aux routes du fichier 'mainroutes'.
app.use("/blog", mainRoutes);
// ajoute le préfixe "blog" aux routes du fichier 'mainroutes'.
app.use("/blog", adminRoutes);

app.use(express.static(path.join(__dirname, "dist")));

// <-- Montre la route sitemap à la racine
app.use("/", sitemapRoutes);

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
