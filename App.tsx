
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { Loader } from './components/Loader';
import { ResultCard } from './components/ResultCard';
import { analyzeImageForColor, generateStyledImage, judgeGeneratedImage, filterUnchangedImages } from './services/geminiService';
import type { ProcessStep } from './types';
import { MAX_RETRIES } from './constants';
import { FallbackCarousel } from './components/FallbackCarousel';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HowItWorks } from './components/HowItWorks';
import { ApiKeyModal } from './components/ApiKeyModal';

const App: React.FC = () => {
  const [fashionItemImage, setFashionItemImage] = useState<string | null>(null);
  const [modelImage, setModelImage] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
  
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [fallbackImages, setFallbackImages] = useState<string[] | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const [sessionApiKey, setSessionApiKey] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);

  const resetState = () => {
    setFashionItemImage(null);
    setModelImage(null);
    setIsLoading(false);
    setError(null);
    setProcessSteps([]);
    setFinalImage(null);
    setFallbackImages(null);
    // Do not reset sessionApiKey, user might want to retry with same images
  };

  const addProcessStep = (step: Omit<ProcessStep, 'id'>) => {
    setProcessSteps(prev => [...prev, { ...step, id: prev.length + 1 }]);
  };

  const updateLastProcessStep = (updates: Partial<Omit<ProcessStep, 'id'>>) => {
    setProcessSteps(prev => {
        if (prev.length === 0) return [];
        const newSteps = [...prev];
        const lastStepIndex = newSteps.length - 1;
        newSteps[lastStepIndex] = { ...newSteps[lastStepIndex], ...updates };
        return newSteps;
    });
  };

  const createCollage = useCallback(async (modelImgSrc: string, itemImgSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not get canvas context'));

        const modelImg = new Image();
        const itemImg = new Image();
        modelImg.crossOrigin = "Anonymous";
        itemImg.crossOrigin = "Anonymous";

        let modelLoaded = false;
        let itemLoaded = false;

        const drawCanvas = () => {
            if (modelLoaded && itemLoaded) {
                const modelAspectRatio = modelImg.width / modelImg.height;
                
                // Fixed layout: Model takes up 50% width, Item takes up 50% width
                const canvasHeight = 600;
                const modelCanvasWidth = canvasHeight * modelAspectRatio;
                const finalCanvasWidth = modelCanvasWidth * 2; // Make total width twice the model's scaled width
                
                canvas.width = finalCanvasWidth;
                canvas.height = canvasHeight;

                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw model on the left half
                ctx.drawImage(modelImg, 0, 0, modelCanvasWidth, canvasHeight);

                // Draw item on the right half, centered and scaled
                const itemPanelX = modelCanvasWidth;
                const itemPanelWidth = finalCanvasWidth - modelCanvasWidth;
                const itemAspectRatio = itemImg.width / itemImg.height;
                let itemDrawWidth = itemPanelWidth;
                let itemDrawHeight = itemDrawWidth / itemAspectRatio;
                
                if (itemDrawHeight > canvasHeight) {
                    itemDrawHeight = canvasHeight;
                    itemDrawWidth = itemDrawHeight * itemAspectRatio;
                }
                
                const itemX = itemPanelX + (itemPanelWidth - itemDrawWidth) / 2;
                const itemY = (canvasHeight - itemDrawHeight) / 2;
                
                ctx.drawImage(itemImg, itemX, itemY, itemDrawWidth, itemDrawHeight);
                
                resolve(canvas.toDataURL('image/jpeg'));
            }
        };

        modelImg.onload = () => { modelLoaded = true; drawCanvas(); };
        itemImg.onload = () => { itemLoaded = true; drawCanvas(); };
        modelImg.onerror = reject;
        itemImg.onerror = reject;

        modelImg.src = modelImgSrc;
        itemImg.src = itemImgSrc;
    });
  }, []);

  const createRetryCollage = useCallback(async (modelImgSrc: string, itemImgSrc: string, failedImgSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not get canvas context'));

        const modelImg = new Image();
        const itemImg = new Image();
        const failedImg = new Image();
        modelImg.crossOrigin = "Anonymous";
        itemImg.crossOrigin = "Anonymous";
        failedImg.crossOrigin = "Anonymous";

        let loadedCount = 0;
        const totalImages = 3;

        const drawCanvas = () => {
            if (loadedCount === totalImages) {
                // Layout: Model on left (50% of width), item and failed attempt stacked on right (50% of width)
                const canvasHeight = 800;
                const modelAspectRatio = modelImg.width / modelImg.height;
                const modelCanvasWidth = canvasHeight * modelAspectRatio;
                const finalCanvasWidth = modelCanvasWidth * 2;
                const rightPanelWidth = finalCanvasWidth - modelCanvasWidth;


                canvas.width = finalCanvasWidth;
                canvas.height = canvasHeight;
                
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw model on the left half
                ctx.drawImage(modelImg, 0, 0, modelCanvasWidth, canvasHeight);
                
                // Draw Item and Failed Image on the right, stacked
                const itemPanelX = modelCanvasWidth;
                const itemDisplayHeight = canvasHeight / 2;
                const failedDisplayHeight = canvasHeight / 2;
                
                ctx.drawImage(itemImg, itemPanelX, 0, rightPanelWidth, itemDisplayHeight);
                ctx.drawImage(failedImg, itemPanelX, itemDisplayHeight, rightPanelWidth, failedDisplayHeight);
                
                resolve(canvas.toDataURL('image/jpeg'));
            }
        };
        
        const onImageLoad = () => {
            loadedCount++;
            drawCanvas();
        };

        modelImg.onload = onImageLoad;
        itemImg.onload = onImageLoad;
        failedImg.onload = onImageLoad;
        modelImg.onerror = reject;
        itemImg.onerror = reject;
        failedImg.onerror = reject;

        modelImg.src = modelImgSrc;
        itemImg.src = itemImgSrc;
        failedImg.src = failedImgSrc;
    });
  }, []);

  const cropImageToModelView = useCallback(async (base64Image: string): Promise<string> => {
     return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject('Canvas context not found');

            // The collage places the model on the left 50% of the canvas
            const cropWidth = img.width / 2;
            const cropHeight = img.height;
            canvas.width = cropWidth;
            canvas.height = cropHeight;
            
            // Draw the left half of the source image onto the new canvas
            ctx.drawImage(img, 0, 0, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
            
            resolve(canvas.toDataURL('image/jpeg'));
        };
        img.onerror = reject;
        img.src = base64Image;
    });
  }, []);

  const handleGenerate = async (overrideApiKey?: string) => {
    if (!fashionItemImage || !modelImage) {
      setError('Please provide both a fashion item and a models or your image.');
      return;
    }
    
    const apiKeyToUse = overrideApiKey || sessionApiKey;

    setIsLoading(true);
    setError(null);
    setProcessSteps([]);
    setFinalImage(null);
    setFallbackImages(null);
    const generatedImagesHistory: string[] = [];

    try {
      // 1. Analyze Color
      addProcessStep({ status: 'processing', title: 'Analyzing Fashion Item', description: 'AI is extracting precise color and texture details.' });
      const colorDescription = await analyzeImageForColor(fashionItemImage, apiKeyToUse);
      updateLastProcessStep({ status: 'complete', description: `Analysis complete. Item description: ${colorDescription}` });
      
      // 2. Create Initial Collage
      addProcessStep({ status: 'processing', title: 'Preparing Images', description: 'Creating an image collage for the AI stylist.' });
      let collageBase64 = await createCollage(modelImage, fashionItemImage);
      updateLastProcessStep({ status: 'complete', title: 'Collage Created', description: 'Images are ready for styling.', imageUrl: collageBase64 });
      
      let currentGeneratedImage = '';
      let judgementFeedback = '';
      let isAccepted = false;

      for (let i = 0; i < MAX_RETRIES; i++) {
        const attempt = i + 1;

        if (i > 0 && currentGeneratedImage) {
            addProcessStep({ status: 'processing', title: `Preparing Retry Attempt ${attempt}`, description: 'Creating a new collage with the failed image for context.' });
            collageBase64 = await createRetryCollage(modelImage, fashionItemImage, currentGeneratedImage);
            updateLastProcessStep({ status: 'complete', title: `Retry Collage Created`, description: 'New collage is ready.', imageUrl: collageBase64 });
        }
        
        // 3. Generate Image with Nano Banana
        addProcessStep({ status: 'processing', title: `AI Styling (Attempt ${attempt}/${MAX_RETRIES})`, description: 'The AI is dressing the model. This may take a moment.' });
        
        const generatedParts = await generateStyledImage(collageBase64, colorDescription, judgementFeedback, apiKeyToUse);
        
        const imagePart = generatedParts.find(part => part.inlineData);
        if (!imagePart?.inlineData) {
          const textPart = generatedParts.find(part => part.text);
          let errorMessage = 'AI failed to generate an image.';
          if (textPart?.text) {
            errorMessage += ` Model's text response: "${textPart.text.trim()}"`;
          }
          throw new Error(errorMessage);
        }
        const uncroppedGeneratedImage = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        generatedImagesHistory.push(uncroppedGeneratedImage); // Store each attempt
        updateLastProcessStep({ status: 'complete', title: `Styling Attempt ${attempt} Complete`, description: 'Generated a new image.', imageUrl: uncroppedGeneratedImage });

        // 3.5 Crop the image before sending to judge
        const croppedImageForJudge = await cropImageToModelView(uncroppedGeneratedImage);
        currentGeneratedImage = uncroppedGeneratedImage; // Keep the full image for retries

        // 4. Judge the image
        addProcessStep({ status: 'processing', title: `Quality Check (Attempt ${attempt})`, description: 'The AI Judge is reviewing the result for accuracy.' });
        const { decision, feedback } = await judgeGeneratedImage(fashionItemImage, croppedImageForJudge, colorDescription, apiKeyToUse);

        if (decision.toLowerCase() === 'accept') {
          isAccepted = true;
          updateLastProcessStep({ status: 'complete', title: 'Quality Check Passed', description: `Judge's verdict: Accepted. ${feedback}` });
          break;
        } else {
          judgementFeedback = feedback;
          updateLastProcessStep({ status: 'warning', title: `Quality Check Failed`, description: `Judge's feedback for retry: ${feedback}` });
          if (i === MAX_RETRIES - 1) {
             addProcessStep({ status: 'error', title: 'Final Attempt Failed', description: 'The AI Judge did not accept the final image.' });
          }
        }
      }
      
      if (isAccepted) {
        const finalCroppedImage = await cropImageToModelView(currentGeneratedImage);
        setFinalImage(finalCroppedImage);
      } else {
        // FALLBACK LOGIC: Filter unchanged images and let the user choose from the successful ones.
        addProcessStep({
          status: 'processing',
          title: 'Initiating fallback check',
          description: 'The AI Judge was inconclusive. Checking if any attempts were successful...'
        });

        if (generatedImagesHistory.length > 0 && modelImage) {
          const changedImages = await filterUnchangedImages(modelImage, generatedImagesHistory, apiKeyToUse);

          if (changedImages.length > 0) {
            updateLastProcessStep({
              status: 'complete',
              title: 'Choose the Best Attempt',
              description: 'The AI Judge couldn\'t decide. Please review the generated images and select your favorite.'
            });
            const croppedFallbackImages = await Promise.all(
              changedImages.map(img => cropImageToModelView(img))
            );
            setFallbackImages(croppedFallbackImages);
          } else {
            updateLastProcessStep({
              status: 'error',
              title: 'All Attempts Failed',
              description: 'The AI was unable to change the model\'s clothing in any attempt.'
            });
            setError("We couldn't get a perfect result. Please try again with a clearer or different photo of the model for better results.");
          }
        } else {
          updateLastProcessStep({
            status: 'error',
            title: 'Fallback Failed',
            description: 'No images were generated to choose from.'
          });
          setError("We couldn't get a perfect result. Please try again with a clearer or different photo of the model for better results.");
        }
      }

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      if (errorMessage.includes('429') && (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.toLowerCase().includes('quota'))) {
        setError('The default API quota has been exceeded. Please provide your own key to continue.');
        updateLastProcessStep({ status: 'error', title: 'API Quota Exceeded', description: 'The default API key has hit its usage limit.' });
        setShowApiKeyModal(true);
      } else {
        setError(`Generation failed: ${errorMessage}`);
        addProcessStep({ status: 'error', title: 'Process Failed', description: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeySubmit = (key: string) => {
    const trimmedKey = key.trim();
    setSessionApiKey(trimmedKey);
    setShowApiKeyModal(false);
    // Pass the key directly to retry the generation, avoiding state update race conditions.
    handleGenerate(trimmedKey);
  };

  const isGenerateDisabled = !fashionItemImage || !modelImage || isLoading;
  const showResultsView = processSteps.length > 0;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Header onHowItWorksClick={() => setShowHowItWorks(true)} onLogoClick={resetState} />
      {showHowItWorks && <HowItWorks onClose={() => setShowHowItWorks(false)} />}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSubmit={handleApiKeySubmit}
      />
      <main className="w-full max-w-6xl mx-auto p-4 sm:p-8 flex-grow flex items-center">
        {showResultsView ? (
          // Results View
           <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="flex flex-col gap-6">
                 <h2 className="text-2xl font-bold text-center">
                    {fallbackImages ? "Review Attempts" : "Final Result"}
                </h2>
                 {isLoading && <Loader message="AI is working its magic..." />}
                 {error && !finalImage && !fallbackImages && <p className="text-red-500 bg-red-100 p-3 rounded-md text-center">{error}</p>}
                
                {finalImage && (
                  <div className="bg-white p-4 rounded-xl shadow-lg border">
                    <img src={finalImage} alt="Final styled model" className="rounded-lg w-full" />
                    <a
                      href={finalImage}
                      download="ai-styled-fashion.jpg"
                      className="mt-4 w-full inline-block bg-orange-500 text-white text-center font-semibold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Download Image
                    </a>
                  </div>
                )}
                {fallbackImages && (
                    <FallbackCarousel images={fallbackImages} />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-center mb-4">Generation Process</h2>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    {processSteps.map((step) => <ResultCard key={step.id} step={step} />)}
                </div>
              </div>
            </div>
             <div className="text-center mt-8">
                <button onClick={resetState} className="bg-gray-800 text-white font-semibold py-3 px-8 rounded-lg hover:bg-black transition-colors">
                  Start Over
                </button>
              </div>
           </div>
        ) : (
          // Input View
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Card: Title and Description */}
            <div className="h-full bg-white p-8 rounded-2xl shadow-xl border flex flex-col justify-center shine-effect">
              <h1 className="text-4xl sm:text-5xl font-bold text-black leading-tight">
                  Virtual try-on in a <span className="relative inline-block text-orange-500">
                    snap.
                    <svg className="absolute -bottom-2 left-0 w-full h-auto" viewBox="0 0 100 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 6C12.6667 1.33333 33.5 -2.5 50.5 6C67.5 14.5 86.1667 9.83333 98 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  </span>
              </h1>
              <p className="text-lg text-gray-600 mt-4">
                  Upload a fashion item and a model photo. Our AI will handle the rest.
              </p>
                <div className="mt-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 text-orange-500">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black">Upload Your Item</h3>
                      <p className="text-gray-600">Provide a photo of any clothing item from an online store or your own closet.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 text-orange-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black">Provide a Model</h3>
                      <p className="text-gray-600">Upload a photo of yourself or a model you'd want. Fore best results, provide a clear, front-facing photo.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 text-orange-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black">See the Magic</h3>
                      <p className="text-gray-600">Our AI generates a new image, and as it does allows you to view the entire generation and judging process.</p>
                    </div>
                  </div>
                </div>
            </div>
            
            {/* Right Card: Uploader */}
            <div className="w-full bg-white p-8 rounded-2xl shadow-xl border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Step 1 */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-500 text-white font-bold text-lg">1</div>
                    <h2 className="text-xl font-semibold text-black">Upload Fashion Item</h2>
                  </div>
                  <ImageUploader
                      onImageUpload={setFashionItemImage} 
                      existingImage={fashionItemImage} 
                      label="Upload Item Image"
                  />
                </div>
                
                {/* Step 2 */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-500 text-white font-bold text-lg">2</div>
                    <h2 className="text-xl font-semibold text-black">Upload Model Photo</h2>
                  </div>
                  <ImageUploader
                      onImageUpload={setModelImage} 
                      existingImage={modelImage} 
                      label="Upload Model's/Your Photo"
                  />
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                <div className="flex items-center gap-3 mb-4 justify-center">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-500 text-white font-bold text-lg">3</div>
                    <h2 className="text-xl font-semibold text-black">Start Styling</h2>
                </div>
                
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                <button
                    onClick={() => handleGenerate()}
                    disabled={isGenerateDisabled}
                    className="mt-4 bg-orange-500 text-white font-bold py-4 px-12 rounded-lg text-lg hover:bg-orange-600 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
                >
                    {isLoading ? 'Generating...' : 'Start Styling'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
