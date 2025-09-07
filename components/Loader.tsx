
import React from 'react';

interface LoaderProps {
  message: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow">
      <div className="w-12 h-12 border-4 border-indigo-500 border-dashed rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold text-gray-700">{message}</p>
    </div>
  );
};
