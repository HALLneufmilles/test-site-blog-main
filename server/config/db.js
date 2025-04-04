/* // const mongoose = require("mongoose");
import mongoose from "mongoose";
const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Database Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Erreur connexion db: ${error.message}`);
  }
};

// module.exports = connectDB;
export default connectDB; */

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connexion réussie à MongoDB!");

    // Spécifier la base de données
    // mongoose.connection.useDb("MVDW-Blog2");
    const db = mongoose.connection.useDb("MVDW-Blog2");
    const collections = await db.listCollections();
    console.log(
      "Collections dans MVDW-Blog2 :",
      collections.map((c) => c.name)
    );
    console.log("Base de données connectée :", connection.connection.name);
  } catch (error) {
    console.error("Erreur de connexion à MongoDB :", error);
    process.exit(1);
  }
};

export default connectDB;
