# EcoFinds - Complete Run Steps

## Prerequisites

### 1. Install Required Software
- **Python 3.8+** - Download from [python.org](https://python.org)
- **Node.js 16+** - Download from [nodejs.org](https://nodejs.org)
- **Yarn** - Install with `npm install -g yarn`
- **MongoDB** - Download from [mongodb.com](https://mongodb.com) or use MongoDB Atlas

### 2. MongoDB Setup
Choose one of the following options:

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a cluster
3. Get connection string
4. Update environment variables (see Backend Setup)

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd example/backend
```

### 2. Activate Virtual Environment
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Variables (Optional)
Create `.env` file in `example/backend/` directory:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=ecofinds
SECRET_KEY=your-secret-key-here
```

### 5. Start Backend Server
```bash
python server.py
```
or
```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

**Backend will run on:** http://localhost:8000
**API Documentation:** http://localhost:8000/docs

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd example/frontend
```

### 2. Install Dependencies
```bash
yarn install
```

### 3. Start Frontend Development Server
```bash
yarn start
```

**Frontend will run on:** http://localhost:3000

## Complete Application URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/api/

## Features Available

### Categories (Hardcoded)
- Clothing
- Electronics
- Furniture
- Home & Garden
- Sports & Fitness
- Books
- Other

### Pages
- **Landing Page:** `/` - Home page with categories and featured products
- **Products:** `/products` - Browse all products with filtering
- **Add Product:** `/add-product` - Add new product listing
- **My Listings:** `/my-products` - Manage your product listings
- **Profile:** `/profile` - User profile and statistics
- **Cart:** `/cart` - Shopping cart
- **Purchases:** `/purchases` - Purchase history
- **Login:** `/login` - User authentication
- **Signup:** `/signup` - User registration

## Troubleshooting

### Backend Issues
1. **MongoDB Connection Error:**
   - Ensure MongoDB is running
   - Check connection string in environment variables
   - Verify MongoDB service is started

2. **Port Already in Use:**
   - Change port in server.py or use different port
   - Kill existing process: `netstat -ano | findstr :8000`

3. **Python Dependencies:**
   - Ensure virtual environment is activated
   - Reinstall requirements: `pip install -r requirements.txt --force-reinstall`

### Frontend Issues
1. **Port Already in Use:**
   - Frontend will automatically use next available port
   - Or specify port: `PORT=3001 yarn start`

2. **Dependencies Issues:**
   - Clear cache: `yarn cache clean`
   - Delete node_modules: `rm -rf node_modules && yarn install`

3. **Build Errors:**
   - Check for syntax errors in components
   - Ensure all imports are correct

### General Issues
1. **CORS Errors:**
   - Backend CORS is configured for localhost:3000
   - Ensure frontend runs on correct port

2. **API Connection:**
   - Verify backend is running on port 8000
   - Check API_BASE_URL in frontend services/api.js

## Development Commands

### Backend
```bash
# Run with auto-reload
uvicorn server:app --reload

# Run tests
pytest

# Format code
black server.py

# Lint code
flake8 server.py
```

### Frontend
```bash
# Start development server
yarn start

# Build for production
yarn build

# Run tests
yarn test

# Lint code
yarn lint
```

## Production Deployment

### Backend
1. Set production environment variables
2. Use production WSGI server (Gunicorn)
3. Configure reverse proxy (Nginx)
4. Set up SSL certificates

### Frontend
1. Build production bundle: `yarn build`
2. Serve static files with web server
3. Configure routing for SPA
4. Set up CDN for assets

## Support

If you encounter any issues:
1. Check the console logs for errors
2. Verify all services are running
3. Check network connectivity
4. Review environment variables
5. Ensure all dependencies are installed

---

**Happy Coding! 🚀**
