import path from "path";
import fs from "fs";
import sharp from "sharp";

// Désactiver le cache global de Sharp
sharp.cache(false);

export async function processImage(bannerFile) {
  if (!bannerFile) {
    throw new Error("Aucune image fournie pour le traitement.");
  }

  function cleanFileName(name) {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9.-]/g, "");
  }

  const date = new Date();
  const originalName = cleanFileName(path.parse(bannerFile.name).name);
  const bannerImageName = `${date.getDate()}${date.getTime()}-${originalName}`;
  const fileExtension = path.extname(bannerFile.name).toLowerCase();
  const isPng = fileExtension === ".png";

  const uploadDir = path.join(process.cwd(), "public/uploads/");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const basePath = path.join(
    uploadDir,
    `${bannerImageName}-base${isPng ? ".png" : ".jpg"}`
  );
  const convertPath = path.join(uploadDir, `${bannerImageName}.webp`);
  const smallPath = path.join(
    uploadDir,
    `${bannerImageName}-300x100${isPng ? ".png" : ".jpg"}`
  );
  const smallConvertPath = path.join(
    uploadDir,
    `${bannerImageName}-300x100.webp`
  );

  if (isPng) {
    const buffer = await sharp(bannerFile.data)
      .png({
        quality: 80,
        compressionLevel: 9
      })
      .toBuffer(); // Convertir en buffer pour libérer l'image du système.
    await sharp(buffer).toFile(basePath); // Sauvegarder le fichier
  } else {
    const buffer = await sharp(bannerFile.data)
      .withMetadata({ density: 72 })
      .jpeg({
        mozjpeg: true,
        quality: 80
      })
      .toBuffer();
    await sharp(buffer).toFile(basePath);
  }

  await sharp(basePath).toFormat("webp").toFile(convertPath);

  await sharp(basePath)
    .resize({ width: 350, height: 150, fit: "inside" })
    .toFile(smallPath);

  await sharp(smallPath).toFormat("webp").toFile(smallConvertPath);
  return {
    ImgBase: `/uploads/${bannerImageName}-base${isPng ? ".png" : ".jpg"}`,
    ImgConvert: `/uploads/${bannerImageName}.webp`,
    smallImgBase: `/uploads/${bannerImageName}-300x100${isPng ? ".png" : ".jpg"}`,
    smallImgConvert: `/uploads/${bannerImageName}-300x100.webp`
  };
}

export async function processIllustrationImage(file) {
  if (!file) {
    throw new Error("Aucune image fournie pour le traitement.");
  }

  function cleanFileName(name) {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9.-]/g, "");
  }

  const tempDir = path.join(process.cwd(), "public/temp/");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const date = new Date();
  const originalName = cleanFileName(path.parse(file.name).name);
  const uniqueName = `${date.getDate()}${date.getTime()}-${originalName}`;
  const filePath = path.join(tempDir, `${uniqueName}.webp`);

  // Conversion en WebP
  await sharp(file.data).toFormat("webp").toFile(filePath);

  return `/temp/${uniqueName}.webp`;
}
