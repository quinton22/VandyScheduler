chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	const BASE_URL = 'https://www.ratemyprofessors.com/';
	const BASE_SEARCH_URL = 'https://www.ratemyprofessors.com/search/professors?sid=4002&q=';

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
					const profId = extractProfId(pageText);
					sendResponse({ profId});
				})
				.catch(err => {
					console.error('[ERROR: searchForProfessor]');
					console.error(err);
					sendResponse();
					return false;
				});
			return true;
			break;
		case 'getOverallScore':
			console.log("search4score" + BASE_SEARCH_URL + request.query);
			fetch(BASE_URL + "professor/" + request.query, config)
				.then(res => res.text())
				.then(pageText => {
					const ratingPage = document.createElement('html');
					ratingPage.innerHTML = pageText;
					console.log(ratingPage);
					const profRating = ratingPage.querySelector('div.RatingValue__Numerator-qw8sqy-2').textContent;
					sendResponse({ profRating});
				})
				.catch(err => {
					console.error('[ERROR: getOverallScore]');
					console.error(err);
					console.error(`query ${ BASE_SEARCH_URL + request.query}`);
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


function extractProfId(pageText){
	// in the version of rate my professor on 05/13/2023. when requesting using fetch, we can no longer find professorId in within a tag
	// instead it is stored within a JSON data under variable __RELAY_STORE__ in a <script> tag. So here we extract it from that variabl
	let scriptDataRegex = /window\.__RELAY_STORE__ = (.*?);/;
	let scriptDataMatch = pageText.match(scriptDataRegex);

	if (scriptDataMatch) {
			let jsonData = JSON.parse(scriptDataMatch[1]);

			// extract the legacyId from the JSON data
			for (let key in jsonData) {
					if (jsonData[key].legacyId) {
						return jsonData[key].legacyId;
					} 
			}

			return null;
	}  else {
		throw "error extracting the window\.__RELAY_STORE__  variable when trying to find profId"
	}
}
