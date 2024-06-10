import {
  ActionReturnType,
  IRateMyProfessor,
  MessageRequest,
} from '../api/RateMyProfessor/types';
import {
  restricted,
  GREEN,
  RED,
  YELLOW,
  LOADING_INDICATOR,
  COURSE_LIST_AREAS,
} from './constants';

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
        const score = await getOverallScore(name);
        groupedProfessorNodes[name].forEach((node) =>
          setScore(name, node as HTMLElement, score)
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
  return document.getElementsByClassName('classInstructor');
}

/**
 * Gets the part of the URL that needs to be appended to the base URL to reach the professor's page
 * Example return: '/ShowRatings.jsp?tid=2301025'
 */
export async function getProfessorId(profName: string) {
  const action: keyof IRateMyProfessor = 'getProfId' as const;
  return await new Promise<ActionReturnType<typeof action>>((resolve) =>
    chrome.runtime.sendMessage<MessageRequest<typeof action>>(
      {
        action,
        args: [profName],
      },
      resolve
    )
  );
}

export async function getAllProfessors() {
  const action: keyof IRateMyProfessor = 'getAllProfessors' as const;
  return await new Promise<ActionReturnType<typeof action>>((resolve) =>
    chrome.runtime.sendMessage<MessageRequest<typeof action>>(
      { action },
      resolve
    )
  );
}

/**
 * Scrapes the RMP page for the professor at <profId> for their overall score and returns it
 */
export async function getOverallScore(profName: string) {
  const action: keyof IRateMyProfessor = 'getOverallScore' as const;
  try {
    const profRating = await new Promise<ActionReturnType<typeof action>>(
      (resolve) =>
        chrome.runtime.sendMessage<MessageRequest<typeof action>>(
          {
            action,
            args: [profName],
          },
          resolve
        )
    );
    return profRating;
  } catch (e) {
    return undefined;
  }
}

/**
 * Returns a color based on <rating>. These numbers match the values on RateMyProfessors.com
 */
export function getColor(rating: number) {
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
export function groupProfessors(vals: HTMLCollectionOf<Element>) {
  return Array.from(vals).reduce<Record<string, Element[]>>((ret, val) => {
    if (!val.textContent) {
      return ret;
    }

    (ret[val.textContent.trim()] = ret[val.textContent.trim()] || []).push(val);
    return ret;
  }, {});
}

/**
 * Returns TRUE if the professor is a single, non-Staff professor. Staff professors and
 * courses with multiple professors return FALSE.
 */
export function isValidProfessor(name: string) {
  return (
    name !== '' &&
    !name.includes('Staff') &&
    !name.includes(' | ') &&
    !restricted.includes(name)
  );
}

/**
 * Return TRUE if the professor is not already rated or is in the process of being rated.
 * FALSE otherwise.
 */
export function isUnratedProfessor(name: string) {
  return !name.includes(' - ');
}

/**
 * Adds 'N/A' as the score to professor on the search page
 */
export function setInvalidScore(name: string, node: Element) {
  setScore(name, node as HTMLElement);
}

/**
 * Appends the loading indicator next to professor names in the results list
 */
export function setIsLoading(node: Element) {
  node.innerHTML = node.innerHTML + ' - ' + LOADING_INDICATOR;
}

/**
 * Adds the score and changes the color of the professor on the search page
 */
export function setScore(name: string, node: HTMLElement, score?: number) {
  if (score) {
    node.textContent = name + ' - ' + score.toFixed(1);
    node.style.color = getColor(score);
  } else {
    node.textContent = name + ' - N/A';
  }
}
