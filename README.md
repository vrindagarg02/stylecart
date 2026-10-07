# StyleCart — Full-Stack AI + Web3 E-commerce

StyleCart started as a React + Vite fashion storefront. This version preserves that frontend direction and connects it to a real Node/Express + MongoDB backend, an explainable AI service, sandbox-payment structure, and an EVM order-verification contract.

## Features

- React/Vite storefront with existing pink StyleCart visual identity
- JWT authentication with bcrypt password hashing and customer/admin roles
- MongoDB products, carts, users, orders and interaction events
- Existing static product catalog migrated through a seed script
- Persistent backend cart
- Order history, tracking and order details
- Stripe test-mode payment intent structure
- Admin dashboard with sales, revenue, low-stock and top-product analytics
- TF-IDF + cosine-similarity personalized recommendations
- Semantic product search with intent extraction for budget, color, purpose and category
- Database-grounded AI shopping assistant
- Explainable suspicious-order risk scoring (prototype, not banking-grade fraud detection)
- Tamper-evident order verification using a Solidity contract and ethers.js
- Graceful fallbacks when AI/blockchain/payment services are unavailable

## Architecture

```text
React/Vite
   |
   | REST + JWT
   v
Express API ---- MongoDB
   |  |  \
   |  |   \---- Stripe test mode
   |  |
   |  +-------- FastAPI AI service
   |             |- TF-IDF recommendations
   |             |- semantic search
   |             |- intent extraction
   |
   +------------ EVM local/test network
                  |
                  +-- OrderVerification.sol
```

## Folder structure

```text
StyleCart/
├── src/                  # existing React frontend, enhanced
├── server/
│   └── src/
│       ├── models/
│       ├── routes/
│       ├── controllers/
│       ├── middleware/
│       ├── services/
│       └── utils/
├── ai/
│   ├── main.py
│   └── requirements.txt
├── blockchain/
│   ├── contracts/
│   ├── scripts/
│   └── hardhat.config.js
├── .env.example
└── package.json
```

## 1. Install

From the project root:

```bash
npm install
npm install --prefix client
npm install --prefix server
npm install --prefix blockchain
```

If you want the root development helper:

```bash
npm install
```

## 2. MongoDB

Install/start MongoDB locally or use MongoDB Atlas.

Copy `.env.example` to `server/.env` and set:

```env
MONGO_URI=mongodb://127.0.0.1:27017/stylecart
JWT_SECRET=your_long_random_secret
```

Seed the original frontend catalog:

```bash
npm run seed --prefix server
```

The seed script imports the existing `src/data/products.js` catalog instead of manually maintaining a duplicate product list.

## 3. AI service

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```bash
.venv\Scripts\activate
```

Install:

```bash
pip install -r ai/requirements.txt
```

Run:

```bash
uvicorn ai.main:app --reload --port 8000
```

The recommendation service uses TF-IDF + cosine similarity. If the AI service is unavailable, the Node backend falls back to popular products/keyword search.

## 4. Backend

Create `server/.env` from `.env.example`.

Run:

```bash
npm run dev --prefix server
```

API:

```text
http://localhost:5000
```

Health:

```text
GET /health
```

## 5. Frontend

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Run:

```bash
npm run dev --prefix client
```

## 6. Blockchain

Start a local Hardhat node:

```bash
npm run node --prefix blockchain
```

In another terminal:

```bash
npm run compile --prefix blockchain
npm run deploy --prefix blockchain
```

Copy the deployed contract address into:

```env
ORDER_VERIFICATION_ADDRESS=...
```

Use one of the local Hardhat private keys for:

```env
BLOCKCHAIN_PRIVATE_KEY=...
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
```

Only a deterministic order hash is recorded on-chain. Customer addresses and other sensitive information are not stored directly on-chain.

## 7. Payment

The backend creates Stripe PaymentIntents when `STRIPE_SECRET_KEY` is configured.

Set:

