const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

class StabilityAIService {
  constructor() {
    this.apiKey = process.env.STABILITY_API_KEY;
    this.baseURL = 'https://api.stability.ai/v1';
  }

  async generateImage(params) {
    if (!this.apiKey) {
      throw new Error('Stability AI API key not configured');
    }

    const {
      prompt,
      negative_prompt = '',
      width = 1024,
      height = 1024,
      cfg_scale = 7,
      steps = 50,
      samples = 1,
      style_preset,
      seed
    } = params;

    const engineId = 'stable-diffusion-xl-1024-v1-0';

    try {
      const response = await axios.post(
        `${this.baseURL}/generation/${engineId}/text-to-image`,
        {
          text_prompts: [
            { text: prompt, weight: 1 },
            { text: negative_prompt, weight: -1 }
          ],
          cfg_scale,
          height,
          width,
          steps,
          samples: Math.min(samples, 4),
          style_preset,
          seed
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          responseType: 'json'
        }
      );

      const images = response.data.artifacts;
      const savedImages = [];

      for (const image of images) {
        const filename = `${uuidv4()}.png`;
        const filepath = path.join(__dirname, '..', 'uploads', 'images', filename);
        
        const buffer = Buffer.from(image.base64, 'base64');
        fs.writeFileSync(filepath, buffer);
        
        savedImages.push({
          url: `/uploads/images/${filename}`,
          path: filepath,
          seed: image.seed
        });
      }

      return {
        success: true,
        images: savedImages,
        model: 'stable-diffusion-xl'
      };

    } catch (error) {
      console.error('Stability AI API error:', error.response?.data || error.message);
      throw new Error(`Stability AI generation failed: ${error.message}`);
    }
  }
}

module.exports = new StabilityAIService();