import express from "express"
import z from "zod"
import {validateRequest} from "../middleware/validateRequest.js"
import {registerSchema, loginSchema, verifyEmailSchema} from "../validators/validate-schema.js"
import {registerUser, loginUser, verifyEmail, authMe, logoutUser} from "../controller/auth-controller.js"


const router = express.Router();

router.post("/register", validateRequest(registerSchema), registerUser);

router.post("/login", validateRequest(loginSchema), loginUser);

router.post("/verify-email", validateRequest(verifyEmailSchema), verifyEmail)

router.get("/me", authMe)

router.post("/logout", logoutUser)


export default router;