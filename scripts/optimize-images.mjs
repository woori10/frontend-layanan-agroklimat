/**
 * Script optimasi gambar untuk meningkatkan Lighthouse Performance
 * Mengkonversi PNG → WebP dengan kualitas & ukuran optimal
 * Jalankan: node scripts/optimize-images.mjs
 */

import sharp from "sharp";
import { readdir, stat } from "fs/promises";
import { join, extname, basename } from "path";

const INPUT_DIR = "./public/images";
const OUTPUT_DIR = "./public/images";

const CONFIGS = [
  // Hero image → WebP kualitas tinggi (sudah WebP, re-compress lebih kecil)
  {
    input: "kantor.webp",
    output: "kantor-optimized.webp",
    width: 1920,
    quality: 72,
    format: "webp",
  },
  // Tentang images → WebP kualitas tinggi
  {
    input: "tentang_1.png",
    output: "tentang_1.webp",
    width: 800,
    quality: 80,
    format: "webp",
  },
  {
    input: "tentang_2.png",
    output: "tentang_2.webp",
    width: 800,
    quality: 80,
    format: "webp",
  },
  {
    input: "tentang_3.png",
    output: "tentang_3.webp",
    width: 800,
    quality: 80,
    format: "webp",
  },
  {
    input: "tentang_4.png",
    output: "tentang_4.webp",
    width: 800,
    quality: 80,
    format: "webp",
  },
  // FAQ Banner → WebP
  {
    input: "faq_banner.png",
    output: "faq_banner.webp",
    width: 1200,
    quality: 80,
    format: "webp",
  },
];

async function getFileSizeMB(filePath) {
  try {
    const info = await stat(filePath);
    return (info.size / 1024 / 1024).toFixed(2);
  } catch {
    return "N/A";
  }
}

async function optimizeImage(config) {
  const inputPath = join(INPUT_DIR, config.input);
  const outputPath = join(OUTPUT_DIR, config.output);

  const beforeMB = await getFileSizeMB(inputPath);
  console.log(`\n📂 Processing: ${config.input} (${beforeMB} MB)`);

  try {
    let pipeline = sharp(inputPath).resize(config.width, null, {
      withoutEnlargement: true,
      fit: "inside",
    });

    if (config.format === "webp") {
      pipeline = pipeline.webp({ quality: config.quality, effort: 6 });
    } else if (config.format === "avif") {
      pipeline = pipeline.avif({ quality: config.quality, effort: 6 });
    }

    await pipeline.toFile(outputPath);

    const afterMB = await getFileSizeMB(outputPath);
    const saving =
      beforeMB !== "N/A"
        ? ((1 - afterMB / beforeMB) * 100).toFixed(1)
        : "N/A";
    console.log(`   ✅ Output: ${config.output} (${afterMB} MB) — ${saving}% smaller`);
  } catch (err) {
    console.error(`   ❌ Error processing ${config.input}:`, err.message);
  }
}

async function main() {
  console.log("🚀 Image Optimization Script - Lighthouse Performance Fix");
  console.log("=".repeat(60));

  for (const config of CONFIGS) {
    await optimizeImage(config);
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Optimization complete!");
  console.log("\n📝 Next steps:");
  console.log(
    "   1. Update Hero.tsx: backgroundImage to '/images/kantor-optimized.webp'"
  );
  console.log("   2. Update Tentang.tsx: use <Image> with .webp files");
  console.log(
    "   3. Add <link rel='preload'> for hero image in layout.tsx\n"
  );
}

main();
