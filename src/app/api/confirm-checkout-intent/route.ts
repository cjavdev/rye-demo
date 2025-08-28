import { NextRequest, NextResponse } from "next/server";

interface RequestBody {
  checkoutIntentId: string;
  paymentMethodId: string;
}

export async function POST(request: NextRequest) {
  try {
    const { checkoutIntentId, paymentMethodId }: RequestBody = await request.json();

    const ryeApiKey = process.env.RYE_API_KEY;
    const ryeApiUrl = process.env.RYE_API_URL;
    if (!ryeApiKey) {
      return NextResponse.json(
        { error: "Rye API key not configured" },
        { status: 500 }
      );
    }

    // Confirm Checkout Intent with Rye API
    const response = await fetch(`${ryeApiUrl}/api/v1/checkout-intents/${checkoutIntentId}/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ryeApiKey}`,
      },
      body: JSON.stringify({
        paymentMethod: {
          type: "stripe_token",
          stripeToken: paymentMethodId,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Rye API error:", errorData);
      return NextResponse.json(
        { error: "Failed to confirm checkout intent" },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error confirming checkout intent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}