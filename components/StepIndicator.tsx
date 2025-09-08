import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: 'Add Item' },
  { id: 2, name: 'Add Model' },
  { id: 3, name: 'Generate' },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center justify-center">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
            {step.id < currentStep ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-orange-500" />
                </div>
                <a href="#" className="relative flex h-8 w-8 items-center justify-center bg-orange-500 rounded-full hover:bg-orange-600">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
                  </svg>
                </a>
              </>
            ) : step.id === currentStep ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <a href="#" className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-orange-500 bg-white" aria-current="step">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-500" aria-hidden="true" />
                </a>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <a href="#" className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:border-gray-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" aria-hidden="true" />
                </a>
              </>
            )}
            <span className="absolute top-10 w-max -translate-x-1/2 text-center text-sm font-medium text-black">{step.name}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
};