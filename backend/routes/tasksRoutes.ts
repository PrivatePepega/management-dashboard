import express from "express"
import z from "zod"
import {validateRequest} from "../middleware/validateRequest.js"
import { taskSchema } from "../validators/validate-schema.js";
import authMiddleware from "../middleware/auth-middleware.js"
import {createTask, watchTask, getTaskById, achievedTask,
    deleteTask, updateTaskDescription, updateTaskAssignees,
    updateTaskPriority, addSubTask, addComment,
    getCommentsByTaskId, getActivityByResourceId, updateSubTask,
    updateTaskStatus, getMyTasks} from "../controller/tasks-controller.js"

const router = express.Router();

router.post("/:projectId/create-task", authMiddleware, validateRequest(taskSchema), createTask);
router.post("/:taskId/watch", authMiddleware, watchTask);
router.post("/:taskId/add-comment", authMiddleware, addComment);
router.post("/:taskId/add-subtask", authMiddleware, addSubTask);
router.post("/:taskId/achieved", authMiddleware, achievedTask);


router.put("/:taskId/description", authMiddleware, updateTaskDescription);
router.put("/:taskId/assignees", authMiddleware, updateTaskAssignees);
router.put("/:taskId/priority", authMiddleware, updateTaskPriority);
router.put("/:taskId/status", authMiddleware, updateTaskStatus);
router.put("/:taskId/update-subtask/:subTaskId", authMiddleware, updateSubTask);


router.get("/my-tasks", authMiddleware, getMyTasks)
router.get("/:taskId", authMiddleware , getTaskById)
router.get("/:taskId/comments", authMiddleware , getCommentsByTaskId)
router.get("/:resourceId/activity", authMiddleware , getActivityByResourceId)


router.delete("/:taskId", authMiddleware, deleteTask);

export default router;