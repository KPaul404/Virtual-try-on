import React from 'react';

interface HeaderProps {
  onHowItWorksClick: () => void;
  onLogoClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onHowItWorksClick, onLogoClick }) => {
  return (
    <header className="sticky top-0 bg-stone-200 bg-opacity-90 backdrop-blur-sm border-b border-gray-200 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="flex justify-between items-center py-4">
           <button onClick={onLogoClick} className="flex items-center gap-3 text-2xl font-bold text-black focus:outline-none transition-transform hover:scale-105">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-orange-500">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"  className="text-orange-500 opacity-50" />
                <path d="M2 17L12 22L22 17L12 12L2 17Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"/>
            </svg>
            <h1 className="text-2xl font-bold text-black">
                Style<span className="text-orange-500">Snap</span>
            </h1>
          </button>
          <nav>
            <button onClick={onHowItWorksClick} className="text-gray-600 hover:text-orange-500 font-medium transition-colors">
              How It Works
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};