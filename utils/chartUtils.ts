
import React from 'react';

/**
 * Extracts the SVG markup from a DOM element referenced by a React ref.
 * This is useful for capturing chart components for PDF export.
 * @param ref A React ref pointing to a container div of an SVG element.
 * @returns A promise that resolves to the SVG's outerHTML string, or an empty string if not found.
 */
export const getSvgFromRef = (ref: React.RefObject<HTMLDivElement>): Promise<string> => {
  return new Promise(resolve => {
    // A timeout allows the chart to fully render before we try to grab the SVG.
    setTimeout(() => {
      if (ref.current) {
        const svgElement = ref.current.querySelector('svg');
        if (svgElement) {
          const serializer = new XMLSerializer();
          let svgString = serializer.serializeToString(svgElement);
          // Inject a default font-family for text elements to improve compatibility with pdfmake.
          svgString = svgString.replace(/<text/g, '<text style="font-family: Roboto, sans-serif;"');
          resolve(svgString);
        } else {
            resolve('');
        }
      } else {
        resolve('');
      }
    }, 500); // 500ms delay is generally safe for chart rendering.
  });
};
