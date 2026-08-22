import express from "express"
import z from "zod"
import {validateRequest} from "../middleware/validateRequest.js"
import authMiddleware from "../middleware/auth-middleware.js"
import {createProject, getProjectDetails, getProjectTasks} from "../controller/project.js"
import { projectSchema } from "../validators/validate-schema.js";


const router = express.Router();



router.post("/:workspaceId/create-project", authMiddleware, validateRequest(projectSchema), createProject);

router.get("/:projectId/tasks",authMiddleware, getProjectTasks)


export default router;