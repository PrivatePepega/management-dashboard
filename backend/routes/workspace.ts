import express from "express"
import z from "zod"
import {validateRequest} from "../middleware/validateRequest.js"
import { workspaceSchema } from "../validators/validate-schema.js";
import authMiddleware from "../middleware/auth-middleware.js"
import {createWorkspace, getWorkspaces} from "../controller/workspace.js"

const router = express.Router();

router.post("/", authMiddleware, validateRequest(workspaceSchema), createWorkspace);

router.get("/", authMiddleware, getWorkspaces)


export default router;