import {
  subs,
  restricted,
  GREEN,
  RED,
  YELLOW,
  LOADING_INDICATOR,
  COURSE_LIST_AREAS,
} from "./constants";

// Watch each of the areas where professor names may appear for changes. When detected, rate each professor.
export const getOverallScoresObserver = new MutationObserver(
  rateProfessorsOnPage
);
COURSE_LIST_AREAS.forEach((area) =>
  area ? getOverallScoresObserver.observe(area, { childList: true }) : null
);

/**
 * Rates each of the professors currently in view.
 */
export function rateProfessorsOnPage() {
  const professorNodes = getProfessorNodes();
  // Group nodes by professor name. This way, only one API call needs to be made per professor, then that score
  // is assigned to each of the nodes with that professor
  const groupedProfessorNodes = groupProfessors(professorNodes);
  Object.keys(groupedProfessorNodes).forEach(async (name) => {
    try {
      if (isValidProfessor(name) && isUnratedProfessor(name)) {
        groupedProfessorNodes[name].forEach(setIsLoading);
        const score = await getProfessorId(name).then(getOverallScore);
        groupedProfessorNodes[name].forEach((node) =>
          setScore(name, node, score)
        );
      } else if (isUnratedProfessor(name)) {
        groupedProfessorNodes[name].forEach((node) =>
          setInvalidScore(name, node)
        );
      }
    } catch (err) {
      console.error(err);
      groupedProfessorNodes[name].forEach((node) =>
        setInvalidScore(name, node)
      );
    }
  });
}

/**
 * Returns an array of nodes of each search result's professor field
 */
export function getProfessorNodes() {
  return document.getElementsByClassName("classInstructor");
}

/**
 * Gets the part of the URL that needs to be appended to the base URL to reach the professor's page
 * Example return: '/ShowRatings.jsp?tid=2301025'
 */
export function getProfessorId(profName) {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    chrome.runtime.sendMessage(
      {
        action: "searchForProfessor",
        query: convertName(profName),
      },
      (res) => {
        if (res.profId) {
          resolve(res.profId);
        } else {
          reject(`Search result not found. Professor name: ${profName}`);
        }
      }
    );
  });
}

export function getAllProfessors() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "getAllProfessors" }, (res) => {
      if (res) {
        resolve(res);
      } else {
        reject("Failed to get professors.");
      }
    });
  });
}

/**
 * Scrapes the RMP page for the professor at <profId> for their overall score and returns it
 */
export function getOverallScore(profId) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: "getOverallScore",
        query: profId,
      },
      (res) => {
        if (res && res.profRating) {
          if (
            res.profRating === "0.0" ||
            res.profRating.includes("Grade received")
          ) {
            reject("Professor not rated");
          } else {
            resolve(parseFloat(res.profRating));
          }
        } else {
          reject("No rating found");
        }
      }
    );
  });
}

/**
 * Returns a color based on <rating>. These numbers match the values on RateMyProfessors.com
 */
export function getColor(rating) {
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
export function groupProfessors(vals) {
  return Array.from(vals).reduce((ret, val) => {
    (ret[val.textContent.trim()] = ret[val.textContent.trim()] || []).push(val);
    return ret;
  }, {});
}

/**
 * Returns TRUE if the professor is a single, non-Staff professor. Staff professors and
 * courses with multiple professors return FALSE.
 */
export function isValidProfessor(name) {
  return (
    name !== "" &&
    !name.includes("Staff") &&
    !name.includes(" | ") &&
    !restricted.includes(name)
  );
}

/**
 * Return TRUE if the professor is not already rated or is in the process of being rated.
 * FALSE otherwise.
 */
export function isUnratedProfessor(name) {
  return !name.includes(" - ");
}

/**
 * Adds 'N/A' as the score to professor on the search page
 */
export function setInvalidScore(name, node) {
  setScore(name, node);
}

/**
 * Appends the loading indicator next to professor names in the results list
 */
export function setIsLoading(node) {
  node.innerHTML = node.innerHTML + " - " + LOADING_INDICATOR;
}

/**
 * Adds the score and changes the color of the professor on the search page
 */
export function setScore(name, node, score) {
  if (score) {
    node.textContent = name + " - " + score.toFixed(1);
    node.style.color = getColor(score);
  } else {
    node.textContent = name + " - N/A";
  }
}
