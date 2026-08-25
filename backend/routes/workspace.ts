import express from "express"
import z from "zod"
import {validateRequest} from "../middleware/validateRequest.js"
import { workspaceSchema } from "../validators/validate-schema.js";
import authMiddleware from "../middleware/auth-middleware.js"
import {createWorkspace, getWorkspaces, getWorkspaceProjects, getWorkspaceDetails, getWorkspaceStats} from "../controller/workspace.js"

const router = express.Router();

router.post("/", authMiddleware, validateRequest(workspaceSchema), createWorkspace);

router.get("/", authMiddleware, getWorkspaces)

router.get("/:workspaceId", authMiddleware, getWorkspaceDetails);

router.get("/:workspaceId/projects", authMiddleware, getWorkspaceProjects)

router.get("/:workspaceId/stats", authMiddleware, getWorkspaceStats)

export default router;