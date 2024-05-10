import { Router } from "express";
import { loginUser, logoutUser, newAcessToken, registerUser,  } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { VerifyJWT } from '../middlewares/auth.middleware.js'

const router= Router();

router.route("/register").post(
    upload.fields(
        [
            {
                name:'logo',
                maxCount:1,
            }
        ]
    )
    ,registerUser)

    router.route("/login").post(upload.none(), loginUser);
 


// secured routes

router.route("/logout").post(VerifyJWT, logoutUser)
router.route('/refresh-token').post(newAcessToken)

export default router;