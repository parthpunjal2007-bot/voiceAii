const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
  }

  async generateImage(params) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const {
      prompt,
      model = 'dall-e-3',
      size = '1024x1024',
      quality = 'standard',
      style = 'vivid',
      num_images = 1
    } = params;

    try {
      const response = await axios.post(
        `${this.baseURL}/images/generations`,
        {
          model,
          prompt,
          n: Math.min(num_images, 4), // OpenAI limits to 4
          size: this.mapSize(size),
          quality,
          style
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const images = response.data.data;
      const savedImages = [];

      for (const image of images) {
        const imageUrl = image.url;
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        
        const filename = `${uuidv4()}.png`;
        const filepath = path.join(__dirname, '..', 'uploads', 'images', filename);
        
        fs.writeFileSync(filepath, imageResponse.data);
        
        savedImages.push({
          url: `/uploads/images/${filename}`,
          path: filepath,
          revised_prompt: image.revised_prompt
        });
      }

      return {
        success: true,
        images: savedImages,
        model: 'dall-e-3'
      };

    } catch (error) {
      console.error('OpenAI API error:', error.response?.data || error.message);
      throw new Error(`OpenAI generation failed: ${error.message}`);
    }
  }

  mapSize(size) {
    const sizeMap = {
      '256x256': '256x256',
      '512x512': '512x512',
      '1024x1024': '1024x1024',
      '1024x1792': '1024x1792',
      '1792x1024': '1792x1024'
    };
    return sizeMap[size] || '1024x1024';
  }

  async editImage(imagePath, maskPath, prompt) {
    // Implementation for image editing
    throw new Error('Image editing not implemented');
  }

  async createVariation(imagePath, n = 1) {
    // Implementation for image variations
    throw new Error('Image variations not implemented');
  }
}

module.exports = new OpenAIService();