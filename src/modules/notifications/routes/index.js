import { Router } from "express";
import { isAuthenticatedUser } from "../../../middlewares/auth.js";
import { getNotification } from "../controllers/index.js";

const notificationRouter = Router();

notificationRouter
  .route("/get-notifications")
  .get(isAuthenticatedUser, getNotification);

export default notificationRouter;
