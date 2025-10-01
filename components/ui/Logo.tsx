

import React from 'react';

// Props for the SVG string function
interface LogoProps {
    width?: number;
    height?: number;
    color?: string;
    textColor?: string;
}

// SVG React component for use in the UI.
export const MetalliQIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M4 20V8C4 5.79086 5.79086 4 8 4H16C18.2091 4 20 5.79086 20 8V20L16 17L12 20L8 17L4 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M8 9H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 13H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


// SVG string function for PDFMake
export const MetalliQLogo = ({ width = 120, height = 32, color = '#1A538C', textColor = '#2D3748' }: LogoProps): string => {
    // Inlined SVG for PDF compatibility, replicating the new logo design.
     const iconSvg = `
        <g transform="scale(1.5) translate(2, 2)">
            <path d="M4 20V8C4 5.79086 5.79086 4 8 4H16C18.2091 4 20 5.79086 20 8V20L16 17L12 20L8 17L4 20Z" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <path d="M8 9H16" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 13H16" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </g>`;
    
    return `
        <svg width="${width}" height="${height}" viewBox="0 0 160 40" xmlns="http://www.w3.org/2000/svg">
            <g>
                ${iconSvg}
                <text x="45" y="28" font-family="Poppins, sans-serif" font-size="24" font-weight="bold" fill="${textColor}">
                    MetalliQ
                </text>
            </g>
        </svg>
    `;
};