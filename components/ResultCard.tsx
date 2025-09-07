
import React from 'react';
import type { ProcessStep } from '../types';

interface ResultCardProps {
    step: ProcessStep;
}

const statusStyles = {
    processing: {
        icon: (
            <div className="w-4 h-4 border-2 border-blue-500 border-dashed rounded-full animate-spin"></div>
        ),
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-800'
    },
    complete: {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
        ),
        bgColor: 'bg-green-50',
        textColor: 'text-green-800'
    },
    warning: {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
        ),
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-800'
    },
    error: {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
        ),
        bgColor: 'bg-red-50',
        textColor: 'text-red-800'
    }
};

export const ResultCard: React.FC<ResultCardProps> = ({ step }) => {
    const { icon, bgColor, textColor } = statusStyles[step.status];

    return (
        <div className={`p-4 rounded-lg shadow-md flex items-start space-x-4 ${bgColor} ${textColor}`}>
            <div className="flex-shrink-0 pt-1">{icon}</div>
            <div className="flex-grow">
                <h4 className="font-bold">{step.title}</h4>
                <p className="text-sm">{step.description}</p>
                {step.imageUrl && (
                    <div className="mt-2">
                        <img src={step.imageUrl} alt={step.title} className="rounded-md max-h-48 w-auto" />
                    </div>
                )}
            </div>
        </div>
    );
};
