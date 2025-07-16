# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` or `npm start` - Start the development server with nodemon
- `npm run test` - Run tests (currently no tests configured)

### Database Commands
- `npx prisma migrate dev` - Apply database migrations
- `npx prisma db seed` - Seed the database with initial data
- `npx prisma studio` - Open Prisma Studio for database management
- `npx prisma generate` - Generate Prisma client after schema changes

### Build and Deployment
- The application is deployed on Vercel (configured in vercel.json)
- Database migrations are applied automatically on deployment

## Project Architecture

### Technology Stack
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt for password hashing
- **File Upload**: Multer for handling image uploads
- **Push Notifications**: Expo Server SDK
- **Payment Integration**: MeSomb for mobile money payments

### Core Structure
This is a food delivery backend API with the following main entities:
- **Users**: Customer authentication and profiles
- **Restaurants**: Restaurant management with location and hours
- **Plats/Menusrapide**: Food items and quick menus
- **Commandes**: Order management with status tracking
- **Livraison**: Delivery system with real-time tracking
- **Livreurs**: Delivery personnel management
- **Colis**: Package delivery service
- **Payments**: Multiple payment methods (mobile money, card, cash on delivery)

### API Architecture
- **Controllers**: Business logic in `/controllers/` directory
- **Routes**: API endpoints in `/routes/` directory
- **Middlewares**: Authentication, file upload, and validation in `/middlewares/`
- **Services**: External service integrations in `/services/`
- **Utils**: Utility functions including notifications and OTP handling

### Database Schema
The Prisma schema defines complex relationships:
- Users can have multiple orders, reservations, and favorite dishes
- Restaurants belong to cities and have categories of dishes
- Orders can have multiple complements and are assigned to delivery personnel
- Real-time delivery tracking with position history
- Comprehensive notification system for users and delivery personnel

### Authentication & Authorization
- JWT tokens for user authentication
- Separate admin authentication middleware
- Role-based access control with Admin and UserRole models
- OTP verification system for phone number validation

### File Management
- Images stored in `/images/` directory
- Multer middleware for file uploads
- Static file serving for uploaded images

### Notification System
- Push notifications via Expo Server SDK
- Notification history tracking
- Support for both user and delivery personnel notifications

### Key Business Features
- Multi-restaurant food delivery
- Package delivery service
- Real-time order and delivery tracking
- Multiple payment methods
- Restaurant reservations
- Rating and review system
- Geolocation-based services

## Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `EXPO_ACCESS_TOKEN` - For push notifications
- `PORT` - Server port (defaults to 3000)
- JWT secret is hardcoded as 'secret' in check-auth.js

## Development Notes
- Server runs on all interfaces (0.0.0.0) for deployment compatibility
- CORS configured for local development (127.0.0.1:5173)
- Uses ES modules throughout the codebase
- Nodemon watches all files except node_modules and .git