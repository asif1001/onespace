# Oil Delivery Tracking Web App (PWA)

A comprehensive, production-ready React TypeScript Progressive Web App for tracking oil deliveries with Firebase backend integration.

## 🚀 Features

### Core Functionality
- **Multi-role Authentication**: Driver and Admin roles with Firebase Auth
- **Delivery Management**: Complete lifecycle tracking from assignment to completion
- **Photo Documentation**: Automated timestamp overlay on delivery photos
- **Real-time Updates**: Live status tracking and notifications
- **CSV Reporting**: Advanced filtering and export capabilities
- **Complaint Management**: Customer complaint tracking and resolution

### Driver Features
- Multi-step delivery wizard with form validation
- Photo upload for before/during/after/receipt documentation
- Real-time delivery status updates
- Customer communication tools
- Offline capability for field operations

### Admin Features
- Comprehensive dashboard with analytics
- User management (drivers and admins)
- Delivery assignment and tracking
- CSV export with advanced filtering
- Complaint management system
- Performance metrics and reporting

## 🛠 Technology Stack

### Frontend
- **React 19** with TypeScript
- **Material-UI v5** for consistent design
- **React Router v7** for navigation
- **Progressive Web App** (PWA) features
- **React Dropzone** for file uploads
- **Date-fns** for date manipulation

### Backend & Infrastructure
- **Firebase Authentication** for user management
- **Firestore** for real-time database
- **Firebase Storage** for file storage
- **Firebase Cloud Functions** for server-side logic
- **Firebase Hosting** for deployment

### Security
- Role-based access control (RBAC)
- Firestore security rules
- Storage security rules
- Input validation and sanitization

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Firebase CLI
- Git

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd onespace
npm install
```

### 2. Firebase Setup
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project (or update firebase.json with your project ID)
```

### 3. Environment Configuration
Create a `.env` file in the root directory based on `.env.example`:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 4. Cloud Functions Setup
```bash
cd functions
npm install
npm run build
```

### 5. Deploy to Firebase
```bash
# Build the React app
npm run build

# Deploy everything
firebase deploy

# Or deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## 🔧 Development

### Start Development Server
```bash
npm start
```
Opens [http://localhost:3000](http://localhost:3000)

### Run Tests
```bash
npm test
```

### Build for Production
```bash
npm run build
```

## 📱 PWA Features

The app includes full Progressive Web App capabilities:
- **Offline Support**: Core functionality available offline
- **App-like Experience**: Install on mobile devices and desktop
- **Push Notifications**: Real-time delivery updates
- **Background Sync**: Sync data when connection restored

## 🔐 Security Implementation

### Firestore Security Rules
- Users can only access their own data
- Admins have full access to all collections
- Drivers can read/write their assigned deliveries
- Input validation at database level

### Storage Security Rules
- Users can only upload to their designated folders
- File type and size validation
- Admin-only access to exports and system files

### Authentication & Authorization
- Email/password authentication with Firebase Auth
- Role-based access control with custom claims
- Protected routes based on user roles
- Session management and auto-logout

## 📊 Key Data Models

### User
```typescript
interface User {
  uid: string;
  email: string;
  role: 'driver' | 'admin';
  name: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Delivery
```typescript
interface Delivery {
  id: string;
  transactionId: string;
  driverId: string;
  driverName: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  oilType: string;
  quantity: number;
  scheduledDate: Date;
  deliveredDate?: Date;
  status: 'pending' | 'in_progress' | 'delivered' | 'cancelled';
  photos: DeliveryPhoto[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🎯 Key Components

### Authentication System
- **AuthContext**: Global authentication state management
- **ProtectedRoute**: Route protection based on user roles
- **Login**: Secure login with validation

### Driver Interface
- **DriverDashboard**: Overview of assigned deliveries
- **DeliveryWizard**: Multi-step delivery process
- **PhotoUpload**: Timestamp-overlaid photo capture

### Admin Interface
- **AdminDashboard**: Comprehensive management interface
- **UserManagement**: Driver and admin management
- **ReportingSystem**: CSV export with filtering

## 🚀 Cloud Functions

The app includes several Cloud Functions for server-side operations:

- `generateTransactionId`: Creates unique transaction IDs
- `exportDeliveriesCSV`: Exports delivery data with filters
- `exportComplaintsCSV`: Exports complaint data with filters
- `createUserDocument`: Auto-creates user documents on registration
- `cleanupUserData`: Cleans up data when users are deleted

## 📈 Current Implementation Status

✅ **Completed Features:**
- Complete React + TypeScript setup with Material-UI
- Authentication system with role-based access
- Driver dashboard with delivery management
- Admin dashboard with comprehensive analytics
- Multi-step delivery wizard with validation
- Photo upload with automatic timestamp overlay
- Cloud Functions for server-side operations
- Firestore and Storage security rules
- PWA configuration and manifest
- Complete TypeScript type definitions
- Responsive design for mobile and desktop

🔄 **Ready for Development:**
- Firebase project configuration
- Environment variable setup
- Initial user creation (admin accounts)
- Testing with real Firebase data
- Deployment to production

## 🛠 Getting Started Quickly

1. **Install dependencies**: `npm install`
2. **Set up Firebase**: Configure your Firebase project
3. **Add environment variables**: Copy `.env.example` to `.env` and fill in your Firebase config
4. **Start development**: `npm start`
5. **Build for production**: `npm run build`

## 📞 Support & Documentation

### Important Files
- `src/types/index.ts` - TypeScript interfaces and types
- `src/contexts/AuthContext.tsx` - Authentication logic
- `src/firebase/config.ts` - Firebase configuration
- `functions/src/index.ts` - Cloud Functions
- `firestore.rules` - Database security rules
- `storage.rules` - File storage security rules

---

**Built with ❤️ for efficient oil delivery operations**