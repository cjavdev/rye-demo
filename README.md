# Rye Demo

A Next.js demo application showcasing Rye's checkout integration. This demo allows users to select products and go through a complete checkout flow using Rye's API for creating checkout intents and processing payments.

## Features

- **Product Selection**: Browse and select from example products
- **Buyer Information Collection**: Collect customer details including shipping address
- **Rye Integration**: Uses Rye API to create checkout intents and process orders
- **Stripe Payment Processing**: Integrated payment processing with Stripe
- **Responsive Design**: Built with Tailwind CSS for mobile and desktop

## Prerequisites

Before running this demo, you'll need:

- **Node.js** (version 18 or higher)
- **npm** or **yarn**
- **Rye API Key** - Get this from your Rye dashboard
- **Stripe Account** - For payment processing

## Environment Setup

1. **Copy the environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Configure your environment variables** in `.env`:
   ```env
   # Rye API Configuration
   RYE_API_KEY=your_rye_api_key_here
   RYE_API_URL=https://api.rye.com

   # Stripe Configuration
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   ```

   **Note**: Replace the placeholder values with your actual API keys and URLs.

## Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <your-repo-url>
   cd rye-demo
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Production Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Testing the Application

1. **Open your browser** and navigate to `http://localhost:3000`

2. **Select a product** from the available options:
   - The Creative Act (Book)
   - AirTag Holder
   - Telena Grey Sunglasses
   - Barrier Restore Cream

3. **Fill out the buyer information form** with test data:
   - First and last name
   - Email address
   - Phone number
   - Complete shipping address

4. **Complete the checkout flow**:
   - Review the order details
   - Process payment using Stripe test cards
   - Confirm the order

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
rye-demo/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes
│   │   │   ├── create-checkout-intent/    # Create Rye checkout intent
│   │   │   ├── confirm-checkout-intent/   # Confirm checkout
│   │   │   └── checkout-intent/[id]/      # Get checkout intent details
│   │   ├── globals.css             # Global styles
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Home page with product selection
│   └── components/
│       ├── BuyerInfoForm.tsx       # Customer information form
│       ├── CheckoutFlow.tsx        # Main checkout flow component
│       └── PaymentForm.tsx         # Stripe payment form
├── public/                         # Static assets
├── designs/                        # Design mockups
└── package.json                    # Dependencies and scripts
```

## API Endpoints

- `POST /api/create-checkout-intent` - Creates a new checkout intent with Rye
- `POST /api/confirm-checkout-intent` - Confirms and processes the checkout
- `GET /api/checkout-intent/[id]` - Retrieves checkout intent details

## Technologies Used

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Stripe** - Payment processing
- **Rye API** - E-commerce checkout integration

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env` file exists in the root directory
   - Restart the development server after adding environment variables

2. **Rye API Errors**
   - Verify your `RYE_API_KEY` is correct
   - Check that `RYE_API_URL` is properly configured
   - Ensure your Rye account has the necessary permissions

3. **Stripe Integration Issues**
   - Verify your Stripe publishable and secret keys
   - Use test keys for development
   - Check Stripe dashboard for any webhook configuration

4. **Build Errors**
   - Clear `.next` directory: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for demonstration purposes. Please refer to the individual package licenses for dependencies.

## Support

For issues related to:
- **Rye Integration**: Contact Rye support
- **Stripe**: Check Stripe documentation
- **Next.js**: Refer to Next.js documentation
- **This Demo**: Open an issue in this repository
