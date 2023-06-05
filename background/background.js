function profPageURL(profId, rmpBaseURL){
	return rmpBaseURL + "professor/" + profId;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	const BASE_URL = 'https://www.ratemyprofessors.com/';
	const BASE_SEARCH_URL = BASE_URL+'search/professors?sid=4002&q=';

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
			let fullQuery = BASE_SEARCH_URL + request.query;
			fetch(fullQuery, config)
				.then(res => res.text())
				.then(pageText => {
					const profId = extractProfId(pageText);
					sendResponse({ profId});
				})
				.catch(err => {
					console.error('[ERROR: searchForProfessor]');
					console.error(`error's query ${fullQuery}`);
					console.error(err);
					sendResponse({});
					return false;
				});
			return true;
			break;
		case 'getOverallScore':
			fetch(profPageURL(request.query, BASE_URL), config)
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
		case 'getProfessorURL':
			// this action does actually fetch anything. It is just here so that the logic that deals with rmp site are all in one place
			const profURL = profPageURL(request.query, BASE_URL);
			sendResponse({profURL})
			return true;
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
	
	// console.error(pageText);
	if (scriptDataMatch) {
		let jsonData = JSON.parse(scriptDataMatch[1]);

		// extract the legacyId from the JSON data. Find all matches to handle the case of multiple teachers showing up on the same page
		let result = [];
		for (let key in jsonData) {
			if (jsonData[key].legacyId) {
				result.push(jsonData[key].legacyId);
			}
		}

		if(result.length == 0){
			throw "error extracting the legacyId from the window\.__RELAY_STORE__ when trying to find profId. Possibly no professor is found"
		} else if(result.length > 1){
			throw "error extracting the legacyId from the window\.__RELAY_STORE__ when trying to find profId. Multiple matches found"
		} else {
			return result[0];
		}
	} else {
		throw "error extracting the window\.__RELAY_STORE__. __RELAY_STORE__ doesn't exist in pageText"
	}
}
