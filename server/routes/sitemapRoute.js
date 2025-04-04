// server/routes/sitemapRoute.js
import { Router } from "express";
import { create } from "xmlbuilder2"; // Pour générer le XML
import Post from "../models/Post.js"; // Ton modèle Mongoose

const router = Router();

router.get("/sitemap.xml", async (req, res) => {
  try {
    // 1) Récupération de tous les articles
    //    On ne projette que _id et updatedAt, puisque nous utiliserons updatedAt pour lastmod
    //    (Tu peux ajouter createdAt également si tu en as un usage ; dans le sitemap standard,
    //     seul lastmod est réellement pris en compte par Google.)
    const posts = await Post.find({}, { _id: 1, updatedAt: 1 }).lean();

    // 2) URLs « statiques » (celles de ta partie Vite)
    const now = new Date().toISOString();
    const staticUrls = [
      { loc: "/", lastmod: now, priority: 1.0 },
      { loc: "/#hero-section", lastmod: now, priority: 0.8 },
      { loc: "/#services", lastmod: now, priority: 0.8 },
      { loc: "/#etapes", lastmod: now, priority: 0.7 },
      { loc: "/#prix", lastmod: now, priority: 0.7 },
      { loc: "/#themes", lastmod: now, priority: 0.7 },
      { loc: "/#competences", lastmod: now, priority: 0.6 },
      { loc: "/#contacts", lastmod: now, priority: 0.9 },
      { loc: "/blog", lastmod: now, priority: 0.9 }
    ];

    // 3) URLs dynamiques pour tes articles de blog
    //    On prend _id pour composer l'URL /blog/:id (à adapter si tu gères un slug).
    const blogUrls = posts.map((post) => ({
      loc: `/blog/${post._id}`,
      // On se base sur updatedAt pour indiquer la dernière modif
      lastmod: post.updatedAt ? post.updatedAt.toISOString() : now,
      priority: 0.8
    }));

    // 4) Construire l'objet urlset qui va générer le sitemap
    //    Note : seul lastmod est officiellement pris en compte par la spec sitemap
    const urlsetObj = {
      urlset: {
        "@xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9",
        url: [...staticUrls, ...blogUrls].map((url) => ({
          // Remplace ci-dessous par ton domaine réel si différent
          loc: `https://mavitrineduweb.fr${url.loc}`,
          lastmod: url.lastmod,
          priority: url.priority
        }))
      }
    };

    // 5) Génère le XML avec xmlbuilder2
    const sitemapXml = create(urlsetObj).end({ prettyPrint: true });

    // 6) Envoie la réponse
    res.setHeader("Content-Type", "application/xml");
    return res.status(200).send(sitemapXml);
  } catch (error) {
    console.error("Erreur lors de la génération du sitemap :", error);
    return res.sendStatus(500);
  }
});

export default router;
