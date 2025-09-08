import React from 'react';

const steps = [
  {
    step: 1,
    title: 'Upload Fashion Item',
    description: 'Simply upload your fashion item image or a product photo from an e-commerce store.',
  },
  {
    step: 2,
    title: 'Upload Model Photo',
    description: 'Provide a photo of the model you want to see wearing the item.',
  },
  {
    step: 3,
    title: 'Start Styling',
    description: 'Our AI will generate a photorealistic image of the model wearing the fashion item.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <div className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-black mb-12 sm:mb-16">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {steps.map((item) => (
            <div key={item.step} className="p-2">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-orange-500 text-white font-bold text-2xl mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};