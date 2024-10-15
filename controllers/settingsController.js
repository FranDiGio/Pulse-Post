import { auth, bucket } from '../config/firebaseConfig.js';
import { updatePassword, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { update, remove } from 'firebase/database';
import { getUserData } from '../services/userService.js';
import { getFilename } from '../services/fileService.js';
import { validateNewPassword } from '../services/validationService.js';

export async function uploadProfilePicture(req, res) {
	if (!req.file) {
		return res.status(400).send('No file uploaded.');
	}
	const userId = req.session.userId;

	const filename = getFilename(req.file.mimetype, 'picture', req.session.username);
	const file = bucket.file(`profile_pictures/${req.session.userId}/${filename}`);
	const stream = file.createWriteStream({
		metadata: {
			contentType: req.file.mimetype,
		},
	});

	stream.on('error', (error) => {
		console.error('Error uploading file:', error);
		res.status(500).send('Error uploading file');
	});

	stream.on('finish', async () => {
		await file.makePublic();

		const downloadUrl = await file.getSignedUrl({
			action: 'read',
			expires: '03-09-2491',
		});

		const { userRef } = await getUserData(userId);
		update(userRef, {
			profilePicture: downloadUrl[0],
		})
			.then(() => {
				res.status(200).send('File uploaded successfully');
			})
			.catch((error) => {
				console.error('Error updating profile picture:', error);
				res.status(500).send('Error updating profile picture');
			});
	});

	stream.end(req.file.buffer);
}

export async function deleteProfilePicture(req, res) {
	const userId = req.session.userId;

	if (!userId) {
		return res.status(400).send('User ID not found in session.');
	}

	try {
		const { userData, userRef } = await getUserData(userId);

		if (!userData || !userData.profilePicture) {
			return res.status(404).send('No profile picture found for this user.');
		}

		// Delete the profile picture URL in Realtime Database
		await update(userRef, {
			profilePicture: null,
		});

		// Delete the directory in Firebase Storage
		const directoryPath = `profile_pictures/${userId}`;
		await bucket.deleteFiles({
			prefix: directoryPath,
		});

		res.status(200).send('Profile picture deleted successfully');
	} catch (error) {
		console.error('Error deleting profile picture:', error);
		res.status(500).send('Error deleting profile picture');
	}
}

export async function uploadProfileBackground(req, res) {
	if (!req.file) {
		return res.status(400).send('No file uploaded.');
	}
	const userId = req.session.userId;

	const filename = getFilename(req.file.mimetype, 'background', req.session.username);
	const file = bucket.file(`profile_backgrounds/${req.session.userId}/${filename}`);
	const stream = file.createWriteStream({
		metadata: {
			contentType: req.file.mimetype,
		},
	});

	stream.on('error', (error) => {
		console.error('Error uploading file:', error);
		res.status(500).send('Error uploading file');
	});

	stream.on('finish', async () => {
		await file.makePublic();

		const downloadUrl = await file.getSignedUrl({
			action: 'read',
			expires: '03-09-2491',
		});

		const { userRef } = await getUserData(userId);
		update(userRef, {
			profileBackground: downloadUrl[0],
		})
			.then(() => {
				res.status(200).send('File uploaded successfully');
			})
			.catch((error) => {
				console.error('Error updating profile picture:', error);
				res.status(500).send('Error updating profile picture');
			});
	});

	stream.end(req.file.buffer);
}

export async function deleteProfileBackground(req, res) {
	const userId = req.session.userId;

	if (!userId) {
		return res.status(400).send('User ID not found in session.');
	}

	try {
		const { userData, userRef } = await getUserData(userId);

		if (!userData || !userData.profileBackground) {
			return res.status(404).send('No profile background found for this user.');
		}

		// Delete the profile background URL in Realtime Database
		await update(userRef, {
			profileBackground: null,
		});

		// Delete the directory in Firebase Storage
		const directoryPath = `profile_backgrounds/${userId}`;
		await bucket.deleteFiles({
			prefix: directoryPath,
		});

		res.status(200).send('Profile background deleted successfully');
	} catch (error) {
		console.error('Error deleting profile picture:', error);
		res.status(500).send('Error deleting profile background');
	}
}

export async function updateBiography(req, res) {
	const userId = req.session.userId;

	if (!userId) {
		return res.status(400).send('User ID not found in session.');
	}

	try {
		const { userData, userRef } = await getUserData(userId);

		if (!userData) {
			return res.status(404).send('No data found for this user.');
		}

		await update(userRef, {
			bio: req.body.bioContent,
		});

		res.status(200).send('Bio updated succesfully');
	} catch (error) {
		console.error('Error updating bio:', error);
		res.status(500).send('Error updating biography');
	}
}

export async function resetPassword(req, res) {
	const userId = req.session.userId;

	if (!userId) {
		return res.status(400).send('User ID not found in session.');
	}

	try {
		const { userData } = await getUserData(userId);

		// Authenticate user with current password
		await signInWithEmailAndPassword(auth, userData.email, req.body.currentPassword);

		// Validate new password format
		const error = validateNewPassword(req.body.newPassword, req.body.confirmNewPassword);

		if (error) {
			return res.status(400).json({ newPassword: `${error}` });
		}

		const user = auth.currentUser;
		await updatePassword(user, req.body.newPassword);
		return res.status(200).json({ message: 'Password updated successfully' });
	} catch (error) {
		console.error('Error updating password:', error.code);

		if (error.code === 'auth/invalid-credential' || error.code === 'auth/missing-password') {
			return res.status(400).json({ currentPassword: 'Current password is incorrect' });
		}

		return res.status(500).json({ error: 'Error updating password' });
	}
}

export async function deleteAccount(req, res) {
	const userId = req.session.userId;

	if (!userId) {
		return res.status(400).send('User ID not found in session.');
	}

	try {
		const { userRef } = await getUserData(userId);
		const user = auth.currentUser;

		if (!user) {
			return res.status(401).send('User not authenticated.');
		}

		await remove(userRef);
		await deleteUser(user);

		await bucket.deleteFiles({
			prefix: `profile_backgrounds/${userId}`,
		});

		await bucket.deleteFiles({
			prefix: `profile_pictures/${userId}`,
		});

		return res.status(200).json({ message: 'Account deleted successfully' });
	} catch (error) {
		console.error('Error deleting account:', error.message || error);
		return res.status(500).json({ error: 'Error deleting account' });
	}
}
