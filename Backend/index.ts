import dotenv from "dotenv";
import connectDB from "./config/database.js";
import { seedAdmin } from "./config/seeder.js";
import app from "./src/app.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    
    // Seed admin user
    await seedAdmin();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
