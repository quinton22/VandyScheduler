chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	const BASE_URL = 'https://www.ratemyprofessors.com';
	const BASE_SEARCH_URL = 'https://www.ratemyprofessors.com/search.jsp?queryoption=HEADER&queryBy=teacherName&schoolName=Vanderbilt+University&schoolID=4002&query=';
	const method = 'GET';
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
			fetch(BASE_SEARCH_URL + request.query, config)
				.then(res => res.text())
				.then(pageText => {
					const searchPage = document.createElement('html');
					searchPage.innerHTML = pageText;
					const profId = searchPage.querySelector('.SearchResultsPage__SearchResultsWrapper-sc-1srop1v-1');
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
			fetch(BASE_URL + request.query, config)
				.then(res => res.text())
				.then(pageText => {
					const ratingPage = document.createElement('html');
					ratingPage.innerHTML = pageText;
					console.log(ratingPage);
					const profRating = ratingPage.querySelector('div.RatingValue__Numerator-qw8sqy-2').textContent;
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
