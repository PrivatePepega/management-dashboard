import express from "express"
import z from "zod"
import {validateRequest} from "../middleware/validateRequest.js"
import {registerSchema, loginSchema} from "../validators/validate-schema.js"
import {registerUser, loginUser} from "../controller/auth-controller.js"


const router = express.Router();

router.post("/register", validateRequest(registerSchema), registerUser);

router.post("/login", validateRequest(loginSchema), loginUser);



export default router;