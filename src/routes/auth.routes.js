import {Router} from "express"
import { changeCurrentPassword, forgotPasswordRequest, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, resendVerificationEmail, resetPassword, verifyEmail } from "../controllers/auth.controllers";
import {validate} from "../middlewares/validator.middleware.js";
import { userRegistrationValidator,userLoginValidator } from "../validators/index.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register")
.post(userRegistrationValidator(),validate,registerUser)

router.route("/login")
.post(userLoginValidator(),validate , loginUser)

router.route("/logout")
.get(authMiddleware,logoutUser)

router.route("/verify-email/:token")
.get(emailVerificationRouter(),validate,verifyEmail)

router.route("/resend-verification-email")
.post(resendVerificationEmail)

router.route("/refresh-token")
.post(refreshAccessToken)

router.route("/forgot-password")
.post(forgotPasswordRequest)

router.route("/reset-password/:token")
.post(resetPassword)

router.route("/change-password")
.post(authMiddleware,changeCurrentPassword)

router.route("/profile")
.get(authMiddleware,getCurrentUser)


export default router