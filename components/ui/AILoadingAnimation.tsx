import React, { useState, useEffect } from 'react';

const loadingMessages = [
    "AI is crunching the numbers...",
    "Calibrating ML models...",
    "Analyzing lifecycle impacts...",
    "Simulating supply chain scenarios...",
    "Generating sustainability insights...",
    "Finalizing circularity scores..."
];

const AILoadingAnimation: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
        }, 2000);

        return () => clearInterval(intervalId);
    }, []);

    const futuristicSpinnerStyles = `
      @keyframes rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      @keyframes rotate-reverse { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
      @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(0.95); } }
      .spinner-ring { animation: rotate 3s linear infinite; }
      .spinner-ring-inner { animation: rotate-reverse 4s linear infinite; }
      .spinner-core { animation: pulse 2.5s ease-in-out infinite; }
    `;

    return (
        <div className="flex flex-col items-center justify-center space-y-6 p-8 bg-[var(--color-background)] h-full">
            <style>{futuristicSpinnerStyles}</style>
            <div className="relative w-32 h-32">
                {/* Outer Ring */}
                <svg className="spinner-ring absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100">
                    <defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="var(--color-brand-accent)" stopOpacity="0" /><stop offset="100%" stopColor="var(--color-brand-accent)" stopOpacity="1" /></linearGradient></defs>
                    <circle cx="50" cy="50" r="45" fill="none" stroke="url(#g1)" strokeWidth="3" strokeLinecap="round" />
                </svg>
                {/* Inner Ring */}
                <svg className="spinner-ring-inner absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100">
                    <defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="var(--color-brand-secondary)" stopOpacity="0" /><stop offset="100%" stopColor="var(--color-brand-secondary)" stopOpacity="1" /></linearGradient></defs>
                    <circle cx="50" cy="50" r="35" fill="none" stroke="url(#g2)" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {/* Core */}
                <div className="spinner-core w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-[var(--color-brand-primary)]/10 rounded-full flex items-center justify-center shadow-inner">
                        <svg className="w-10 h-10 text-[var(--color-brand-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m1.5-4.5V21m6-18v1.5m0 15V21m3.75-18v1.5M12 21v-1.5m3.75 0V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
                        </svg>
                    </div>
                </div>
            </div>
            <div className="text-center">
                <p className="text-lg font-semibold text-[var(--text-primary)] tracking-wider">Analyzing...</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1 transition-opacity duration-500">{loadingMessages[messageIndex]}</p>
            </div>
        </div>
    );
};

export default AILoadingAnimation;