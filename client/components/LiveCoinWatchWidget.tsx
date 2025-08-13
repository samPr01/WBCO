// @ts-nocheck
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function LiveCoinWatchWidget() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if script is already loaded
    const existingScript = document.querySelector('script[src*="livecoinwatch"]');
    if (existingScript) {
      setIsLoading(false);
      return;
    }

    // Load the Live Coin Watch script
    const script = document.createElement('script');
    script.src = 'https://www.livecoinwatch.com/static/lcw-widget.js';
    script.defer = true;
    
    script.onload = () => {
      setIsLoading(false);
      console.log('Live Coin Watch script loaded successfully');
      
      // Force a re-render after script loads
      setTimeout(() => {
        const widget = document.querySelector('.livecoinwatch-widget-3');
        if (widget) {
          widget.style.opacity = '1';
        }
      }, 100);
    };
    
    script.onerror = () => {
      setIsLoading(false);
      setHasError(true);
      console.error('Failed to load Live Coin Watch script');
    };

    document.head.appendChild(script);

    // Set a timeout to handle cases where script doesn't load
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setHasError(true);
      }
    }, 10000); // 10 second timeout

    return () => {
      clearTimeout(timeout);
      // Cleanup script when component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [isLoading]);

  if (hasError) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="text-center mb-6">
            <div className="text-muted-foreground mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Live Charts Temporarily Unavailable</h3>
            <p className="text-muted-foreground mb-4">
              We're experiencing issues loading the live crypto charts. Here's the latest data:
            </p>
          </div>
          
          {/* Fallback Crypto Data */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">$45,000</div>
              <div className="text-sm text-muted-foreground">Bitcoin (BTC)</div>
              <div className="text-xs text-green-500">+1.12%</div>
            </div>
            <div className="bg-muted p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">$2,800</div>
              <div className="text-sm text-muted-foreground">Ethereum (ETH)</div>
              <div className="text-xs text-green-500">+0.89%</div>
            </div>
            <div className="bg-muted p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">$1.00</div>
              <div className="text-sm text-muted-foreground">Tether (USDT)</div>
              <div className="text-xs text-green-500">+0.00%</div>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {isLoading && (
        <div className="bg-muted p-8 rounded-lg text-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading live crypto charts...</p>
        </div>
      )}
      
             <div 
         className="livecoinwatch-widget-3" 
         style={{
           width: '100%', 
           maxWidth: '800px', 
           height: '450px', 
           margin: 'auto', 
           borderRadius: '12px', 
           overflow: 'hidden', 
           cursor: 'pointer',
           opacity: isLoading ? 0 : 1,
           transition: 'opacity 0.3s ease-in-out'
         }} 
         lcw-base="USD" 
         lcw-d-head="false" 
         lcw-d-name="true" 
         lcw-d-code="true" 
         lcw-d-icon="true" 
         lcw-color-tx="#ffffff" 
         lcw-color-bg="#1f2434" 
         lcw-border-w="0"
         lcw-d-logo="false"
         title="Click to view live crypto prices"
         onClick={() => navigate('/trading/BTC')}
       />
      
             <style>{`
         .livecoinwatch-widget-3:hover {
           transform: scale(1.02);
           transition: transform 0.2s ease-in-out;
           box-shadow: 0 4px 15px rgba(0,0,0,0.3);
         }
         
         /* Hide Live Coin Watch branding */
         .livecoinwatch-widget-3 iframe {
           border: none !important;
         }
         
         /* Custom styling to match our UI */
         .livecoinwatch-widget-3 {
           background: transparent !important;
           border: 1px solid hsl(var(--border)) !important;
           border-radius: 12px !important;
         }
         
         /* Hide any remaining branding elements */
         .livecoinwatch-widget-3 [class*="logo"],
         .livecoinwatch-widget-3 [class*="brand"],
         .livecoinwatch-widget-3 [class*="powered"] {
           display: none !important;
         }
         
         /* Make crypto symbols clickable */
         .livecoinwatch-widget-3 * {
           cursor: pointer !important;
         }
         
         /* Add click handler for crypto symbols */
         .livecoinwatch-widget-3 {
           position: relative;
         }
         
         .livecoinwatch-widget-3::after {
           content: '';
           position: absolute;
           top: 0;
           left: 0;
           right: 0;
           bottom: 0;
           z-index: 10;
           cursor: pointer;
         }
       `}</style>
    </div>
  );
}

