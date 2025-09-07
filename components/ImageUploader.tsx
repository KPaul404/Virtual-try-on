
import React, { useCallback, useRef } from 'react';

interface ImageUploaderProps {
  onImageUpload: (base64: string) => void;
  existingImage: string | null;
  label: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, existingImage, label }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageUpload('');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      {existingImage ? (
        <div className="relative w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex justify-center items-center group">
          <img src={existingImage} alt="Uploaded preview" className="max-w-full max-h-full object-contain rounded-md" />
           <button 
             onClick={handleClearImage} 
             className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
             aria-label="Remove image"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
        </div>
      ) : (
        <button
          onClick={handleUploadClick}
          className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col justify-center items-center text-gray-500 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="mt-2 font-semibold">{label}</span>
        </button>
      )}
    </div>
  );
};
