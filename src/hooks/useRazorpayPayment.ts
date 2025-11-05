import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { razorpayConfig } from "@/config/razorpay";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentOptions {
  planType: string;
  amount: number;
  onSuccess?: () => void;
  onFailure?: (error: any) => void;
}

export const useRazorpayPayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async ({ planType, amount, onSuccess, onFailure }: PaymentOptions) => {
    if (!user) {
      toast.error("Please login to continue");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay checkout");
      }

      // Create order via edge function
      const { data: orderData, error: orderError } = await supabase.functions.invoke("create-razorpay-order", {
        body: {
          plan_type: planType,
          amount,
          notes: {
            plan_name: razorpayConfig.plans[planType as keyof typeof razorpayConfig.plans]?.name || planType,
            user_email: user.email || "",
          },
        },
      });

      if (orderError || !orderData?.success) {
        throw new Error(orderData?.error || "Failed to create order");
      }

      const { order } = orderData;

      // Initialize Razorpay checkout
      const options = {
        key: razorpayConfig.keyId,
        amount: order.amount,
        currency: order.currency,
        name: razorpayConfig.companyName,
        description:
          razorpayConfig.plans[planType as keyof typeof razorpayConfig.plans]?.description || "Premium Subscription",
        image: "https://xmmyjphoaqazwlifehxs.supabase.co/storage/v1/object/public/logos/vinca-logo.png",
        order_id: order.razorpay_order_id,
        handler: async function (response: any) {
          // Payment completed in Razorpay
          // Webhook will handle verification and membership upgrade
          console.log("Payment completed:", response.razorpay_payment_id);

          toast.success("Payment successful! Processing your upgrade...");
          setLoading(false);

          // Wait a moment for webhook to process
          setTimeout(() => {
            onSuccess?.();
          }, 2000);
        },
        prefill: {
          name: user.user_metadata?.full_name || "",
          email: user.email || "",
          contact: user.user_metadata?.phone || "",
        },
        notes: {
          plan_type: planType,
          user_id: user.id,
        },
        theme: {
          color: razorpayConfig.theme.color,
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.info("Payment cancelled");
            onFailure?.(new Error("Payment cancelled by user"));
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err: any) {
      console.error("Payment initiation error:", err);
      setError(err.message);
      toast.error(err.message || "Failed to initiate payment");
      setLoading(false);
      onFailure?.(err);
    }
  };

  return {
    initiatePayment,
    loading,
    error,
    isProcessing: loading,
  };
};
