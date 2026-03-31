const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

// Crear un SVG simple con el ícono de gastos
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <style>
      .bg { fill: #1d4ed8; }
      .icon { fill: white; }
    </style>
  </defs>
  <rect class="bg" width="512" height="512" rx="120"/>
  <circle cx="180" cy="220" r="35" class="icon"/>
  <rect x="230" y="180" width="60" height="120" rx="8" class="icon"/>
  <path d="M 256 340 Q 200 360 140 340 L 160 380 Q 210 400 260 400 Q 310 400 360 380 L 380 340 Q 320 360 256 340" class="icon"/>
</svg>
`

const publicDir = path.join(__dirname, 'public')

// Generar iconos de diferentes tamaños
const sizes = [192, 512]

async function generateIcons() {
  try {
    for (const size of sizes) {
      await sharp(Buffer.from(svgIcon))
        .resize(size, size)
        .png()
        .toFile(path.join(publicDir, `icon-${size}.png`))

      console.log(`✅ Generado icon-${size}.png`)
    }
    console.log('✅ Todos los iconos han sido generados')
  } catch (error) {
    console.error('❌ Error generando iconos:', error)
  }
}

generateIcons()
