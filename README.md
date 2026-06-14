# 🛍️ Apni Dukan - The Grounded Luxe Marketplace

Apni Dukan is a modern, microservices-based e-commerce platform designed with a focus on high-quality aesthetics ("Grounded Luxe"), fast performance, and a seamless shopping experience. It features real-time updates, secure authentication, and a robust image management system.

## 🚀 Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + Framer Motion (for premium micro-animations)
- **Maps:** Leaflet & React-Leaflet
- **Real-time:** Socket.io-client
- **HTTP Client:** Axios

### Backend (Microservices)
- **Environment:** Node.js + Express
- **Database:** MongoDB (with Mongoose)
- **Message Broker:** RabbitMQ (amqplib) for inter-service communication
- **Payments:** Razorpay
- **Storage:** Cloudinary (for optimized image delivery)
- **Authentication:** JWT & Google OAuth

## 🏛️ System Architecture

Apni Dukan follows a microservices architecture to ensure scalability and separation of concerns:

1. **Frontend:** The interactive React application serving the customers, shop owners, and riders.
2. **Auth Service (`services/auth`):** Handles user registration, login, JWT issuance, and Google OAuth integration.
3. **Shop Service (`services/shop`):** The core business service managing shops, inventory (items), and interactions.
4. **Realtime Service (`services/realtime`):** Manages live tracking and instant notifications via WebSockets.
5. **Rider Service (`services/rider`):** Dedicated service for managing delivery logistics and rider assignments.
6. **Utils Service (`services/utils`):** A specialized worker service that handles media processing and communicates with Cloudinary for permanent asset storage.

## 🖼️ The "Grounded Luxe" Image Flow

The application utilizes a distributed image upload architecture to maintain high performance:
1. **Client:** User uploads an image via the React frontend.
2. **Shop Service:** Receives the file, converts the raw binary buffer into a DataURI text format.
3. **Utils Service:** Takes the DataURI and securely uploads it to Cloudinary.
4. **Cloudinary:** Stores the asset globally and returns a permanent Secure URL.
5. **Shop Service:** Saves only the lightweight image URL in MongoDB.
When browsing, customers download images directly from Cloudinary's global CDN, offloading traffic from the main application servers.

## ⚙️ Local Development & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- RabbitMQ server
- Cloudinary Account
- Razorpay Account

### 1. Installation
Clone the repository and install dependencies for the root and all sub-projects:

```bash
# Install root dependencies
npm install

# Install frontend dependencies
npm run install:frontend

# Install dependencies for each microservice (Auth, Shop, Realtime, Rider, Utils)
cd services/auth && npm install
cd ../shop && npm install
# ... repeat for all services
```

### 2. Environment Variables
You will need to create a `.env` file in **each** microservice directory (`services/auth/.env`, `services/shop/.env`, etc.) and the `frontend` directory. 
Typical variables required:
- `MONGO_URI` (Database connection)
- `PORT` (Service port, e.g., 3001, 3002)
- `JWT_SECRET` (For authentication)
- `CLOUDINARY_URL` (For the Utils service)
- `RABBITMQ_URL` (For message queuing)

### 3. Running the Application
Start the frontend and all necessary microservices.

**Frontend:**
```bash
cd frontend
npm run dev
```

**Services:**
Navigate to each service directory and start the server:
```bash
cd services/<service_name>
npm run dev
```

---
*Created for: Apni Dukan* 🥂🏆
