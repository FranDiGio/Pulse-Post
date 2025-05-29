import { db } from '../config/firebaseConfig.js';
import { ref, get, set } from 'firebase/database';

export async function followUser(req, res) {
	const { userToFollow } = req.body;
	const userId = req.session.userId;
	const username = req.session.username;

	if (typeof userToFollow !== 'string' || !/^[a-zA-Z0-9_]{3,30}$/.test(userToFollow)) {
		return res.status(400).json({ error: 'Invalid username format.' });
	}

	const sanitizedUsername = userToFollow.trim().toLowerCase();

	// Check if user exists
	const idSnapshot = await get(ref(db, `usernames/` + sanitizedUsername));
	const profileId = idSnapshot.val();

	if (profileId == null) {
		return res.status(400).json({ error: 'User not found.' });
	} else {
		try {
			await set(ref(db, `/users/${profileId}/followers/${userId}`), username);
			await set(ref(db, `/users/${userId}/following/${profileId}`), sanitizedUsername);
			res.status(200).send('Successful');
		} catch (error) {
			console.error('Error following user:', error);
			res.status(500).send('Error following user');
		}
	}
}

// export async function getFollowers(req, res) {
// 	try {
// 		const userId = req.session.userId;

// 		if (userId == null) {
// 			res.status(404).render('error.ejs', { error: '404: Page Not Found' });
// 		} else {
// 			const followersRef = ref(db, `users/` + userId + '/followers');
// 			const followersSnapshot = await get(followersRef);
// 			const followersData = followersSnapshot.val();

// 			return followersData;
// 		}
// 	} catch (error) {
// 		console.error('Error fetching followers:', error);
// 		res.status(500).json({ error: 'Failed to fetch followers.' });
// 	}
// }

export async function getFollowing(req, res) {
	try {
		const userId = req.session.userId;

		if (userId == null) {
			res.status(404).render('error.ejs', { error: '404: Page Not Found' });
		} else {
			const followingRef = ref(db, `users/` + userId + '/followers');
			const followingSnapshot = await get(followingRef);
			const followingData = followingSnapshot.val();

			return followingData;
		}
	} catch (error) {
		console.error('Error fetching following:', error);
		res.status(500).json({ error: 'Failed to fetch followers.' });
	}
}
