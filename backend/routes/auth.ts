import express from "express"
import z from "zod"
import {validateRequest} from "../middleware/validateRequest.js"
import {registerSchema, loginSchema, verifyEmailSchema, resetPasswordSchema, resetPasswordRequestSchema} from "../validators/validate-schema.js"
import {registerUser, loginUser, verifyEmail, authMe, logoutUser, resetPasswordRequest, verifyResetPasswordTokenAndResetPassword} from "../controller/auth-controller.js"


const router = express.Router();

router.post("/register", validateRequest(registerSchema), registerUser);

router.post("/login", validateRequest(loginSchema), loginUser);

router.post("/verify-email", validateRequest(verifyEmailSchema), verifyEmail)

router.get("/me", authMe)

router.post("/logout", logoutUser)

router.post("/reset-password-request", validateRequest(resetPasswordRequestSchema), resetPasswordRequest)

router.post("/reset-password", validateRequest(resetPasswordSchema), verifyResetPasswordTokenAndResetPassword)

export default router;