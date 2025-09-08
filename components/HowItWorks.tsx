import React from 'react';

interface HowItWorksProps {
  onClose: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 transition-opacity duration-300" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 max-w-4xl w-full relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
          aria-label="Close how it works"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-3xl font-bold text-center text-black mb-10">Peek Behind the AI Curtain</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center p-6 rounded-lg bg-stone-50 border">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-orange-500 text-white font-bold text-2xl mx-auto mb-4 border-4 border-orange-200">1</div>
            <h3 className="text-xl font-semibold mb-2">Provide Your Images</h3>
            <p className="text-gray-600">Upload a photo of the clothing item you want to try on and a clear, front-facing photo of you or the model you want.</p>
          </div>
          {/* Step 2 */}
          <div className="flex flex-col items-center text-center p-6 rounded-lg bg-stone-50 border">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-orange-500 text-white font-bold text-2xl mx-auto mb-4 border-4 border-orange-200">2</div>
            <h3 className="text-xl font-semibold mb-2">AI Analysis &amp; Prep</h3>
            <p className="text-gray-600">Our first AI analyzes the clothing, capturing every detail like color, texture, and pattern. It then prepares the images for the virtual try-on.</p>
          </div>
          {/* Step 3 */}
          <div className="flex flex-col items-center text-center p-6 rounded-lg bg-stone-50 border">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-orange-500 text-white font-bold text-2xl mx-auto mb-4 border-4 border-orange-200">3</div>
            <h3 className="text-xl font-semibold mb-2">The AI Styling Loop</h3>
            <p className="text-gray-600">A second image generation AI attempts to dress the model. Then, a separate AI Judge scrutinizes the result for accuracy. If it's not perfect, the Judge provides feedback for a retry.</p>
          </div>
          {/* Step 4 */}
          <div className="flex flex-col items-center text-center p-6 rounded-lg bg-stone-50 border">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-orange-500 text-white font-bold text-2xl mx-auto mb-4 border-4 border-orange-200">4</div>
            <h3 className="text-xl font-semibold mb-2">See The Magic Unfold</h3>
            <p className="text-gray-600">Once the AI Judge accepts an image, you get the final result! You can follow the entire fascinating process, including every attempt and the Judge's feedback, while you wait.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
