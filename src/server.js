import cloudinary from "cloudinary";
import dotenv from "dotenv";
import databse from "./helpers/databse.js";
import { runApp, closeApp } from "./app.js";
import initModules from "./initModules.js";

const app = runApp();

// Starting Server
(async () => {
  // Config
  if (process.env.NODE_ENV !== "production") {
    dotenv.config({
      path: "src/config/config.env",
    });
  }

  // Cloudinary Setup
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Connecting to DB
  try {
    await databse.connect();
  } catch (err) {
    process.exit(1);
  }

  // Init Modules
  initModules(app);

  // Error Handler
  closeApp(app);

  const port = process.env.PORT || 4000;
  const server = app.listen(port, (err) => {
    if (err) {
      console.log(`[server] could not start http server on port: ${port}`);
      return;
    }
    console.log(`[server] running on port: ${port}`);
  });

  // Handling Uncaught Exception
  process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`[server] shutting down due to Uncaught Exception`);

    server.close(() => {
      process.exit(1);
    });
  });

  // Unhandled Promise Rejection
  process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`[server] shutting down due to Unhandled Promise Rejection`);

    server.close(() => {
      process.exit(1);
    });
  });
})();
