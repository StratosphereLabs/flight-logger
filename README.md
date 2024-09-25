# FlightLogger

[FlightLogger](https://flight-logger.stratospherelabs.io/) is your all-in-one personal flight logbook and trip planner, designed to help you seamlessly manage and organize your flights, whether you're a frequent flyer or an aviation enthusiast.

---

## ✈️ Features

- **Flight Logbook**: Easily log and track your flights, with detailed information on routes, times, aircraft, and more.
- **Trip Planner**: Plan your upcoming trips and get a clear overview of your travel itinerary.
- **Intuitive Interface**: Simple, user-friendly design to ensure smooth navigation and data input.
- **Real-Time Syncing**: Keep all your flight details updated in real-time, accessible from any device.
- **Customizable Reports**: Generate reports based on your flight history and share them with others.

---

## ⚙️ Technology Stack

FlightLogger is a full-stack web application built using modern, robust technologies for both the front and back end:

- **Backend**: 
  - [Express](https://expressjs.com/): Fast, minimalistic web framework for Node.js.
  - [Prisma](https://www.prisma.io/): Modern ORM used for database management.
  - [tRPC](https://trpc.io/): Type-safe APIs to connect the backend and frontend seamlessly.
  - **Prisma Accelerate & Pulse**: Optimization features used to boost query performance and monitor database health in real time.

- **Frontend**: 
  - [ReactJS](https://reactjs.org/): A modern JavaScript library for building user interfaces.
  
---

## 🛠️ Getting Started

### Prerequisites

Before you can run the project locally, ensure you have the following installed:

- Node.js (v16+)
- Prisma CLI
- PostgreSQL or any supported database

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/flight-logger.git
cd flight-logger
```

2. **Install the dependencies:**

```bash
npm install
```

3. **Configure the environment variables:**

Create a `.env` file and fill it with your database connection details:

```
DATABASE_URL="postgresql://username:password@localhost:5432/mydb"
```

4. **Migrate the database:**

```bash
npx prisma migrate dev
```

5. **Start the development server:**

```bash
npm run dev
```

---

## 📈 Prisma Accelerate & Pulse

Prisma Accelerate is used to boost query performance, while Prisma Pulse helps you monitor database operations. Together, these tools make FlightLogger's database interactions efficient and scalable.

---

## 🚀 Deployment

To deploy FlightLogger, make sure you set up your environment correctly with your preferred hosting provider (e.g., Vercel, Heroku, or AWS). Follow your provider's deployment documentation along with these additional steps:

1. **Set up environment variables** as per your host's guidelines.
2. **Run migrations** on the production database.
3. **Deploy** the application using your platform’s CI/CD tools.

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the project.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Contributors
- **Ethan Shields** - [GitHub Profile](https://github.com/SuperCheese21)
- **Giovanni Medrano** - [GitHub Profile](https://github.com/TechnicallyGio)

Feel free to contribute and help us make FlightLogger the best personal flight logbook and trip planner!
