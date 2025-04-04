import { TwitterApi } from "twitter-api-v2";
import dotenv from "dotenv";
dotenv.config();

// Créer un client Twitter X
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY, // Clé API
  appSecret: process.env.TWITTER_API_SECRET_KEY, // Clé secrète de l'API
  accessToken: process.env.TWITTER_ACCESS_TOKEN, // Token d'accès
  accessSecret: process.env.TWITTER_ACCESS_SECRET // Token d'accès secret
});

// Fonction pour publier un tweet
export const tweetArticleSummary = async (articleData) => {
  const message = `Nouveau blog post: ${articleData.title}\n${articleData.description}\nLire ici: ${articleData.url}`;

  try {
    const response = await twitterClient.v2.tweet(message);
    console.log("Réponse de l'API X:", response); // Affiche la réponse de l'API
    console.log("Tweet publié avec succès!");
  } catch (error) {
    console.error("Erreur lors de la publication du tweet:", error);
  }
};
// const getAccountInfo = async () => {
//   try {
//     const user = await twitterClient.v2.me(); // Appel API pour obtenir les infos du compte
//     console.log("Account info:", user); // Afficher les infos du compte
//   } catch (error) {
//     console.error("Error connecting to X API:", error);
//   }
// };

// getAccountInfo();
