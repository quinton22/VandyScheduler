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
async function getProfessorId(profName: string) {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getAllProfessors() {
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
async function getOverallScore(profName: string) {
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
function getColor(rating: number) {
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
 */
function groupProfessors(vals: HTMLCollectionOf<Element>) {
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
function isValidProfessor(name: string) {
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
function isUnratedProfessor(name: string) {
  return !name.includes(' - ');
}

/**
 * Appends the loading indicator next to professor names in the results list
 */
function setIsLoading(node: Element) {
  node.innerHTML = node.innerHTML + ' - ' + LOADING_INDICATOR;
}

function turnNodeIntoLink(node: HTMLElement, url?: string) {
  if (!url) {
    return node;
  }

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('target', '_blank');
  link.setAttribute('onclick', 'event.stopPropagation()');

  const linkNode = node.appendChild(link.cloneNode(true));

  return linkNode as HTMLElement;
}

/**
 * Adds the score and changes the color of the professor on the search page, adds a link to prof page in RMP
 */
function updateProfessorNode(
  name: string,
  node: HTMLElement,
  score?: number,
  href?: string
) {
  if (score) {
    node.textContent = null;
    const newNode = turnNodeIntoLink(node, href);

    newNode.textContent = `${name} - ${score.toFixed(1)}`;
    newNode.style.color = getColor(score);
  } else {
    node.textContent = `${name} - N/A`;
  }
}

/**
 * Rates each of the professors currently in view.
 */
function rateProfessorsOnPage() {
  const professorNodes = getProfessorNodes();
  // Group nodes by professor name. This way, only one API call needs to be made per professor, then that score
  // is assigned to each of the nodes with that professor
  const groupedProfessorNodes = groupProfessors(professorNodes);
  Object.keys(groupedProfessorNodes).forEach(async (name) => {
    try {
      if (isValidProfessor(name) && isUnratedProfessor(name)) {
        groupedProfessorNodes[name].forEach(setIsLoading);
        const profId = await getProfessorId(name);
        const score = await getOverallScore(name);
        groupedProfessorNodes[name].forEach((node) => {
          updateProfessorNode(
            name,
            node as HTMLElement,
            score,
            `https://www.ratemyprofessors.com/professor/${profId}`
          );
        });
      } else if (isUnratedProfessor(name)) {
        groupedProfessorNodes[name].forEach((node) =>
          updateProfessorNode(name, node as HTMLElement)
        );
      }
    } catch (err) {
      console.error(err);
      groupedProfessorNodes[name].forEach((node) =>
        updateProfessorNode(name, node as HTMLElement)
      );
    }
  });
}

// Watch each of the areas where professor names may appear for changes. When detected, rate each professor.
const getOverallScoresObserver = new MutationObserver(rateProfessorsOnPage);
COURSE_LIST_AREAS.forEach((area) =>
  area ? getOverallScoresObserver.observe(area, { childList: true }) : null
);
