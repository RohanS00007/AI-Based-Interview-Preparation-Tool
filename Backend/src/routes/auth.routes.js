const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post("/register", authController.registerUserController);

/**
 * @route POST /api/auth/login
 * @description Login a user, expects email and password in the request body
 * @access Public
 */
authRouter.post("/login", authController.loginUserController);

/**
 * @route GET /api/auth/logout
 * @description Logout a user, clears the token cookie and adds the token to the blacklist
 * @access Public
 */
authRouter.get("/logout", authController.logoutUserController);

/**
 * @route GET /api/auth/get-me
 * @description Get the currently logged in user's details
 * @access Private
 */
authRouter.get(
  "/get-me",
  authMiddleware.authUser,
  authController.getMeController,
);

module.exports = authRouter;
