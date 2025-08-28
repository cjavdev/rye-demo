import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ryeApiKey = process.env.RYE_API_KEY;
    const ryeApiUrl = process.env.RYE_API_URL;

    if (!ryeApiKey) {
      return NextResponse.json(
        { error: "Rye API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(`${ryeApiUrl}/api/v1/checkout-intents/${id}`, {
      headers: {
        "Authorization": `Bearer ${ryeApiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Rye API error:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch checkout intent" },
        { status: response.status }
      );
    }

    const checkoutIntent = await response.json();
    console.log("checkoutIntent", JSON.stringify(checkoutIntent, null, 2));
    return NextResponse.json(checkoutIntent);
  } catch (error) {
    console.error("Error fetching checkout intent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}