document.addEventListener('DOMContentLoaded', function () {
	const rightPanel = document.querySelector('.fixed-sidebar-right');
	const leftPanel = document.querySelector('.fixed-sidebar-left');
	const postsTitle = document.getElementById('posts-title');
	const creatorsTitle = document.getElementById('creators-title');
	const trendButton = document.getElementById('trending-btn');
	const trendImage = document.getElementById('trending-img');
	var isTrending = false;

	trendButton.addEventListener('click', function (event) {
		event.preventDefault();

		// Disable button
		var link = this;
		link.style.pointerEvents = 'none';

		if (leftPanel && rightPanel && postsTitle && creatorsTitle && trendImage) {
			if (isTrending) {
				trendImage.src = '/svg/fire.svg';
			} else {
				trendImage.src = '/svg/fire-blue.svg';
			}

			// Slide out the sidebars
			leftPanel.classList.remove('slide-in-left');
			leftPanel.classList.add('slide-out-left');
			rightPanel.classList.remove('slide-in-right');
			rightPanel.classList.add('slide-out-right');

			// Hide the sidebars after the slide-out animation
			setTimeout(() => {
				leftPanel.classList.add('hidden');
				rightPanel.classList.add('hidden');

				// Update content
				if (isTrending) {
					postsTitle.innerText = 'My Posts';
					creatorsTitle.innerText = 'Following';
					isTrending = false;
				} else {
					postsTitle.innerText = 'Trending';
					creatorsTitle.innerText = 'Top Creators';
					isTrending = true;
				}

				// Show the sidebars with slide-in animation
				leftPanel.classList.remove('hidden', 'slide-out-left');
				leftPanel.classList.add('slide-in-left');
				rightPanel.classList.remove('hidden', 'slide-out-right');
				rightPanel.classList.add('slide-in-right');

				// Re-enable button
				link.style.pointerEvents = 'auto';
			}, 500); // Match the duration of the slide-out animation
		} else {
			console.error('One or more elements are not found.');
		}
	});
});
