
import React, { useState } from 'react';

interface FallbackCarouselProps {
  images: string[];
}

export const FallbackCarousel: React.FC<FallbackCarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const currentImage = images[currentIndex];

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold text-center mb-4">The Judge was tough! Pick your favorite.</h3>
      <div className="relative group">
        <img src={currentImage} alt={`Fallback attempt ${currentIndex + 1}`} className="rounded-lg w-full" />
        {images.length > 1 && (
            <>
                {/* Left Arrow */}
                <button 
                    onClick={goToPrevious} 
                    className="absolute top-1/2 left-3 transform -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full p-2 hover:bg-opacity-60 transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Previous image"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                {/* Right Arrow */}
                <button 
                    onClick={goToNext} 
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full p-2 hover:bg-opacity-60 transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Next image"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </>
        )}
      </div>
      <p className="text-center text-gray-600 mt-2 font-semibold">
        Image {currentIndex + 1} of {images.length}
      </p>
      <a
        href={currentImage}
        download={`ai-styled-fashion-attempt-${currentIndex + 1}.jpg`}
        className="mt-4 w-full inline-block bg-indigo-600 text-white text-center font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Download This Image
      </a>
    </div>
  );
};
