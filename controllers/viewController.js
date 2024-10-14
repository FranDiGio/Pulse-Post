import { getUserData } from '../services/userService.js';

export async function loadFeed(req, res) {
	try {
		const userId = req.session.userId;

		const profilePictureUrl = await getProfilePictureUrl(userId);
		const profileBackgroundUrl = await getProfileBackgroundUrl(userId);
		const bio = await getBiography(userId);

		res.render('feed.ejs', {
			username: req.session.username,
			profilePictureUrl: profilePictureUrl,
			profileBackgroundUrl: profileBackgroundUrl,
			bio: bio,
		});
	} catch (error) {
		console.error('Error fetching user data:', error);
		res.redirect('/login');
	}
}

export async function loadProfile(req, res) {
	try {
		const userId = req.session.userId;

		const profilePictureUrl = await getProfilePictureUrl(userId);
		const profileBackgroundUrl = await getProfileBackgroundUrl(userId);
		const bio = await getBiography(userId);

		res.render('profile.ejs', {
			username: req.session.username,
			profilePictureUrl: profilePictureUrl,
			profileBackgroundUrl: profileBackgroundUrl,
			bio: bio,
		});
	} catch (error) {
		console.error('Error fetching user data:', error);
		res.redirect('/login');
	}
}

async function getProfilePictureUrl(userId) {
	try {
		const { userData } = await getUserData(userId);

		if (userData && userData.profilePicture && userData.profilePicture !== 'N/A') {
			return userData.profilePicture;
		} else {
			return '/images/default-profile.png';
		}
	} catch (error) {
		console.error('Error fetching user data:', error);
		return '/images/default-profile.png';
	}
}

async function getProfileBackgroundUrl(userId) {
	try {
		const { userData } = await getUserData(userId);

		if (userData && userData.profileBackground && userData.profileBackground !== 'N/A') {
			return userData.profileBackground;
		} else {
			return '/images/default-background.png';
		}
	} catch (error) {
		console.error('Error fetching user data:', error);
		return '/images/default-background.png';
	}
}

async function getBiography(userId) {
	try {
		const { userData } = await getUserData(userId);

		if (userData && userData.bio) {
			return userData.bio;
		} else {
			return '';
		}
	} catch (error) {
		console.error('Error fetching user data:', error);
		return '';
	}
}
