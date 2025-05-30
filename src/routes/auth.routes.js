import {Router} from "express"
import { registerUser } from "../controllers/auth.controllers";
import {validate} from "../middlewares/validator.middleware.js";
import { userRegistrationValidator } from "../validators/auth.validator.js";
const router = Router();

router.route("/register")
.post(userRegistrationValidator(),validate,registerUser)

export default router