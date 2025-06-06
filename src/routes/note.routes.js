import {Router} from "express"
import { authMiddleware } from "../middlewares/auth.middleware";
import { createNote, deleteNote, getNoteById, getNotes, updateNote } from "../controllers/note.controllers";
const router = Router();

router.use(authMiddleware)

router.route("/:projectId/create-note")
.post(createNote)

router.route("/:projectId/get-notes")
.get(getNotes)

router.route("/:projectId/get-note/:noteId")
.get(getNoteById)

router.route("/:projectId/update-note/:noteId")
.patch(updateNote)

router.route("/:projectId/delete-note/:noteId")
.delete(deleteNote)


export default router