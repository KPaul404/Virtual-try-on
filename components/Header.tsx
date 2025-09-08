import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 bg-stone-100 bg-opacity-90 backdrop-blur-sm border-b border-gray-200 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold text-black">
            Style<span className="text-orange-500">Snap</span>
          </h1>
        </div>
      </div>
    </header>
  );
};