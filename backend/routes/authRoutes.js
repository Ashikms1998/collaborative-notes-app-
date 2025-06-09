import express from 'express'
const router = express.Router();
import { userSignUp,userLogin,userLogout} from '../controller/userAuth.js';

router.post('/sign-up',userSignUp)
router.post('/login', userLogin)
router.post('/logout',userLogout)
export default router