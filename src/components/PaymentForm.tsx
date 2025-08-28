"use client";

import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

interface BuyerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

interface PaymentFormProps {
  checkoutIntentId: string;
  buyerInfo: BuyerInfo;
  onSuccess: () => void;
}

const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#9e2146",
    },
  },
};

export function PaymentForm({ checkoutIntentId, buyerInfo, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError("Card element not found");
      setLoading(false);
      return;
    }

    try {
      // Create payment method
      const { error: paymentMethodError, token } = await stripe.createToken(cardElement, {
        name: `${buyerInfo.firstName} ${buyerInfo.lastName}`,
        address_line1: buyerInfo.address1,
        address_line2: buyerInfo.address2,
        address_city: buyerInfo.city,
        address_state: buyerInfo.province,
        address_zip: buyerInfo.postalCode,
        address_country: buyerInfo.country,
      });

      if (paymentMethodError) {
        setError(paymentMethodError.message || "Payment method creation failed");
        setLoading(false);
        return;
      }

      // Confirm checkout intent with payment method
      const response = await fetch("/api/confirm-checkout-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkoutIntentId,
          paymentMethodId: token.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Payment confirmation failed");
      }

      const result = await response.json();

      if (result.success) {
        onSuccess();
      } else {
        setError("Payment confirmation failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-foreground mb-6">Payment Information</h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Card Details *
          </label>
          <div className="p-3 border border-foreground/20 bg-background">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full px-6 py-3 bg-foreground text-background font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Placing order with Rye..." : "Complete Purchase"}
        </button>
      </form>
    </div>
  );
}