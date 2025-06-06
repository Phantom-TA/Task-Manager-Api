import {Router} from "express"
import { authMiddleware } from "../middlewares/auth.middleware";
import { addMemberToProject, createProject, deleteMember, deleteProject, getProjectById, getProjectMembers, getProjects, updateMemberRole, updateProject } from "../controllers/project.controllers";
const router = Router();

router.use(authMiddleware);

router.route("/create-project")
.post(createProject)

router.route("/get-projects")
.get(getProjects)

router.route("/:projectId")
.get(getProjectById)
.patch(updateProject)
.delete(deleteProject)

router.route("/:projectId/members")
.get(getProjectMembers)
.post(addMemberToProject)

router.route("/:projectId/members/:userId")
.delete( deleteMember);

router.route("/:projectId/members/:userId/role")
.patch(updateMemberRole)

export default router