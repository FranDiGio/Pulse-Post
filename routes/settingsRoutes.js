import express from 'express';
import multer from 'multer';
import { ensureAuthenticated } from '../controllers/authController.js';
import {
	uploadProfilePicture,
	deleteProfilePicture,
	uploadProfileBackground,
	deleteProfileBackground,
	updateBiography,
	resetPassword,
	deleteAccount,
} from '../controllers/settingsController.js';

const router = express.Router();
const upload = multer();

router.post('/picture', ensureAuthenticated, upload.single('profilePic'), uploadProfilePicture);
router.delete('/picture', ensureAuthenticated, deleteProfilePicture);
router.post('/background', ensureAuthenticated, upload.single('background'), uploadProfileBackground);
router.delete('/background', ensureAuthenticated, deleteProfileBackground);
router.put('/bio', ensureAuthenticated, updateBiography);
router.put('/password', ensureAuthenticated, resetPassword);
router.delete('/delete/account', ensureAuthenticated, deleteAccount);

export default router;
