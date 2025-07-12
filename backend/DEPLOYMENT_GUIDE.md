# Vercel Deployment Guide

## Issues Fixed

1. **WhatsApp Bot**: Commented out WhatsApp bot import (not compatible with serverless)
2. **CORS Configuration**: Updated to allow Vercel domains
3. **Error Handling**: Improved error handling for serverless environment
4. **MongoDB Connection**: Enhanced connection with proper error handling
5. **API Responses**: Standardized HTTP status codes and response format
6. **Health Checks**: Added health check endpoints

## Environment Variables Required

Set these in your Vercel dashboard (Settings → Environment Variables):

### Required:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens

### Optional:
- `FRONTEND_URL` - Your frontend URL (for CORS)
- `NODE_ENV` - Set to "production"

## Deployment Steps

### 1. Set Environment Variables in Vercel:
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - `MONGODB_URI`: `mongodb+srv://username:password@cluster.mongodb.net/classes`
   - `JWT_SECRET`: `your-secret-key-here`
   - `FRONTEND_URL`: `https://your-frontend-domain.vercel.app`

### 2. Deploy:
```bash
cd Attendance/backend
vercel --prod
```

### 3. Test Your API:
- Health check: `https://your-backend.vercel.app/`
- API health: `https://your-backend.vercel.app/api/health`
- Login: `POST https://your-backend.vercel.app/api/user/login`
- Register: `POST https://your-backend.vercel.app/api/user/register`

## API Endpoints

### Authentication:
- `POST /api/user/login` - User login
- `POST /api/user/register` - User registration

### Health Checks:
- `GET /` - Basic health check
- `GET /api/health` - API health check

## Troubleshooting

### If you get 404 errors:
1. Check that `vercel.json` is in the backend directory
2. Ensure all environment variables are set
3. Check Vercel function logs for errors

### If authentication fails:
1. Verify `JWT_SECRET` is set correctly
2. Check MongoDB connection string
3. Test with Postman or curl

### If CORS errors occur:
1. Update `FRONTEND_URL` environment variable
2. Check that your frontend domain is in the CORS origins

## Testing with curl

```bash
# Health check
curl https://your-backend.vercel.app/

# Register user
curl -X POST https://your-backend.vercel.app/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login user
curl -X POST https://your-backend.vercel.app/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
``` 