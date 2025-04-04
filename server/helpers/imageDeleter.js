import fs from "fs/promises";
import path from "path";

export async function deletePostImages(bannerImages) {
  const { ImgBase, ImgConvert, smallImgBase, smallImgConvert } = bannerImages;

  const filesToDelete = [
    ImgBase,
    ImgConvert,
    smallImgBase,
    smallImgConvert
  ].map((file) => path.join(process.cwd(), "public", file));

  try {
    await Promise.all(
      filesToDelete.map(async (filePath) => {
        try {
          await fs.access(filePath); // Vérifie si le fichier existe
          await fs.unlink(filePath); // Supprime le fichier
          console.log(`Fichier supprimé : ${filePath}`);
        } catch (err) {
          if (err.code === "ENOENT") {
            console.log(`Fichier introuvable, déjà supprimé : ${filePath}`);
          } else {
            console.error(`Erreur lors de la suppression : ${filePath}`, err);
          }
        }
      })
    );
  } catch (error) {
    console.error("Erreur lors de la suppression des fichiers :", error);
  }
}
