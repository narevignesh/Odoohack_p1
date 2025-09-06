# EcoFinds API Contracts & Integration Guide

This document outlines the API contracts, mock data integration points, and backend implementation requirements for EcoFinds marketplace.

## 📋 Current Frontend Implementation

### Mock Data Sources
- **Products**: `/src/data/mockData.js` - Contains sample marketplace products
- **Users**: Mock authentication with demo credentials
- **Cart**: Local storage persistence for shopping cart
- **Purchases**: Local storage for purchase history

### Frontend Routes & Authentication
- **Public**: `/` (Landing), `/login`, `/signup`
- **Protected**: `/dashboard`, `/profile`, `/add-product`, `/product/:id`, `/my-listings`, `/cart`, `/purchases`

## 🔄 API Contracts Required

### 1. Authentication APIs

```javascript
// POST /api/auth/register
{
  "username": "string",
  "email": "string", 
  "password": "string"
}
// Response: { user, token }

// POST /api/auth/login  
{
  "email": "string",
  "password": "string"
}
// Response: { user, token }

// GET /api/auth/me (with Bearer token)
// Response: { user }
```

### 2. Product APIs

```javascript
// GET /api/products
// Query params: category, search, sortBy, page, limit
// Response: { products[], total, page, limit }

// POST /api/products (authenticated)
{
  "title": "string",
  "description": "string", 
  "price": "number",
  "category": "string",
  "condition": "string",
  "image": "string"
}
// Response: { product }

// GET /api/products/:id
// Response: { product }

// PUT /api/products/:id (authenticated, owner only)
// DELETE /api/products/:id (authenticated, owner only)

// GET /api/products/my-listings (authenticated)
// Response: { products[] }
```

### 3. Cart APIs

```javascript
// POST /api/cart/add (authenticated)
{
  "productId": "string",
  "quantity": "number"
}

// GET /api/cart (authenticated)
// Response: { cartItems[] }

// PUT /api/cart/:itemId (authenticated)
{
  "quantity": "number"
}

// DELETE /api/cart/:itemId (authenticated)

// POST /api/cart/checkout (authenticated)
{
  "items": "array",
  "totalAmount": "number"
}
// Response: { orderId, status }
```

### 4. User Profile APIs

```javascript
// GET /api/users/profile (authenticated)
// Response: { user }

// PUT /api/users/profile (authenticated)
{
  "username": "string",
  "email": "string",
  "bio": "string",
  "profileImage": "string"
}

// GET /api/users/purchases (authenticated)
// Response: { purchases[] }
```

## 🗄️ Database Schema Requirements

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique), 
  password: String (hashed),
  profileImage: String,
  bio: String,
  joinedDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Products Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  price: Number,
  category: String,
  condition: String,
  image: String,
  sellerId: ObjectId (ref: Users),
  seller: String, // denormalized for performance
  createdAt: Date,
  updatedAt: Date,
  isActive: Boolean
}
```

### Cart Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  items: [{
    productId: ObjectId (ref: Products),
    quantity: Number,
    addedAt: Date
  }],
  updatedAt: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  products: [{
    productId: ObjectId,
    title: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  totalAmount: Number,
  status: String, // 'pending', 'confirmed', 'shipped', 'delivered'
  purchaseDate: Date,
  createdAt: Date
}
```

## 🔧 Frontend Integration Points

### Context Updates Required
1. **AuthContext** (`/src/context/AuthContext.js`)
   - Replace mock login/signup with API calls
   - Add JWT token management
   - Implement token refresh logic

2. **CartContext** (`/src/context/CartContext.js`)
   - Replace localStorage with API calls
   - Add user-specific cart management
   - Sync cart state with backend

### Component Updates Required
1. **ProductFeed** - Fetch products from API with pagination
2. **AddProduct** - Submit to backend API with image upload
3. **MyListings** - Fetch user's products from API
4. **CartPage** - Sync with backend cart API
5. **PurchasesPage** - Fetch from orders API

### Utility Functions Needed
```javascript
// /src/utils/api.js
const API_BASE = process.env.REACT_APP_BACKEND_URL + '/api';

// HTTP client with JWT token handling
// Error handling and response formatting
// Image upload utilities
```

## 🚀 Implementation Priority

1. **Phase 1**: Authentication & User Management
   - JWT implementation
   - User registration/login
   - Profile management

2. **Phase 2**: Product Management
   - CRUD operations for products
   - Category filtering and search
   - Image upload integration

3. **Phase 3**: Shopping Features  
   - Cart management
   - Order processing
   - Purchase history

4. **Phase 4**: Enhanced Features
   - Real-time notifications
   - Advanced search filters
   - User ratings and reviews

## 📝 Notes

- All API endpoints should be prefixed with `/api` for proper routing
- JWT tokens should be stored securely (httpOnly cookies recommended)
- Image uploads should use cloud storage (AWS S3, Cloudinary)
- Implement proper error handling and validation
- Add pagination for product listings
- Consider implementing real-time features with WebSockets

## 🔒 Security Considerations

- Password hashing with bcrypt
- JWT token expiration and refresh
- Input validation and sanitization
- Rate limiting for API endpoints
- CORS configuration
- File upload security (type/size validation)

This contract ensures seamless integration between the existing frontend and the new backend implementation.