export const BASE_VANDY_URL = window.location.origin;

export const subs = {
  'Crooke, Philip S.': 'Crooke',
  'Davis, Victoria J.': 'Davis, Vicki',
  'Hardin, Douglas P.': 'Hardin, Doug',
  'Johnsen, Arthur': 'Johnsen, Art',
  'Leguizamon J S.': 'Leguizamon, Sebastian',
  'Link, Stanley': 'Link, Stan',
  'Rizzo, Carmelo J.': 'Rizzo, M',
  'Roth, Gerald H.': 'Roth, Jerry',
  'Savelyev, Petr A.': 'Savelyev, Peter',
  'Schmidt, Douglas C.': 'Schmidt, Doug',
  'Stahl, Sandra': 'Stahl, Sandy',
  'Tairas, Robert A.': 'Tairas, Rob',
  'Van Schaack, Andrew J.': 'Van Schaack, Andy',
  'White, Christopher J.': 'White, Jules',
};

export const restricted = [
  // There are two "William Robinson"s at Vanderbilt and this one is not on RateMyProfessors
  'Robinson, William F.',
];

export const GREEN = '#27AE60';
export const YELLOW = '#FF9800';
export const RED = '#E74C3C';

// Use the same loading indicator that the page already does; don't host our own
export const LOADING_INDICATOR = `<img src="${BASE_VANDY_URL}/more/images/loading.gif">`;
// The divs that contain possible locations for professor names to populate
export const COURSE_LIST_AREAS = [
  document.getElementById('searchClassSectionsResults'),
  document.getElementById('studentCart_content'),
  document.getElementById('enrolledClassSections_content'),
];
