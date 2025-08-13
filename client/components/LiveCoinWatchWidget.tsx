// @ts-nocheck
import { useEffect } from "react";

export function LiveCoinWatchWidget() {
  useEffect(() => {
    // Load the Live Coin Watch script
    const script = document.createElement('script');
    script.src = 'https://www.livecoinwatch.com/static/lcw-widget.js';
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div 
        className="livecoinwatch-widget-3" 
        style={{
          width: '100%', 
          maxWidth: '800px', 
          height: '450px', 
          margin: 'auto', 
          borderRadius: '12px', 
          overflow: 'hidden', 
          cursor: 'pointer'
        }} 
        lcw-base="USD" 
        lcw-d-head="true" 
        lcw-d-name="true" 
        lcw-d-code="true" 
        lcw-d-icon="true" 
        lcw-color-tx="#ffffff" 
        lcw-color-bg="#1f2434" 
        lcw-border-w="1"
        title="Click to view live crypto prices"
      />
      <style jsx>{`
        .livecoinwatch-widget-3:hover {
          transform: scale(1.02);
          transition: transform 0.2s ease-in-out;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}
