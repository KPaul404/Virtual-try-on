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
        className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 max-w-3xl w-full relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale" 
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
        <h2 className="text-3xl font-bold text-center text-black mb-10">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-orange-500 text-white font-bold text-2xl mx-auto mb-4 border-4 border-orange-200">1</div>
            <h3 className="text-xl font-semibold mb-2">Upload Fashion Item</h3>
            <p className="text-gray-600 text-sm">Simply upload your fashion item image or a product photo from an e-commerce store.</p>
          </div>
          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-orange-500 text-white font-bold text-2xl mx-auto mb-4 border-4 border-orange-200">2</div>
            <h3 className="text-xl font-semibold mb-2">Upload Model Photo</h3>
            <p className="text-gray-600 text-sm">Provide a photo of you or the model you want to see wearing the item.</p>
          </div>
          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-orange-500 text-white font-bold text-2xl mx-auto mb-4 border-4 border-orange-200">3</div>
            <h3 className="text-xl font-semibold mb-2">Start Styling</h3>
            <p className="text-gray-600 text-sm">Our AI will generate an image of you or the model wearing the fashion item.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
