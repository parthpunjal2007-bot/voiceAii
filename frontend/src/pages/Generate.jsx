import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  Settings,
  Wand2,
  Palette,
  Download,
  Share2,
  RefreshCw,
  Layers,
  Zap,
  Clock,
  Hash,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { io } from 'socket.io-client';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(90deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 0 auto;
`;

const GeneratorGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const PromptSection = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  padding: 2rem;
  height: fit-content;
`;

const ControlsSection = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  padding: 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
`;

const PromptTextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  color: white;
  font-size: 1rem;
  font-family: var(--font-sans);
  resize: vertical;
  outline: none;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const PromptActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius);
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ModelSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const ModelButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.active ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.active ? 'var(--primary)' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: var(--radius);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.active ? 'var(--primary-dark)' : 'rgba(255, 255, 255, 0.2)'};
  }
`;

const ControlGroup = styled.div`
  margin-bottom: 2rem;
`;

const ControlLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
`;

const ControlValue = styled.span`
  color: var(--primary);
  font-weight: 600;
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--primary);
    cursor: pointer;
    border: 3px solid rgba(255, 255, 255, 0.1);
    box-shadow: var(--shadow);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius);
  color: white;
  font-size: 0.875rem;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: var(--primary);
  }

  option {
    background: var(--gray-800);
    color: white;
  }
`;

const AdvancedControls = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius);
  padding: 1rem;
  margin-top: 2rem;
`;

const AdvancedHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 0.5rem;
`;

const AdvancedContent = styled(motion.div)`
  overflow: hidden;
`;

const StylePresets = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
`;

const StyleButton = styled.button`
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius);
  color: white;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: var(--primary);
  }

  &.active {
    background: var(--primary);
    border-color: var(--primary);
  }
`;

const GenerateButton = styled(motion.button)`
  width: 100%;
  padding: 1.25rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border: none;
  border-radius: var(--radius-lg);
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  margin-top: 2rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PreviewSection = styled.div`
  grid-column: 1 / -1;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  padding: 2rem;
  margin-top: 2rem;
`;

const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const PreviewCard = styled(motion.div)`
  background: rgba(0, 0, 0, 0.3);
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
  aspect-ratio: 1;
  cursor: pointer;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const PreviewOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  opacity: 0;
  transition: opacity 0.3s ease;

  ${PreviewCard}:hover & {
    opacity: 1;
  }
`;

const PreviewActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const IconButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--primary);
    transform: scale(1.1);
  }
`;

const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const PromptExamples = styled.div`
  margin-top: 1.5rem;
`;

const ExampleList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
`;

const ExampleButton = styled.button`
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border-color: var(--primary);
  }
