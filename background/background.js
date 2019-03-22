chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	const method = request.method ? request.method.toUpperCase() : 'GET';
	const headers = new Headers();
	if (method === 'POST') headers.append('Content-Type', 'application/x-www-form-urlencoded');
	const config = {
		method: method,
		headers: headers,
		mode: 'cors',
		cache: 'default',
	};

	switch (request.action) {
		case 'searchForProfessor':
			fetch(request.url, config)
				.then(res => res.text())
				.then(pageText => {
					const searchPage = document.createElement('html');
					searchPage.innerHTML = pageText;
					const profId = searchPage.querySelector('.listing.PROFESSOR');
					const ret = (profId) ? profId.getElementsByTagName('a')[0].getAttribute('href') : profId;
					sendResponse({ profId: ret });
				})
				.catch(err => {
					console.log('[ERROR: searchForProfessor]');
					console.log(err);
					sendResponse();
					return false;
				});
			return true;
			break;
		case 'getOverallScore':
			fetch(request.url, config)
				.then(res => res.text())
				.then(pageText => {
					const ratingPage = document.createElement('html');
					ratingPage.innerHTML = pageText;
					console.log(ratingPage);
					const profRating = ratingPage.querySelector('div:not(.form-element).grade').textContent;
					sendResponse({ profRating });
				})
				.catch(err => {
					console.log('[ERROR: getOverallScore]');
					console.log(err);
					sendResponse();
					return false;
				})
			return true;
			break;
		default:
			console.log(`Action ${request.action} not recognized`);
			break;
  }
});
