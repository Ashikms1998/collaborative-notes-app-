import express from 'express'
const router = express.Router();
import { addNote,getNotes,updateNote,deleteNote,checkNotification,getAllNotifications} from '../controller/notesController.js';
import verifyToken from '../middleware/authMiddleware.js';

router.post('/add-note',verifyToken,addNote)
router.get('/get-notes',verifyToken,getNotes)
router.put('/update-note/:id',verifyToken,updateNote)
router.delete('/delete-note/:id' ,verifyToken,deleteNote)
router.get('/check-notification',verifyToken,checkNotification)
router.get('/all-notifications', verifyToken, getAllNotifications);
export default router