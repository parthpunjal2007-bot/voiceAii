const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const openaiService = require('../services/openaiService');
const stabilityService = require('../services/stabilityService');
const replicateService = require('../services/replicateService');

// Mock database (replace with MongoDB in production)
const generations = new Map();

const saveGeneration = (generation) => {
  const id = uuidv4();
  const timestamp = new Date().toISOString();
  const newGeneration = {
    id,
    ...generation,
    created_at: timestamp,
    updated_at: timestamp
  };
  generations.set(id, newGeneration);
  return newGeneration;
};

const getGeneration = (id) => {
  return generations.get(id);
};

const getAllGenerations = (limit = 50) => {
  return Array.from(generations.values())
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
};

exports.generateImage = async (req, res) => {
  try {
    const {
      prompt,
      model = 'dall-e-3',
      negative_prompt = '',
      width = 1024,
      height = 1024,
      style = 'vivid',
      quality = 'standard',
      num_images = 1,
      cfg_scale = 7,
      steps = 50,
      seed
    } = req.body;

    const generationId = uuidv4();
    
    // Immediately respond with generation ID
    res.json({
      generation_id: generationId,
      status: 'processing',
      message: 'Generation started',
      estimated_time: 30 // seconds
    });

    // Process generation asynchronously
    processGenerationAsync(generationId, {
      type: 'image',
      prompt,
      model,
      negative_prompt,
      width,
      height,
      style,
      quality,
      num_images,
      cfg_scale,
      steps,
      seed
    });

  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ 
      error: 'Generation failed',
      details: error.message 
    });
  }
};

exports.generateVideo = async (req, res) => {
  try {
    const {
      prompt,
      model = 'sora-like',
      duration = 5,
      fps = 24,
      width = 1024,
      height = 576,
      style = 'realistic',
      negative_prompt = '',
      seed
    } = req.body;

    const generationId = uuidv4();
    
    res.json({
      generation_id: generationId,
      status: 'processing',
      message: 'Video generation started',
      estimated_time: 120 // seconds
    });

    processGenerationAsync(generationId, {
      type: 'video',
      prompt,
      model,
      duration,
      fps,
      width,
      height,
      style,
      negative_prompt,
      seed
    });

  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({ 
      error: 'Video generation failed',
      details: error.message 
    });
  }
};

exports.editImage = async (req, res) => {
  try {
    const { prompt, mask_prompt } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const generationId = uuidv4();
    
    res.json({
      generation_id: generationId,
      status: 'processing',
      message: 'Image editing started'
    });

    // Process image editing asynchronously
    // This would involve sending to DALL-E 2 inpainting or similar

  } catch (error) {
    console.error('Image edit error:', error);
    res.status(500).json({ error: 'Image editing failed' });
  }
};

exports.extendImage = async (req, res) => {
  try {
    const { prompt, direction = 'outward', extension = 1.5 } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const generationId = uuidv4();
    
    res.json({
      generation_id: generationId,
      status: 'processing',
      message: 'Image extension started'
    });

    // Process image extension asynchronously
    // This would use Outpainting or similar technique

  } catch (error) {
    console.error('Image extend error:', error);
    res.status(500).json({ error: 'Image extension failed' });
  }
};

exports.batchGenerate = async (req, res) => {
  try {
    const { prompts, model, ...params } = req.body;
    
    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return res.status(400).json({ error: 'Prompts array is required' });
    }

    if (prompts.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 prompts per batch' });
    }

    const batchId = uuidv4();
    const batchPromises = prompts.map((prompt, index) => {
      const generationId = `${batchId}-${index}`;
      return processGenerationAsync(generationId, {
        type: 'image',
        prompt,
        model,
        ...params
      });
    });

    res.json({
      batch_id: batchId,
      status: 'processing',
      message: `Processing ${prompts.length} generations`,
      generation_ids: prompts.map((_, index) => `${batchId}-${index}`)
    });

  } catch (error) {
    console.error('Batch generation error:', error);
    res.status(500).json({ error: 'Batch generation failed' });
  }
};

exports.getGenerations = async (req, res) => {
  try {
    const { limit = 50, type } = req.query;
    let allGenerations = getAllGenerations(parseInt(limit));
    
    if (type) {
      allGenerations = allGenerations.filter(gen => gen.type === type);
    }
    
    res.json({
      generations: allGenerations,
      count: allGenerations.length,
      total: generations.size
    });
  } catch (error) {
    console.error('Get generations error:', error);
    res.status(500).json({ error: 'Failed to retrieve generations' });
  }
};

exports.getGenerationById = async (req, res) => {
  try {
    const { id } = req.params;
    const generation = getGeneration(id);
    
    if (!generation) {
      return res.status(404).json({ error: 'Generation not found' });
    }
    
    res.json(generation);
  } catch (error) {
    console.error('Get generation error:', error);
    res.status(500).json({ error: 'Failed to retrieve generation' });
  }
};

exports.deleteGeneration = async (req, res) => {
  try {
    const { id } = req.params;
    const generation = getGeneration(id);
    
    if (!generation) {
      return res.status(404).json({ error: 'Generation not found' });
    }
    
    // Delete files if they exist
    if (generation.output_path) {
      try {
        fs.unlinkSync(generation.output_path);
      } catch (e) {
        console.warn('Failed to delete file:', e.message);
      }
    }
    
    generations.delete(id);
    res.json({ success: true, message: 'Generation deleted' });
  } catch (error) {
    console.error('Delete generation error:', error);
    res.status(500).json({ error: 'Failed to delete generation' });
  }
};

// Helper function for async processing
async function processGenerationAsync(generationId, params) {
  try {
    let result;
    
    switch (params.model) {
      case 'dall-e-3':
        result = await openaiService.generateImage(params);
        break;
      case 'stable-diffusion-xl':
        result = await stabilityService.generateImage(params);
        break;
      case 'sora-like':
        // This would call a video generation API
        // For demo, we'll simulate it
        result = await simulateVideoGeneration(params);
        break;
      default:
        result = await openaiService.generateImage(params);
    }
    
    const generation = saveGeneration({
      ...params,
      output_url: result.url,
      output_path: result.path,
      status: 'completed',
      completed_at: new Date().toISOString()
    });
    
    console.log(`Generation ${generationId} completed`);
    
    // In production, emit WebSocket event here
    // io.to(generationId).emit('generation_complete', generation);
    
  } catch (error) {
    console.error(`Generation ${generationId} failed:`, error);
    
    const generation = saveGeneration({
      ...params,
      status: 'failed',
      error: error.message,
      failed_at: new Date().toISOString()
    });
    
    // io.to(generationId).emit('generation_failed', generation);
  }
}

async function simulateVideoGeneration(params) {
  // Simulate video generation delay
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // In production, this would call actual video generation API
  return {
    url: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
    path: null
  };
}