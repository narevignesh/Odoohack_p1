
## 1. Project Summary (what & why)

EcoFinds is a lightweight marketplace that helps people buy and sell pre-owned items. The hackathon MVP focuses on secure user authentication, profile editing, product listing creation and management, browsing/filtering/search, a simple cart, and a previous purchases page. The goal is to show a polished, responsive UI on desktop and mobile with a robust API backend (FastAPI) and persisted data in MongoDB Atlas. JWT is used for stateless auth.

---

## 2. Key Features (MVP)

* Email + password registration and login.
* User profile (username, editable basic profile fields).
* Product creation: title, description, category (predefined), price, at least one image placeholder.
* Product CRUD for listing owners (create, read, update, delete).
* Product feed with search by title and category filter.
* Product detail view (full details + image placeholder).
* Shopping cart (add/remove items, view cart contents).
* Previous purchases page (list of bought items).
* Responsive UI for desktop + mobile, nice animations (Framer Motion/Gsap/Lottie suggested).
* Environment configuration via `.env` for both frontend & backend.

---

## 3. Technologies & Libraries

**Frontend**

* React (CRA) — create-react-app (no Vite).
* Tailwind CSS (recommended) for rapid styling.
* Framer Motion / GSAP / Lottie for animations.
* Axios for HTTP requests.
* React Router for routing.
* LocalStorage for cart + JWT storage (or httpOnly cookies if preferred).

**Backend**

* Python FastAPI for REST API.
* Uvicorn ASGI server.
* Pydantic for schemas.
* Motor/PyMongo (MongoDB Atlas).
* Passlib / bcrypt for password hashing.
* CORS middleware.

**Database**

* MongoDB Atlas (cloud).

---

## 4. Environment Variables

**Frontend (`.env.local`)**

```
REACT_APP_API_URL=http://localhost:8000/api
```

**Backend (`.env`)**

```
MONGO_URL=mongodb://localhost:27017
DB_NAME=ecofinds
SECRET_KEY=your-super-secret-key
CORS_ORIGINS=http://localhost:3000
```

---

## 5. API Overview

* **Auth:** `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
* **Users:** `/api/users/me` (update profile)
* **Products:** `/api/products` (CRUD, filter, search)
* **Cart:** `/api/cart`
* **Orders:** `/api/orders`, `/api/orders/checkout`, `/api/orders/:id`

---

## 6. Clone & Run Steps

### 🔹 Step 1: Clone Repo

```bash
git clone https://github.com/narevignesh/Odoohack_p1.git
cd Odoohack_p1
```

---

### 🔹 Step 2: Backend (FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Linux / Mac
venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
uvicorn main:app --reload --port 8000
```

✅ Backend will run on: `http://localhost:8000` 

---

### 🔹 Step 3: Frontend (React + Yarn)

```bash
cd frontend

# Install dependencies
yarn install

# Run React dev server
yarn start
```

✅ Frontend will run on: `http://localhost:3000` and call backend API at `REACT_APP_API_URL`.

---

### 🔹 Step 4: Test Flow

1. Register a new account.
2. Login to receive JWT.
3. Add a new product (title, category, description, price, image).
4. View product feed, search, and filter.
5. Add product to cart.
6. Checkout → appears in previous purchases.
7. Edit/delete own listings.
8. Update user profile from dashboard.

---

## 7. Testing

* Use Swagger UI (`/docs`) or Postman to test API endpoints.
* Validate frontend flows: register → login → create listing → browse → add to cart → checkout.

---

## 8. Deployment

* **Backend:** Deploy FastAPI to Render/Railway/Heroku.
* **Frontend:** Deploy React to Vercel/Netlify.
* **Database:** MongoDB Atlas cluster.
* **Images:** Use Cloudinary/S3 for production.

---

## 9. Roadmap (Post Hackathon)

* Cloud image uploads.
* Refresh token + secure cookies.
* Payment gateway integration.
* Ratings/reviews, messaging system.
* Recommendation engine.

---