```env
STRIPE_SECRET_KEY=sk_test_...
```

The frontend intentionally does not collect/store card number or CVV itself. To complete a full Stripe Payment Element flow, configure a publishable Stripe key and confirm the PaymentIntent on the client before sending its transaction/payment identifier to the order endpoint.

Without Stripe configuration, the project creates a clearly marked `Pending` payment order rather than pretending that payment succeeded.

## API endpoints

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`

### Products
- GET `/api/products`
- GET `/api/products/:id`
- POST `/api/products` (admin)
- PUT `/api/products/:id` (admin)
- DELETE `/api/products/:id` (admin)

### Cart
- GET `/api/cart`
- POST `/api/cart`
- PUT `/api/cart/:productId`
- DELETE `/api/cart/:productId`
- DELETE `/api/cart`

### Orders
- POST `/api/orders`
- GET `/api/orders/my-orders`
- GET `/api/orders/:id`
- GET `/api/orders/:id/blockchain`
- GET `/api/orders/admin/all` (admin)
- PUT `/api/orders/admin/:id/status` (admin)

### AI
- GET `/api/recommendations`
- GET `/api/search?q=...`
- POST `/api/ai/shopping-assistant`

### Admin/Fraud
- GET `/api/admin/dashboard`
- GET `/api/fraud/:orderId`

### Payment
- POST `/api/payment/create-intent`

## How the recommendation system works

User events such as views, searches, cart additions and purchases are stored in the `Interaction` collection. Product text is built from name, description, category and tags. The FastAPI service converts product text into TF-IDF vectors and ranks products with cosine similarity against the user's interaction profile.

When history is insufficient, the backend falls back to popular products.

## How smart search works

A natural-language query is converted into a small intent object:

```text
"comfortable black shoes for running under 3000"

budget  -> 3000
color   -> black
purpose -> running
category -> shoes/footwear
```

TF-IDF semantic similarity ranks the database products and the backend applies budget filtering when the query specifies a maximum price.

## How suspicious-order detection works

This is an explainable anomaly-risk prototype. It combines signals including:

- new account
- high order value
- multiple failed payment attempts
- unusually frequent high-value purchases

It returns a score from 0–100, a Low/Medium/High level, and reasons. It is explicitly not a production banking-grade fraud model.

## How blockchain verification works

1. Build a deterministic summary from the order.
2. SHA-256 hash that summary.
3. Record the hash in `OrderVerification.sol`.
4. Store the hash/transaction reference in MongoDB.
5. Recreate the hash later and query the contract.
6. If the hash exists, the recorded order summary has an immutable verification record.

This keeps blockchain useful without forcing Web3 into normal shopping operations.

## Security

- bcrypt password hashing
- JWT authentication
- role-based authorization
- environment variables for secrets
- CORS
- basic rate limiting
- no plaintext passwords
- no card/CVV storage
- no customer-sensitive data on-chain
- safe error responses

## Known limitations

- Full Stripe Payment Element confirmation requires Stripe publishable/secret test keys.
- Local blockchain requires a running Hardhat node.
- The AI service is intentionally lightweight and explainable rather than a large language model.
- Fraud detection is a portfolio prototype, not a production fraud engine.
- External product image URLs depend on their source availability.

## Interview questions to prepare

1. Why use JWT and bcrypt?
2. Why store carts in MongoDB instead of only localStorage?
3. How does TF-IDF work?
4. What is cosine similarity?
5. How do you prevent recommendations from becoming random?
6. How does the smart search extract intent?
7. Why is fraud scoring called a prototype?
8. Why is blockchain useful for order verification?
9. Why should sensitive customer data not be stored on-chain?
10. How does an EVM transaction work?
11. How do MongoDB indexes improve product/search queries?
12. How would you scale the AI service?
13. How would you make payment confirmation idempotent?
14. How would you protect admin APIs?
15. What would you improve in the recommendation model with more user data?
