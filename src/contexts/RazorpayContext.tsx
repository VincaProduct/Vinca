import React, { createContext, useContext, useState, useCallback } from 'react';

interface RazorpayContextType {
  isScriptLoaded: boolean;
  loadRazorpayScript: () => Promise<boolean>;
}

const RazorpayContext = createContext<RazorpayContextType | undefined>(undefined);

export const useRazorpayContext = () => {
  const context = useContext(RazorpayContext);
  if (!context) {
    throw new Error('useRazorpayContext must be used within RazorpayProvider');
  }
  return context;
};

export const RazorpayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const loadRazorpayScript = useCallback(async (): Promise<boolean> => {
    if (isScriptLoaded) {
      return true;
    }

    // Check if script already exists
    if (document.getElementById('razorpay-checkout-js')) {
      setIsScriptLoaded(true);
      return true;
    }

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-js';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        setIsScriptLoaded(true);
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }, [isScriptLoaded]);

  return (
    <RazorpayContext.Provider value={{ isScriptLoaded, loadRazorpayScript }}>
      {children}
    </RazorpayContext.Provider>
  );
};
