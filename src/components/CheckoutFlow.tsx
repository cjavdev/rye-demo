"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { BuyerInfoForm } from "./BuyerInfoForm";
import { PaymentForm } from "./PaymentForm";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Product {
  id: number;
  image: string;
  title: string;
  price: string;
  website: string;
  url: string;
}

interface CheckoutFlowProps {
  product: Product;
  onBack: () => void;
}

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

interface CheckoutIntent {
  id: string;
  state: string;
  offer?: {
    cost: {
      subtotal: {
        amountSubunits: number;
        currencyCode: string;
      };
      tax: {
        amountSubunits: number;
        currencyCode: string;
      };
      total: {
        amountSubunits: number;
        currencyCode: string;
      };
    };
    shipping: {
      availableOptions: Array<{
        id: string;
        cost: {
          amountSubunits: number;
          currencyCode: string;
        };
      }>;
      selectedOptionId: string;
    };
  };
}

export function CheckoutFlow({ product, onBack }: CheckoutFlowProps) {
  const [step, setStep] = useState<"buyer-info" | "awaiting-offer" | "payment" | "processing" | "complete" | "failed">("buyer-info");
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo | null>(null);
  const [checkoutIntent, setCheckoutIntent] = useState<CheckoutIntent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuyerInfoSubmit = async (info: BuyerInfo) => {
    setLoading(true);
    setError(null);
    setBuyerInfo(info);

    try {
      const response = await fetch("/api/create-checkout-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productUrl: product.url,
          buyerInfo: info,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout intent");
      }

      const data = await response.json();
      setCheckoutIntent(data);
      setStep("awaiting-offer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Poll for checkout intent status
  useEffect(() => {
    if ((step === "awaiting-offer" || step === "processing") && checkoutIntent) {
      const pollStatus = async () => {
        try {
          const response = await fetch(`/api/checkout-intent/${checkoutIntent.id}`);
          if (response.ok) {
            const data = await response.json();
            setCheckoutIntent(data);

            if (step === "awaiting-offer" && data.state === "awaiting_confirmation") {
              setStep("payment");
            } else if (step === "processing") {
              if (data.state === "completed") {
                setStep("complete");
              } else if (data.state === "failed") {
                setError(data.error || "Payment failed. Please try again.");
                setStep("failed");
              }
            }
          }
        } catch (error) {
          console.error("Error polling status:", error);
        }
      };

      const interval = setInterval(pollStatus, 2000); // Poll every 2 seconds
      return () => clearInterval(interval);
    }
  }, [step, checkoutIntent]);

  const handlePaymentSuccess = () => {
    setStep("processing");
  };

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="text-foreground/70 hover:text-foreground transition-colors"
          >
            ← Back to products
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Column */}
          <div>
            <div className="sticky top-8">
              <div className="mb-6 overflow-hidden bg-foreground/5" style={{ aspectRatio: '1 / 0.8' }}>
                <Image
                  src={product.image}
                  alt={product.title}
                  width={500}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{product.title}</h2>
              <p className="text-xl font-semibold text-foreground mb-2">{product.price}</p>
              <p className="text-foreground/60">From {product.website}</p>
            </div>
          </div>

          {/* Form Column */}
          <div>
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600">
                {error}
              </div>
            )}

            {step === "buyer-info" && (
              <BuyerInfoForm onSubmit={handleBuyerInfoSubmit} loading={loading} />
            )}

            {step === "awaiting-offer" && (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-foreground border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-foreground/70">Fetching offer with Rye...</p>
              </div>
            )}

            {step === "payment" && checkoutIntent?.offer && buyerInfo && (
              <div>
                <div className="mb-8 p-6 border border-foreground/10 bg-background/50">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                      <span className="text-foreground/70">Subtotal</span>
                      <span className="text-foreground">${((checkoutIntent.offer?.cost.subtotal.amountSubunits || 0) / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Tax</span>
                      <span className="text-foreground">${((checkoutIntent.offer?.cost.tax.amountSubunits || 0) / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Shipping</span>
                      <span className="text-foreground">
                        {checkoutIntent.offer?.shipping.availableOptions.find(
                          (option: { id: string; cost: { amountSubunits: number; currencyCode: string } }) =>
                            option.id === checkoutIntent.offer?.shipping.selectedOptionId
                        )?.cost.amountSubunits === 0
                          ? "Free"
                          : `$${((checkoutIntent.offer?.shipping.availableOptions.find(
                              (option: { id: string; cost: { amountSubunits: number; currencyCode: string } }) =>
                                option.id === checkoutIntent.offer?.shipping.selectedOptionId
                            )?.cost.amountSubunits || 0) / 100).toFixed(2)}`
                        }
                      </span>
                    </div>
                    <div className="border-t border-foreground/10 pt-2 flex justify-between font-semibold">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">${((checkoutIntent.offer?.cost.total.amountSubunits || 0) / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Elements stripe={stripePromise}>
                  <PaymentForm
                    checkoutIntentId={checkoutIntent.id}
                    buyerInfo={buyerInfo}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              </div>
            )}

            {step === "processing" && (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-foreground border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-foreground/70">Placing order with Rye...</p>
              </div>
            )}

            {step === "complete" && (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Order Complete!</h3>
                <p className="text-foreground/70">Your order has been successfully processed.</p>
              </div>
            )}

            {step === "failed" && (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Payment Failed</h3>
                <p className="text-foreground/70 mb-6">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setStep("payment");
                  }}
                  className="px-6 py-3 bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}