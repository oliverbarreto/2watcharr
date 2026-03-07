const sharp = require("sharp")
const toIco = require("to-ico")
const fs = require("fs")
const path = require("path")

async function convertToIco() {
  const inputPath = path.join(__dirname, "public", "2watcharr-icon-v1.png")
  const outputPath = path.join(__dirname, "public", "favicon.ico")

  // Create multiple sizes for better browser compatibility
  const sizes = [16, 32, 48]
  const buffers = await Promise.all(
    sizes.map((size) => sharp(inputPath).resize(size, size).png().toBuffer()),
  )

  // Convert to ICO format
  const ico = await toIco(buffers)

  // Write the ICO file
  fs.writeFileSync(outputPath, ico)
  console.log(`Successfully created ${outputPath}`)
}

convertToIco().catch(console.error)
