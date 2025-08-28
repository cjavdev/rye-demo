import { NextRequest, NextResponse } from "next/server";

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

interface RequestBody {
  productUrl: string;
  buyerInfo: BuyerInfo;
}

export async function POST(request: NextRequest) {
  try {
    const { productUrl, buyerInfo }: RequestBody = await request.json();

    const ryeApiKey = process.env.RYE_API_KEY;
    const ryeApiUrl = process.env.RYE_API_URL;

    if (!ryeApiKey) {
      return NextResponse.json(
        { error: "Rye API key not configured" },
        { status: 500 }
      );
    }

    // Create Checkout Intent with Rye API
    const response = await fetch(`${ryeApiUrl}/api/v1/checkout-intents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ryeApiKey}`,
      },
      body: JSON.stringify({
        productUrl: productUrl,
        buyer: {
          firstName: buyerInfo.firstName,
          lastName: buyerInfo.lastName,
          email: buyerInfo.email,
          phone: buyerInfo.phone,
          address1: buyerInfo.address1,
          address2: buyerInfo.address2,
          city: buyerInfo.city,
          province: buyerInfo.province,
          postalCode: buyerInfo.postalCode,
          country: buyerInfo.country,
        },
        quantity: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Rye API Error:", errorData);
      return NextResponse.json(
        { error: "Failed to create Checkout Intent" },
        { status: response.status }
      );
    }

    const checkoutIntent = await response.json();
    return NextResponse.json(checkoutIntent);
  } catch (error) {
    console.error("Error creating Checkout Intent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}