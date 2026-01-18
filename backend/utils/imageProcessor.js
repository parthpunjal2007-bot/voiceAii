const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

class ImageProcessor {
  static async resize(imageBuffer, width, height) {
    return sharp(imageBuffer)
      .resize(width, height, { fit: 'cover' })
      .toBuffer();
  }

  static async convertFormat(imageBuffer, format) {
    return sharp(imageBuffer)
      .toFormat(format)
      .toBuffer();
  }

  static async applyWatermark(imageBuffer, watermarkText) {
    const svg = Buffer.from(`
      <svg width="200" height="50">
        <style>
          .text { fill: white; font-family: Arial; font-size: 12px; opacity: 0.5; }
        </style>
        <text x="10" y="30" class="text">${watermarkText}</text>
      </svg>
    `);

    return sharp(imageBuffer)
      .composite([{ input: svg, gravity: 'southeast' }])
      .toBuffer();
  }

  static async extractMetadata(imageBuffer) {
    const metadata = await sharp(imageBuffer).metadata();
    return {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      size: imageBuffer.length,
      channels: metadata.channels,
      hasAlpha: metadata.hasAlpha
    };
  }

  static async createThumbnail(imageBuffer, size = 256) {
    return sharp(imageBuffer)
      .resize(size, size, { fit: 'inside' })
      .toBuffer();
  }

  static async saveImage(buffer, subfolder = 'images') {
    const filename = `${uuidv4()}.png`;
    const filepath = path.join(__dirname, '..', 'uploads', subfolder, filename);
    
    fs.writeFileSync(filepath, buffer);
    
    return {
      filename,
      filepath,
      url: `/uploads/${subfolder}/${filename}`
    };
  }
}

module.exports = ImageProcessor;