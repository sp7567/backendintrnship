# MSME Vendor Payment Tracking System

A full-stack application for managing vendor payments, purchase orders, and tracking outstanding balances for MSMEs.

## Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **Prisma ORM** for database management
- **JWT** for authentication
- **express-validator** for input validation

### Frontend
- **React 18** with React Router
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Hot Toast** for notifications

## Features

### Core Features (MUST-HAVE)
- ✅ Vendor Management (CRUD operations)
- ✅ Purchase Order Management with line items
- ✅ Payment Recording with auto PO status update
- ✅ Analytics: Vendor Outstanding & Payment Aging reports
- ✅ JWT Authentication

### Business Logic
- ✅ Auto-generated PO numbers (PO-YYYYMMDD-XXX)
- ✅ Auto-generated Payment references (PAY-YYYYMMDD-XXX)
- ✅ Auto-calculated due dates based on vendor payment terms
- ✅ Auto-calculated total amounts from line items
- ✅ PO status auto-update on payment (Approved → PartiallyPaid → FullyPaid)
- ✅ Payment validation (cannot exceed outstanding amount)
- ✅ Cannot create PO for inactive vendor

### Bonus Features
- ✅ Payment voiding with status recalculation
- ✅ Soft deletes for vendors/POs/payments
- ✅ Payment trends report (last 6 months)
- ✅ Dashboard with financial overview

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd backend_intenrship
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Update DATABASE_URL in .env with your PostgreSQL credentials
# DATABASE_URL="postgresql://username:password@localhost:5432/msme_vendor_db?schema=public"

# Generate Prisma client
npm run generate

# Run migrations
npm run migrate

# Seed the database with sample data
npm run seed

# Start the development server
npm run dev
```

The backend will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will run on `http://localhost:3001`

## Database Schema

### Tables

1. **vendors**
   - id (UUID, PK)
   - vendorName (unique)
   - contactPerson
   - email (unique)
   - phoneNumber
   - paymentTerms (DAYS_7, DAYS_15, DAYS_30, DAYS_45, DAYS_60)
   - status (Active, Inactive)
   - isDeleted (soft delete)
   - createdAt, updatedAt, createdBy, updatedBy

2. **purchase_orders**
   - id (UUID, PK)
   - poNumber (unique, auto-generated)
   - vendorId (FK → vendors)
   - poDate
   - totalAmount (auto-calculated)
   - dueDate (auto-calculated)
   - status (Draft, Approved, PartiallyPaid, FullyPaid)
   - isDeleted (soft delete)
   - createdAt, updatedAt, createdBy, updatedBy

3. **po_items**
   - id (UUID, PK)
   - purchaseOrderId (FK → purchase_orders)
   - description
   - quantity
   - unitPrice
   - createdAt, updatedAt

4. **payments**
   - id (UUID, PK)
   - referenceNumber (unique, auto-generated)
   - purchaseOrderId (FK → purchase_orders)
   - paymentDate
   - amountPaid
   - paymentMethod (Cash, Cheque, NEFT, RTGS, UPI)
   - notes
   - isVoided (for voiding payments)
   - isDeleted (soft delete)
   - createdAt, updatedAt, createdBy, updatedBy

5. **users**
   - id (UUID, PK)
   - username (unique)
   - password (hashed)
   - createdAt, updatedAt

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |

### Vendors
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/vendors` | Create vendor |
| GET | `/api/vendors` | List all vendors |
| GET | `/api/vendors/:id` | Get vendor with payment summary |
| PUT | `/api/vendors/:id` | Update vendor |
| DELETE | `/api/vendors/:id` | Soft delete vendor |

### Purchase Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/purchase-orders` | Create PO |
| GET | `/api/purchase-orders` | List all POs |
| GET | `/api/purchase-orders/:id` | Get PO with payment history |
| PATCH | `/api/purchase-orders/:id/status` | Update PO status |
| DELETE | `/api/purchase-orders/:id` | Soft delete PO |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments` | Record payment |
| GET | `/api/payments` | List all payments |
| GET | `/api/payments/:id` | Get payment details |
| DELETE | `/api/payments/:id` | Void payment |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard summary |
| GET | `/api/analytics/vendor-outstanding` | Outstanding by vendor |
| GET | `/api/analytics/payment-aging` | Payment aging report |
| GET | `/api/analytics/payment-trends` | Monthly payment trends |

## Sample API Requests

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Create Vendor
```bash
curl -X POST http://localhost:3000/api/vendors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "vendorName": "Test Vendor",
    "email": "test@vendor.com",
    "contactPerson": "John Doe",
    "phoneNumber": "+91-9876543210",
    "paymentTerms": "DAYS_30",
    "status": "Active"
  }'
```

### Create Purchase Order
```bash
curl -X POST http://localhost:3000/api/purchase-orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "vendorId": "<vendor-uuid>",
    "status": "Approved",
    "items": [
      {"description": "Item 1", "quantity": 10, "unitPrice": 100},
      {"description": "Item 2", "quantity": 5, "unitPrice": 200}
    ]
  }'
```

### Record Payment
```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "purchaseOrderId": "<po-uuid>",
    "amountPaid": 500,
    "paymentMethod": "NEFT",
    "notes": "Partial payment"
  }'
```

## Test Credentials

- **Username:** admin
- **Password:** admin123

## Seed Data

The seed script creates:
- 1 admin user
- 5 vendors (4 active, 1 inactive)
- 15 purchase orders (various statuses)
- 10+ payments

## Testing Scenarios

1. **Create vendor → Create PO → Make partial payment → Verify status changes to "Partially Paid"**
2. **Make another payment completing the PO → Verify status changes to "Fully Paid"**
3. **Try to make payment exceeding outstanding → Should fail with error**
4. **Create PO for inactive vendor → Should fail**
5. **Query analytics → Should return correct calculations**
6. **Void payment → Verify PO status recalculates correctly**

## Key Design Decisions

1. **Prisma ORM** - Chosen for type safety, migrations, and easy PostgreSQL integration
2. **Soft Deletes** - Implemented for data integrity and audit trail
3. **Auto-generated Numbers** - PO and Payment numbers include date for easy identification
4. **Transaction for Payments** - Ensures data consistency when recording payments
5. **Status Auto-Update** - Business logic automatically updates PO status based on payment totals

## Project Structure

```
backend_intenrship/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.js            # Seed script
│   ├── src/
│   │   ├── config/            # Database config
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   └── index.js           # App entry point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/        # Shared components
    │   ├── context/           # Auth context
    │   ├── pages/             # Page components
    │   ├── services/          # API service
    │   ├── App.js
    │   └── index.js
    ├── tailwind.config.js
    └── package.json
```

## Error Handling

The API returns appropriate HTTP status codes:
- **200** - Success
- **201** - Created
- **400** - Validation error
- **401** - Unauthorized
- **404** - Not found
- **409** - Conflict (duplicate)
- **500** - Server error

## License

MIT
