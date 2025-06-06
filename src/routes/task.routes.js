import {Router} from "express"
import { authMiddleware } from "../middlewares/auth.middleware";
import { createSubTask, createTask, deleteSubTask, deleteTask, getTaskById, getTasks, updateSubTask, updateTask } from "../controllers/task.controllers";
const router = Router();


router.use(authMiddleware)

router.route("/projectId/create-task")
.post(createTask)

router.route("/:projectId/get-tasks")
.get(getTasks)

router.route("/:projectId/get-task/:taskId")
.get(getTaskById)

router.route(":projectId/update-task/:taskId")
.patch(updateTask)

router.route(":projectId/delete-task/:taskId")
.delete(deleteTask)

router.route("/:projectId/:taskId/create-subtask")
.post(createSubTask)

router.route("/:projectId/:taskId/update-subtask/:subTaskId")
.patch(updateSubTask)

router.route("/:projectId/:taskId/delete-subtask/:subTaskId")
.delete(deleteSubTask)
export default router