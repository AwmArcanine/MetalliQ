import React from 'react';

const futuristicSpinnerStyles = `
  @keyframes rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes rotate-reverse {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(-360deg); }
  }
  .spinner-ring {
    animation: rotate 2s linear infinite;
  }
  .spinner-ring-inner {
    animation: rotate-reverse 3s linear infinite;
  }
`;

const FuturisticSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <style>{futuristicSpinnerStyles}</style>
      <div className="relative w-24 h-24">
        <svg
          className="spinner-ring absolute top-0 left-0 w-full h-full"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="spinner-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-brand-accent)" stopOpacity="0" />
              <stop offset="100%" stopColor="var(--color-brand-accent)" stopOpacity="1" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#spinner-gradient-1)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
        <svg
          className="spinner-ring-inner absolute top-0 left-0 w-full h-full"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="spinner-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-brand-secondary)" stopOpacity="0" />
              <stop offset="100%" stopColor="var(--color-brand-secondary)" stopOpacity="1" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke="url(#spinner-gradient-2)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="text-md font-medium text-[var(--text-primary)] tracking-wider">Analyzing... Please wait.</span>
    </div>
  );
};

export default FuturisticSpinner;
