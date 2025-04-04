// Mongoose crée une collection dans une base de données Mongodb.
//  "User" dans 'export default mongoose.model("User", UserSchema);' est le nom du "model Mongoose" de notre collection. un modèle Mongoose est une bibliothèque de Mongodb qui donne accès à d'autres fonctions pour facilite l'interaction avec les bases de données Mongodb. Un "modèle Mongoose" est une interface (User.unefonction() ) que tu utilises pour interagir avec la base de données(voir dans main.js). Par exemple pour récupérer, ajouter, lire, mettre à jour, ou supprimer des documents. Mongodb va automatiquement créer une collection du même nom (+ "s") que le modèle dans la base de données . La collection est donc liée au modéle "Post", lui même structuré par la fonction "Schema()" de Mongoose qui donne une structure aux documents de la base de données MongoDB. PostSchema est l'objet construit avec "Schema" qui contient les champs title, body, createdAt, etc. Chaque document de cette collection est un "user" avec ces propriétés.

// le model User va être récupéré dans 'admin.js'.

import mongoose from "mongoose";

const Schema = mongoose.Schema;
const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    // deux documents ne peuvent pas avoir le même username.
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

const db = mongoose.connection.useDb("MVDW-Blog2");

export default db.model("User", UserSchema);

// module.exports = mongoose.model("Post", PostSchema);
// export default mongoose.model("User", UserSchema);
