const GREEN = '#27AE60';
const YELLOW = '#FF9800';
const RED = '#E74C3C';
// Use the same loading indicator that the page already does; don't host our own
const LOADING_INDICATOR = '<img src="https://more.app.vanderbilt.edu/more/images/loading.gif">';
// The divs that contain possible locations for professor names to populate
const COURSE_LIST_AREAS = [
  document.getElementById('searchClassSectionsResults'),
  document.getElementById('studentCart_content'),
  document.getElementById('enrolledClassSections_content'),
];

// Watch each of the areas where professor names may appear for changes. When detected, rate each professor.
const getOverallScoresObserver = new MutationObserver(rateProfessorsOnPage);
COURSE_LIST_AREAS.forEach(area => area ? getOverallScoresObserver.observe(area, { childList: true }) : null);

/**
 * Rates each of the professors currently in view.
 */
function rateProfessorsOnPage() {
	const professorNodes = getProfessorNodes();
	// Group nodes by professor name. This way, only one API call needs to be made per professor, then that score
	// is assigned to each of the nodes with that professor
	const groupedProfessorNodes = groupProfessors(professorNodes);
	Object.keys(groupedProfessorNodes).forEach(async name => {
		try {
			if (isValidProfessor(name) && isUnratedProfessor(name)) {
				// the reason for using groupedProfessorNodes[name].forEach is because there may be multiple nodes with the same professor name
				groupedProfessorNodes[name].forEach(setIsLoading);
				const professorId = await getProfessorId(name);
				const score = await getOverallScore(professorId);
				groupedProfessorNodes[name].forEach(node => setScore(name, node, score));

				const profURL = await getProfessorURL(professorId);
				groupedProfessorNodes[name].forEach(node => turnNodeIntoLink(node, profURL));
			} else if (isUnratedProfessor(name)) {
				groupedProfessorNodes[name].forEach(node => setInvalidScore(name, node));
			}
		} catch (err) {
			console.error(err);
			groupedProfessorNodes[name].forEach(node => setInvalidScore(name, node));
		}
	});
}

/**
 * Returns an array of nodes of each search result's professor field
 */
function getProfessorNodes() {
	return document.getElementsByClassName('classInstructor');
}

/**
 * Gets the part of the URL that needs to be appended to the base URL to reach the professor's page
 * Example return: '/ShowRatings.jsp?tid=2301025'
 */
function getProfessorId(profName) {
	const config = {
		action: 'searchForProfessor',
		query: convertName(profName)
	};

	return new Promise((resolve, reject) => {
		// @ts-ignore
		chrome.runtime.sendMessage(config, res => {
			if (res.profId) {
				resolve(res.profId);
			} else {
				reject(`Search result not found. Professor name: ${profName}`);
			}
		});
	});
}

/**
 * Scrapes the RMP page for the professor at <profId> for their overall score and returns it
 */
function getOverallScore(profId) {
	const config = {
		action: 'getOverallScore',
		query: profId,
	};

	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(config, res => {
			if (res && res.profRating) {
				if (res.profRating === '0.0' || res.profRating.includes('Grade received')) {
					reject('Professor not rated');
				} else {
					resolve(parseFloat(res.profRating));
				}
			} else {
				reject('No rating found');
			}
		});
	});
}

// TODO cmt
function getProfessorURL(profId){
	const config = {
		action: 'getProfessorURL',
		query: profId,
	};

	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(config, res => {
			if (res && res.profURL) {
				resolve(res.profURL);
			} else {
				reject('No URL found');
			}
		});
	});
}

function turnNodeIntoLink(node, url){
	const link = document.createElement('a');
	link.setAttribute('href', url);
	link.setAttribute('target', '_blank');
	link.appendChild(node.cloneNode(true));
	node.parentNode.replaceChild(link, node);
	
	return node;
}

/**
 * Converts a name from it's notation as shown in the search results to a form
 * that can be appended to the base RateMyProfessors URL in order to emulate
 * a search.
 */
function convertName(original) {
	const regex = /\w+(, )\w+/g;
	const temp = regex.exec(original);
	if (temp[0].trim() in subs) {
		temp[0] = subs[temp[0].trim()];
	}
	// strip away of "," since it is messing up some of the search
	temp[0] = temp[0].replace(/,/g, '');
	return encodeURIComponent(temp[0]);
}

/**
 * Returns a color based on <rating>. These numbers match the values on RateMyProfessors.com
 */
function getColor(rating) {
	// TODO: search SPAN, scroll to "Alpren, Francis". The rating is 3.4 but the color is red.
	if (rating >= 3.5) {
		return GREEN;
	}
	if (rating < 2.5) {
		return RED;
	}
	return YELLOW;
}

/**
 * Given an array of elements, groups them by professor name and returns an object
 * where the key represents the professor name and the value is an array of the nodes
 * that correspond to that professor.
 *
 * Slight modification of https://stackoverflow.com/questions/14446511/what-is-the-most-efficient-method-to-groupby-on-a-javascript-array-of-objects
 */
function groupProfessors(vals){
	return Array.from(vals).reduce((ret, val) => {
		(ret[val.textContent.trim()] = ret[val.textContent.trim()] || []).push(val);
		return ret;
	}, {});
}

/**
 * Returns TRUE if the professor is a single, non-Staff professor. Staff professors and
 * courses with multiple professors return FALSE.
 */
function isValidProfessor(name) {
	return (name !== '' && !name.includes('Staff') && !name.includes(' | ') && !restricted.includes(name));
}

/**
 * Return TRUE if the professor is not already rated or is in the process of being rated.
 * FALSE otherwise.
 */
function isUnratedProfessor(name) {
	return !name.includes(' - ');
}

/**
 * Adds 'N/A' as the score to professor on the search page
 */
function setInvalidScore(name, node) {
	setScore(name, node);
}

/**
 * Appends the loading indicator next to professor names in the results list
 */
function setIsLoading(node) {
	node.innerHTML = node.innerHTML + ' - ' + LOADING_INDICATOR;
}

/**
 * Adds the score and changes the color of the professor on the search page
 */
function setScore(name, node, score) {
	if (score) {
		node.textContent = name + ' - ' + score.toFixed(1);
		node.style.color = getColor(score);
	} else {
		node.textContent = name + ' - N/A';
	}
}
