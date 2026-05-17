# Ticket Booking System API

REST API for managing events, bookings, users, and authentication in a ticket booking system.

## Description

This project is a backend API for an event ticket booking system.
It allows users to register, log in, browse events, and book tickets.
Admins and organizers can manage events, users, and bookings through protected endpoints.

## Features

- User registration and login
- JWT access tokens and refresh tokens
- Event management
- Ticket booking with seat availability checks
- User management
- Swagger UI for API testing

## Tech Stack

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Token
- bcryptjs
- Jest
- Swagger UI Express

## Project Structure

- `app.js` - Express app setup
- `bin/www` - server bootstrap
- `config/db.config.js` - MongoDB connection
- `controllers/` - HTTP controllers
- `middleware/` - auth middleware
- `models/` - Mongoose models
- `routes/` - Express routes
- `service/` - business logic
- `swagger/openapi.json` - OpenAPI definition
- `tests/` - Jest tests

## Main Models

- `User`
  - `username`
  - `email`
  - `phone`
  - `passwordHash`
  - `role`
  - `isBlocked`

- `Event`
  - `title`
  - `description`
  - `venue`
  - `city`
  - `eventDate`
  - `price`
  - `totalSeats`
  - `availableSeats`
  - `status`

- `Booking`
  - `bookingId`
  - `event`
  - `user`
  - `seatNumber`
  - `ticketType`
  - `bookingStatus`
  - `paymentStatus`
  - `priceAtBooking`
  - `currency`
  - `passengerName`
  - `passengerPhone`
  - `ticketQRCode`
  - `isUsed`
  - `isForResale`
  - `resalePrice`
  - `resaleStatus`
  - `canBeCancelled`

- `RefreshToken`
  - `token`
  - `user`
  - `expiresAt`

## Database Schema

### User

Stores account data and access role.

Fields:
- `username`
- `email`
- `phone`
- `passwordHash`
- `role`
- `isBlocked`

### Event

Stores event details and seat availability.

Fields:
- `title`
- `description`
- `venue`
- `city`
- `eventDate`
- `price`
- `totalSeats`
- `availableSeats`
- `status`

### Booking

Stores ticket booking data for a specific event and user.

Fields:
- `bookingId`
- `event`
- `user`
- `seatNumber`
- `ticketType`
- `bookingStatus`
- `paymentStatus`
- `priceAtBooking`
- `currency`
- `passengerName`
- `passengerPhone`
- `ticketQRCode`
- `isUsed`
- `isForResale`
- `resalePrice`
- `resaleStatus`
- `canBeCancelled`

### RefreshToken

Stores issued refresh tokens for authentication sessions.

Fields:
- `token`
- `user`
- `expiresAt`

## API Endpoints

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

### Users

- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`

### Events

- `GET /events`
- `GET /events/:id`
- `POST /events`
- `PUT /events/:id`
- `DELETE /events/:id`

### Bookings

- `GET /bookings`
- `GET /bookings/:id`
- `POST /bookings`
- `PUT /bookings/:id`
- `DELETE /bookings/:id`

## Authentication

The API uses JWT access tokens.

- Access token is sent in `Authorization: Bearer <token>`
- Refresh token is stored in an `httpOnly` cookie named `refreshToken`

Protected routes:
- `/users`
- `/events`
- `/bookings`

## Swagger

Swagger UI is available at:

- `GET /docs`
- `GET /swagger.json`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure MongoDB connection in `config/db.config.js` or your environment setup.

3. Start the server:

```bash
npm run start
```

## Environment Variables

Typical variables used by the project:

- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- MongoDB connection string in your DB config

## Testing

Run tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:cover
```

Current tests use Jest.

## Notes

- Passwords are stored as `passwordHash`, not plain text.
- Booking creation validates event existence, user existence, seat availability, and duplicate seat numbers.
- Some model helper methods are available, such as:
  - `User.isAdmin()`
  - `User.isBlockedUser()`
  - `Event.isBookable()`
  - `Booking.isCancelable()`
