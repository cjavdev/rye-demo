"use client";

import Image from "next/image";
import { useState } from "react";
import { CheckoutFlow } from "@/components/CheckoutFlow";

const exampleProducts = [
  {
    id: 1,
    image: "/creative-act.jpg",
    title: "The Creative Act",
    price: "$25.22",
    website: "amazon.com",
    url: "https://www.amazon.com/Creative-Act-Way-Being/dp/0593652886"
  },
  {
    id: 2,
    image: "/airtag-holder.jpg",
    title: "AirTag Holder",
    price: "$14.99",
    website: "amazon.com",
    url: "https://www.amazon.com/Case-Mate-Clip-AirTags-Holder-Black/dp/B095ZWT668"
  },
  {
    id: 3,
    image: "/glasses.webp",
    title: "Telena Grey Sunglasses",
    price: "$370.00",
    website: "moscot.com",
    url: "https://moscot.com/products/telena-light-grey-with-custom-made-tints?variant=41716140310590"
  },
  {
    id: 4,
    image: "/rhode-cream.webp",
    title: "Barrier Restore Cream",
    price: "$32.00",
    website: "rhodeskin.com",
    url: "https://www.rhodeskin.com/products/barrier-restore-cream",
  }
];

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<typeof exampleProducts[0] | null>(null);

  if (selectedProduct) {
    return <CheckoutFlow product={selectedProduct} onBack={() => setSelectedProduct(null)} />;
  }

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16">
          <h1 className="text-4xl font-bold mb-4 text-foreground">What would you like to purchase?</h1>
        </header>

        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {exampleProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="border border-foreground/10 bg-background/50 p-4 hover:border-foreground/20 transition-colors text-left"
              >
                <div className="aspect-square mb-4 overflow-hidden bg-foreground/5">
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={300}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-medium text-foreground mb-2 text-sm">{product.title}</h3>
                <p className="text-foreground font-semibold mb-2">{product.price}</p>
                <p className="text-foreground/60 text-xs">On {product.website}</p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
