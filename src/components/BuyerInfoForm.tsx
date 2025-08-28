"use client";

import { useState, useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

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

interface BuyerInfoFormProps {
  onSubmit: (info: BuyerInfo) => void;
  loading: boolean;
}

export function BuyerInfoForm({ onSubmit, loading }: BuyerInfoFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    province: "",
    postalCode: "",
    country: "US",
  });

  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    const initializeGooglePlaces = async () => {
      if (!addressInputRef.current) return;

      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
          version: "weekly",
          libraries: ["places"],
        });

        await loader.load();

        autocompleteRef.current = new google.maps.places.Autocomplete(
          addressInputRef.current,
          {
            types: ["address"],
            fields: ["address_components", "formatted_address"],
          }
        );

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current?.getPlace();
          if (place?.address_components) {
            const addressComponents = place.address_components;
            
            // Debug logging
            console.log("Address components:", addressComponents.map(c => ({ types: c.types, long_name: c.long_name, short_name: c.short_name })));
            
            let address1 = "";
            let city = "";
            let province = "";
            let postalCode = "";
            let country = "";

            addressComponents.forEach((component) => {
              const types = component.types;
              
              if (types.includes("street_number")) {
                address1 = component.long_name + " ";
              }
              if (types.includes("route")) {
                address1 += component.long_name;
              }
              // Try multiple city-related types
              if (types.includes("locality")) {
                city = component.long_name;
              } else if (types.includes("sublocality") && !city) {
                city = component.long_name;
              } else if (types.includes("administrative_area_level_2") && !city) {
                city = component.long_name;
              }
              if (types.includes("administrative_area_level_1")) {
                province = component.short_name; // This already gives us the 2-letter abbreviation
              }
              if (types.includes("postal_code")) {
                postalCode = component.long_name;
              }
              if (types.includes("country")) {
                country = component.short_name;
              }
            });

            console.log("Parsed address data:", { address1: address1.trim(), city, province, postalCode, country: "US" });
            
            setFormData(prev => ({
              ...prev,
              address1: address1.trim(),
              city,
              province,
              postalCode,
              country: "US",
            }));
          }
        });
      } catch (error) {
        console.error("Error loading Google Places:", error);
      }
    };

    initializeGooglePlaces();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // For state field, convert to uppercase and limit to 2 characters
    if (name === "province") {
      setFormData(prev => ({
        ...prev,
        [name]: value.toUpperCase().slice(0, 2),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-foreground mb-6">Buyer Information</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-1">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-foreground/20 bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-foreground/50 transition-colors"
              placeholder="First name"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-foreground/20 bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-foreground/50 transition-colors"
              placeholder="Last name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-foreground/20 bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-foreground/50 transition-colors"
            placeholder="Enter your email address"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-foreground/20 bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-foreground/50 transition-colors"
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <label htmlFor="address1" className="block text-sm font-medium text-foreground mb-1">
            Street Address *
          </label>
          <input
            ref={addressInputRef}
            type="text"
            id="address1"
            name="address1"
            value={formData.address1}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-foreground/20 bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-foreground/50 transition-colors"
            placeholder="Start typing your address..."
          />
        </div>

        <div>
          <label htmlFor="address2" className="block text-sm font-medium text-foreground mb-1">
            Apartment, suite, etc. (optional)
          </label>
          <input
            type="text"
            id="address2"
            name="address2"
            value={formData.address2}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-foreground/20 bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-foreground/50 transition-colors"
            placeholder="Apt, suite, unit, etc."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-foreground mb-1">
              City *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-foreground/20 bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-foreground/50 transition-colors"
              placeholder="City"
            />
          </div>
          <div>
            <label htmlFor="province" className="block text-sm font-medium text-foreground mb-1">
              State *
            </label>
            <input
              type="text"
              id="province"
              name="province"
              value={formData.province}
              onChange={handleInputChange}
              maxLength={2}
              required
              className="w-full px-3 py-2 border border-foreground/20 bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-foreground/50 transition-colors"
              placeholder="CA"
            />
          </div>
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-foreground mb-1">
              ZIP Code *
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-foreground/20 bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-foreground/50 transition-colors"
              placeholder="ZIP"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 px-6 py-3 bg-foreground text-background font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Processing..." : "Continue to Checkout"}
        </button>
      </form>
    </div>
  );
}