`;

function Generate() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState('dall-e-3');
  const [generationType, setGenerationType] = useState('image');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generations, setGenerations] = useState([]);
  const [socket, setSocket] = useState(null);

  // Generation parameters
  const [parameters, setParameters] = useState({
    width: 1024,
    height: 1024,
    quality: 'standard',
    style: 'vivid',
    steps: 50,
    cfgScale: 7,
    seed: null,
    negativePrompt: '',
    batchSize: 1
  });

  const modelOptions = [
    { id: 'dall-e-3', name: 'DALL-E 3', type: 'image', description: 'Most advanced image model' },
    { id: 'stable-diffusion-xl', name: 'Stable Diffusion XL', type: 'image', description: 'Open source, highly customizable' },
    { id: 'midjourney-v6', name: 'Midjourney V6', type: 'image', description: 'Artistic, creative styles' },
    { id: 'sora-like', name: 'Sora-like', type: 'video', description: 'AI video generation' },
    { id: 'gen-2', name: 'Runway Gen-2', type: 'video', description: 'Text-to-video' },
    { id: 'pika-labs', name: 'Pika Labs', type: 'video', description: 'Simple video generation' }
  ];

  const stylePresets = [
    'Photorealistic', 'Digital Art', 'Anime', '3D Render', 'Oil Painting',
    'Watercolor', 'Sketch', 'Cyberpunk', 'Fantasy', 'Minimalist',
    'Vintage', 'Futuristic', 'Cinematic', 'Surreal', 'Abstract'
  ];

  const promptExamples = [
    'A majestic dragon flying over a medieval castle at sunset, cinematic lighting',
    'Cyberpunk cityscape with neon lights and flying cars, 8k resolution',
    'Beautiful underwater scene with bioluminescent creatures and coral reefs',
    'Ancient temple in the jungle, overgrown with vines, mysterious atmosphere',
    'Astronaut floating in space with Earth in background, detailed spacesuit',
    'Magical forest with glowing mushrooms and fairies, fantasy art style',
    'Futuristic spaceship interior with holographic displays, sci-fi',
    'Samurai warrior in cherry blossom garden, traditional Japanese art',
    'Steampunk laboratory with intricate brass machinery, detailed',
    'Surreal landscape with floating islands and waterfalls, dreamlike'
  ];

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('generation_status', (data) => {
      console.log('Generation status:', data);
    });

    newSocket.on('generation_complete', (data) => {
      setIsGenerating(false);
      setGenerations(prev => [data, ...prev]);
      toast.success('Generation completed!');
    });

    newSocket.on('generation_failed', (data) => {
      setIsGenerating(false);
      toast.error('Generation failed');
    });

    return () => newSocket.close();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await axios.post('/api/v1/generate/image', {
        prompt,
        model: selectedModel,
        ...parameters,
        negative_prompt: parameters.negativePrompt
      });

      const { generation_id } = response.data;
      toast.success('Generation started! Processing...');

      // Poll for generation status
      const checkStatus = async () => {
        try {
          const statusResponse = await axios.get(`/api/v1/generate/history/${generation_id}`);
          if (statusResponse.data.status === 'completed') {
            setGenerations(prev => [statusResponse.data, ...prev]);
            setIsGenerating(false);
            toast.success('Generation completed!');
          } else if (statusResponse.data.status === 'failed') {
            setIsGenerating(false);
            toast.error('Generation failed');
          } else {
            setTimeout(checkStatus, 2000);
          }
        } catch (error) {
          console.error('Status check error:', error);
          setTimeout(checkStatus, 2000);
        }
      };

      setTimeout(checkStatus, 3000);

    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to start generation');
      setIsGenerating(false);
    }
  };

  const handleDownload = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  const handleShare = async (url) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Image',
          text: 'Check out this image I created with AI!',
          url: window.location.origin + url
        });
        toast.success('Shared successfully');
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error('Share failed');
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.origin + url);
      toast.success('Link copied to clipboard');
    }
  };

  const handleExampleClick = (example) => {
    setPrompt(example);
  };

  return (
    <Container>
      <PageHeader>
        <Title>
          <Sparkles size={48} />
          AI Media Creator
        </Title>
        <Subtitle>
          Transform your imagination into stunning images and videos with advanced AI models
        </Subtitle>
      </PageHeader>

      <GeneratorGrid>
        <PromptSection
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeader>
            <Wand2 size={24} />
            <SectionTitle>Describe Your Vision</SectionTitle>
          </SectionHeader>

          <PromptTextArea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to create in detail... (e.g., 'A beautiful sunset over mountains, digital art, 4k, cinematic lighting')"
            rows={8}
          />

          <PromptActions>
            <ActionButton onClick={() => setPrompt('')}>
              <RefreshCw size={16} />
              Clear
            </ActionButton>
            <ActionButton onClick={() => navigator.clipboard.readText().then(setPrompt)}>
              <Layers size={16} />
              Paste
            </ActionButton>
            <ActionButton onClick={() => setPrompt(prompt + ', trending on artstation, 8k, masterpiece')}>
              <Zap size={16} />
              Enhance
            </ActionButton>
          </PromptActions>

          <PromptExamples>
            <h3 style={{ color: 'white', marginBottom: '0.75rem' }}>Try these examples:</h3>
            <ExampleList>
              {promptExamples.slice(0, 4).map((example, index) => (
                <ExampleButton key={index} onClick={() => handleExampleClick(example)}>
                  {example.length > 60 ? example.substring(0, 60) + '...' : example}
                </ExampleButton>
              ))}
            </ExampleList>
          </PromptExamples>
        </PromptSection>

        <ControlsSection
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SectionHeader>
            <Settings size={24} />
            <SectionTitle>Generation Settings</SectionTitle>
          </SectionHeader>

          <ModelSelector>
            {modelOptions
              .filter(model => model.type === generationType)
              .map(model => (
                <ModelButton
                  key={model.id}
                  active={selectedModel === model.id}
                  onClick={() => setSelectedModel(model.id)}
                >
                  {model.name}
                </ModelButton>
              ))}
          </ModelSelector>

          <ControlGroup>
            <ControlLabel>
              <span>Quality</span>
              <ControlValue>{parameters.quality}</ControlValue>
            </ControlLabel>
            <Select
              value={parameters.quality}
              onChange={(e) => setParameters({...parameters, quality: e.target.value})}
            >
              <option value="standard">Standard</option>
              <option value="hd">HD</option>
              <option value="ultra">Ultra HD</option>
            </Select>
          </ControlGroup>

          <ControlGroup>
            <ControlLabel>
              <span>Style</span>
              <ControlValue>{parameters.style}</ControlValue>
            </ControlLabel>
            <Select
              value={parameters.style}
              onChange={(e) => setParameters({...parameters, style: e.target.value})}
            >
              <option value="vivid">Vivid</option>
              <option value="natural">Natural</option>
              <option value="artistic">Artistic</option>
            </Select>
          </ControlGroup>

          <ControlGroup>
            <ControlLabel>
              <span>Dimensions: {parameters.width} x {parameters.height}</span>
            </ControlLabel>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Select
                value={`${parameters.width}x${parameters.height}`}
                onChange={(e) => {
                  const [width, height] = e.target.value.split('x');
                  setParameters({...parameters, width: parseInt(width), height: parseInt(height)});
                }}
                style={{ flex: 1 }}
              >
                <option value="1024x1024">Square (1024x1024)</option>
                <option value="1792x1024">Landscape (1792x1024)</option>
                <option value="1024x1792">Portrait (1024x1792)</option>
                <option value="2048x2048">Large Square (2048x2048)</option>
              </Select>
            </div>
          </ControlGroup>

          <AdvancedControls>
            <AdvancedHeader onClick={() => setShowAdvanced(!showAdvanced)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={20} />
                <span style={{ fontWeight: 600 }}>Advanced Settings</span>
              </div>
              {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </AdvancedHeader>

            {showAdvanced && (
              <AdvancedContent
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
              >
                <div style={{ marginTop: '1rem' }}>
                  <ControlGroup>
                    <ControlLabel>
                      <span>Steps: {parameters.steps}</span>
                    </ControlLabel>
                    <Slider
                      type="range"
                      min="20"
                      max="150"
                      value={parameters.steps}
                      onChange={(e) => setParameters({...parameters, steps: parseInt(e.target.value)})}
                    />
                  </ControlGroup>

                  <ControlGroup>
                    <ControlLabel>
                      <span>CFG Scale: {parameters.cfgScale}</span>
                    </ControlLabel>
                    <Slider
                      type="range"
                      min="1"
                      max="20"
                      step="0.5"
                      value={parameters.cfgScale}
                      onChange={(e) => setParameters({...parameters, cfgScale: parseFloat(e.target.value)})}
                    />
                  </ControlGroup>

                  <ControlGroup>
                    <ControlLabel>
                      <span>Negative Prompt</span>
                    </ControlLabel>
                    <textarea
                      value={parameters.negativePrompt}
                      onChange={(e) => setParameters({...parameters, negativePrompt: e.target.value})}
                      placeholder="What to avoid in the image..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 'var(--radius)',
                        color: 'white',
                        fontSize: '0.875rem',
                        resize: 'vertical',
                        outline: 'none'
                      }}
                    />
                  </ControlGroup>

                  <StylePresets>
                    {stylePresets.map(style => (
                      <StyleButton
                        key={style}
                        onClick={() => setPrompt(prev => `${prev}, ${style.toLowerCase()} style`)}
                      >
                        {style}
                      </StyleButton>
                    ))}
                  </StylePresets>
                </div>
              </AdvancedContent>
            )}
          </AdvancedControls>

          <GenerateButton
            onClick={handleGenerate}
            disabled={isGenerating}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isGenerating ? (
              <>
                <LoadingSpinner />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={24} />
                Generate {generationType === 'image' ? 'Image' : 'Video'}
              </>
            )}
          </GenerateButton>
        </ControlsSection>
      </GeneratorGrid>

      {generations.length > 0 && (
        <PreviewSection>
          <SectionHeader>
            <ImageIcon size={24} />
            <SectionTitle>Generated Media</SectionTitle>
          </SectionHeader>

          <PreviewGrid>
            {generations.slice(0, 6).map((gen, index) => (
              <PreviewCard
                key={index}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {gen.output_url ? (
                  <>
                    <PreviewImage src={gen.output_url} alt={gen.prompt} />
                    <PreviewOverlay>
                      <p style={{
                        color: 'white',
                        fontSize: '0.875rem',
                        marginBottom: '0.5rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {gen.prompt}
                      </p>
                      <PreviewActions>
                        <IconButton onClick={() => handleDownload(gen.output_url)}>
                          <Download size={16} />
                        </IconButton>
                        <IconButton onClick={() => handleShare(gen.output_url)}>
                          <Share2 size={16} />
                        </IconButton>
                      </PreviewActions>
                    </PreviewOverlay>
                  </>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'rgba(255, 255, 255, 0.5)'
                  }}>
                    <LoadingSpinner />
                  </div>
                )}
              </PreviewCard>
            ))}
          </PreviewGrid>
        </PreviewSection>
      )}
    </Container>
  );
}

export default Generate;