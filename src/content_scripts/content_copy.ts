// IDEA: sidebar instead of preferences button
// in manifest: sidebar_action
// IDEA: somehow find a way to show which classes you should take
// TODO: make this a react app :)

// IDEA: show the number of ratings along side rateMyProf scores.
// IDEA: make the professor's name a link that goes directly to the rmp page

import $ from 'jquery';
import {
  BreakTime,
  Course,
  DayAbbr,
  Hour,
  Schedule,
  ScheduleArray,
  preferences,
} from './lib';
import { createModal } from './components/modal';
// import modal from './lib/html/modal.template.html';

let oldclassArr: Course[] = [];
var classArr: Course[] = []; // contains classes to construct schedule with
var scheduleArr = []; // contains all the schedules
var schedArr: Course[][];

var includePreferences = new Map();
var includeClassesInRemoval = false;

var modal = await createModal(); // creates modal and appends to doc
var ready = false; // allows modal to load

// creates button
var addClassButton = document.createElement('span');
addClassButton.setAttribute('width', 'auto');
var btn = document.createElement('button');
btn.setAttribute('class', 'myButton');
btn.innerHTML = 'Add to Schedule';
addClassButton.appendChild(btn);

// sets parent node to course titles on either class search page or class cart page
var parent = document
  .getElementById('classSearchResultsCarousel')
  ?.getElementsByClassName('left');
var parent2 = document
  .getElementById('studentCart')
  ?.getElementsByClassName('left');

// necessary for timeout
var timeout: NodeJS.Timeout | null = null;
var t: NodeJS.Timeout | null = null;

// gets current page
var page = '';
var focusPage = document.getElementsByClassName(
  'yui-carousel-item yui-carousel-item-selected'
);
if (focusPage.length !== 0) {
  page = focusPage[0].getElementsByTagName('h1')[0].innerHTML;
}

// constant font
let font = $('.classAbbreviation').css('font-family');

// updates class and adds buttons if the DOM subtree is changed
var observer = new MutationObserver(() => {
  if (parent !== undefined && parent2 !== undefined) {
    if (parent.length !== 0 || parent2.length !== 0) {
      if (timeout) {
        clearTimeout(timeout);
      }
      page = focusPage[0].getElementsByTagName('h1')[0].innerHTML;
      ready = false;
      if (page === 'Class Cart') {
        updateClassArr();
      }

      timeout = setTimeout(addBtn, 100);
    }
  }
});
observer.observe(document, {
  childList: true,
  subtree: true,
});

// export function triggerDblClick(parent, days, time, click) {
//   if (click) {
//     $.each(parent.find('.' + days), (ind, el) => {
//       if (
//         !$(el)
//           .siblings('.' + time)
//           .hasClass('one-chosen')
//       ) {
//         $(el)
//           .siblings('.' + time)
//           .trigger('click');
//       }
//     });
//   } else {
//     $.each(parent.find('.' + days), (ind, el) => {
//       if (
//         $(el)
//           .siblings('.' + time)
//           .hasClass('one-chosen')
//       ) {
//         $(el)
//           .siblings('.' + time)
//           .trigger('click');
//       }
//     });
//   }
// }

/*
 *	Clears class array and puts classes in cart in class arr
 */
export function updateClassArr() {
  oldclassArr = classArr.slice();
  classArr = [];

  // adds classes in cart to class arr
  if (t) {
    clearTimeout(t);
  }
  t = setTimeout(() => {
    if (!parent2) return;

    for (var i = 0; i < parent2.length; i++) {
      var children = parent2[i].children;
      if (children !== null) {
        addClass(parent2[i] as HTMLElement, i);
      }
    }
    ready = true;

    // do nothing if classes array has not changed
    if (
      oldclassArr.length === classArr.length &&
      oldclassArr.every((c, i) => c.equal(classArr[i]))
    ) {
      return;
    }
    updatePrefClassesToInclude();
  }, 100);
}

export function updatePrefClassesToInclude() {
  if (classArr && classArr.length !== 0) {
    try {
      Array.from(
        document.getElementById('include-pref')?.getElementsByTagName('ul') ??
          []
      ).forEach((el) => el.remove());
      $(
        `<ul class="include-pref-list">${classArr
          .map((c, j) => {
            return `<li style="padding: 10px; background-color:${
              j % 2 === 0 ? '#eee' : '#f9f9f9'
            }">
					<input id="${c.classAbbr.replace(
            ' ',
            '_'
          )}" class="include-class-checkbox" type="checkbox"/> <label class="class-abbr-label">${
              c.classAbbr
            }: ${c.classDesc}</label>
					<ul>
						${c.sections
              .map(
                (s, i) => `<li>
								<div class="class-details-pref">
									<div class="grid-item"><input id="${c.classAbbr.replace(
                    ' ',
                    '_'
                  )}-${s}" class="include-section-checkbox" type="checkbox"/></div>
									<div class="grid-item">${s}</div>
									<div class="grid-item">${c.days[i]}</div>
									<div class="grid-item">${c.times[i]}</div>
									<div class="grid-item">${c.prof[i]}</div.
								</div>
							</li>`
              )
              .join('')}
					</ul>
				</li>`;
          })
          .join('')}</ul>`
      ).insertAfter($('#include-pref-text'));

      $('.class-abbr-label').click((ev) =>
        $(ev.delegateTarget).prev().trigger('click')
      );
      $('.class-details-pref').click((ev) =>
        $(ev.delegateTarget).find('input')[0].click()
      );

      let currentClasses = new Map<string, string[]>();

      // this stores all the classes that we do not want to include!
      let sStorage = sessionStorage.getItem('includePreferences');
      // convert the string to a map if not undefined / null
      let storedClasses = sStorage
        ? new Map<string, string[]>(JSON.parse(sStorage))
        : undefined;

      classArr.forEach((c) =>
        currentClasses.set(c.classAbbr.replace(' ', '_'), c.sections)
      );

      if (storedClasses) {
        // set the session storage to be the intersection of the current classes and what is already in storage
        let intersection: string[] = [];
        currentClasses.forEach((v, k) => {
          if (storedClasses?.has(k)) {
            intersection.push(k);
          }
        });
        for (const [k, v] of storedClasses) {
          if (!intersection.includes(k)) storedClasses.delete(k);
          else
            v.forEach((sec, i) => {
              if (currentClasses && !currentClasses.get(k)?.includes(sec)) {
                let sc = storedClasses?.get(k);
                sc?.splice(i, 1);
                storedClasses?.set(k, sc ?? []);
                if (storedClasses?.get(k)?.length === 0) {
                  storedClasses.delete(k);
                }
              }
            });
        }
        // update storage
        sessionStorage.setItem(
          'includePreferences',
          JSON.stringify([...storedClasses])
        );
      } else {
        // set session storage to have preferences for classes included in making schedule
        storedClasses = new Map();
        sessionStorage.setItem(
          'includePreferences',
          JSON.stringify([...storedClasses])
        );
      }

      includePreferences = new Map(storedClasses);

      // check everything
      document.querySelectorAll('.include-pref-list input').forEach((el) => {
        (el as HTMLInputElement).checked = true;
      });

      // remove checks of stored classes
      storedClasses.forEach((v, k) => {
        (
          Array.from(
            document.getElementsByClassName('include-class-checkbox')
          ).filter((el) => el.id === k.replace(' ', '_'))[0] as HTMLInputElement
        ).checked = false;
        v.forEach((s) => {
          (
            Array.from(
              document.getElementsByClassName('include-section-checkbox')
            ).filter(
              (el) => k.replace(' ', '_') + '-' + s === el.id
            )[0] as HTMLInputElement
          ).checked = false;
        });
      });

      const sectionCheckboxes = document.getElementsByClassName(
        'include-section-checkbox'
      ) as HTMLCollectionOf<HTMLInputElement>;

      const getOnSectionChange = (el: HTMLInputElement) => (ev: Event) => {
        const match = el.id.match(/(.*)-(.*)/);
        if (!match) return;

        const k = match[1];
        const k2 = match[2];

        if (el.checked) {
          // remove from stored
          storedClasses?.set(
            k,
            storedClasses?.get(k)?.filter((e) => e !== k2) ?? []
          );

          // check if every item in this list is true
          if (
            Array.from(
              el.closest('ul')?.getElementsByTagName('input') ?? []
            ).filter((element) => element.checked === false).length === 0
          ) {
            const target = (
              el
                .closest('li')
                ?.getElementsByClassName(
                  'include-class-checkbox'
                ) as HTMLCollectionOf<HTMLInputElement>
            ).item(0);
            if (target) target.checked = true;
            storedClasses?.delete(k);
          }

          // update storage
          storedClasses &&
            sessionStorage.setItem(
              'includePreferences',
              JSON.stringify([...storedClasses])
            );
        } else {
          // add to stored
          storedClasses?.has(k)
            ? storedClasses.set(k, storedClasses?.get(k)?.concat(k2) ?? [])
            : storedClasses?.set(k, [k2]);

          const target = (
            el
              .closest('li')
              ?.getElementsByClassName(
                'include-class-checkbox'
              ) as HTMLCollectionOf<HTMLInputElement>
          ).item(0);
          if (target?.checked) {
            target.checked = false;
          }
        }

        // update the session storage
        storedClasses &&
          sessionStorage.setItem(
            'includePreferences',
            JSON.stringify([...storedClasses])
          );
        includePreferences = new Map(storedClasses);
      };

      for (const el of sectionCheckboxes) {
        el.addEventListener('change', getOnSectionChange(el));
      }

      const classCheckboxes = document.getElementsByClassName(
        'include-class-checkbox'
      ) as HTMLCollectionOf<HTMLInputElement>;

      const getOnClassChange = (el: HTMLInputElement) => (ev: Event) => {
        const sectionCheckboxArray = Array.from(
          (el.parentElement?.getElementsByClassName(
            'include-section-checkbox'
          ) as HTMLCollectionOf<HTMLInputElement>) ?? []
        );

        if (el.checked) {
          // remove items from storedClasses
          sectionCheckboxArray
            .filter((element) => !element.checked)
            .forEach((element) => {
              const match = element.id.match(/(.*)-.*/)?.[1];
              match && storedClasses?.delete(match);
              element.checked = true;
            });
        } else {
          storedClasses?.set(
            el.id,
            sectionCheckboxArray
              .map((element) => {
                element.checked = false;
                return element.id.match(/-(.*)/)?.[1] ?? '';
              })
              .filter(Boolean)
          );
        }

        // update the session storage
        storedClasses &&
          sessionStorage.setItem(
            'includePreferences',
            JSON.stringify([...storedClasses])
          );
        includePreferences = new Map(storedClasses);
      };

      for (const el of classCheckboxes) {
        el.addEventListener('change', getOnClassChange(el));
      }
    } catch (e) {
      console.error('DOM not loaded.');
    }
  }
}

/*
 *	Adds a button to each unique class
 */
export function addBtn() {
  const fontElement = document
    .getElementsByClassName('classAbbreviation')
    .item(0) as HTMLElement | null;
  font = fontElement?.computedStyleMap().get('font-family')?.toString() ?? '';

  if (page === 'Class Cart') {
    makeScheduleButton(focusPage[0].children[0] as HTMLElement);
  }

  btn.style.fontFamily = font;
  for (const el of document.getElementsByClassName(
    'left'
  ) as HTMLCollectionOf<HTMLElement>) {
    el.style.width = '100%';
  }

  var clone = null;

  if (parent)
    // adds buttons to class search page
    for (var i = 0; i < parent.length; i++) {
      var children = parent[i].children;

      // adds buttons to the page
      if (
        children !== null &&
        !children[children.length - 1].id.includes('Btn')
      ) {
        clone = addClassButton.cloneNode(true) as HTMLSpanElement;
        addClassButton.setAttribute('id', 'Btn' + i.toString());
        parent[i].appendChild(addClassButton);
        var button = addClassButton.firstChild;
        addEL(addClassButton.children[0] as HTMLButtonElement);
        addClassButton = clone;
      }
    }

  if (parent2)
    // adds button to class cart page
    for (var j = 0; j < parent2.length; j++) {
      var children = parent2[j].children;

      // adds buttons to the page
      if (
        children !== null &&
        !children[children.length - 1].id.includes('RemoveBtn')
      ) {
        clone = addClassButton.cloneNode(true) as HTMLSpanElement;
        addClassButton.id = 'RemoveBtn' + j.toString();
        parent2[j].appendChild(addClassButton);
        var button = addClassButton.firstChild;
        if (button) {
          (button as HTMLButtonElement).className = 'myButton remove';
          (button as HTMLButtonElement).innerHTML = 'Remove Class';
          addEL(button as HTMLButtonElement);
        }

        addClassButton = clone;
      }
    }
}

/*
 *	Adds event listener to add class buttons and remove class buttons so that when clicked
 *	all the sections of a class are added/removed
 */
export function addEL(button: HTMLButtonElement) {
  button.onclick = () => {
    (
      button
        .closest('tbody')
        ?.querySelectorAll(
          '.classActionButtons a'
        ) as NodeListOf<HTMLAnchorElement>
    ).forEach((el) => {
      if (
        el.title === 'Remove Class From Cart' ||
        el.title === 'Add this class to your cart'
      ) {
        el.click();
      }
    });

    return false;
  };
}

const DEFAULT_EXTRACT_TEXT = (el: HTMLElement) => el.innerText.trim();
const courseConfig: Record<
  string,
  { className: string; extractText?: (el: HTMLElement) => string }
> = {
  sections: {
    className: 'classSection',
  },
  profs: {
    className: 'classInstructor',
  },
  types: {
    className: 'classType',
  },
  hours: {
    className: 'classHours',
    extractText: (el: HTMLElement) => el.innerText.replace(/\s+/g, ''),
  },
  days: {
    className: 'classMeetingDays',
  },
  times: {
    className: 'classMeetingTimes',
    extractText: (el: HTMLElement) => el.innerText.trim().replace(/ - /g, '-'),
  },
  location: {
    className: 'classBuilding',
  },
};

/*
 *	Makes a class "Class" and adds to an array containing all classes in the
 *	schedule
 */
export function addClass(_class: HTMLElement, classNumOnPage: number) {
  let classAbbr = _class.children[0].innerHTML;
  classAbbr = classAbbr.replace(/:/g, '');
  let classDesc = _class.children[1].innerHTML;
  let specificClass = document
    .getElementById('cartDiv')
    ?.getElementsByClassName('classTable')[classNumOnPage];

  let profsList =
    specificClass?.getElementsByClassName('classInstructor') ?? [];
  let typeList = specificClass?.getElementsByClassName('classType') ?? [];
  let hoursList = specificClass?.getElementsByClassName('classHours') ?? [];
  let daysList =
    specificClass?.getElementsByClassName('classMeetingDays') ?? [];
  let timesList =
    specificClass?.getElementsByClassName('classMeetingTimes') ?? [];
  let classBuildingList =
    specificClass?.getElementsByClassName('classBuilding') ?? [];

  const getCourseData = (key: string) =>
    (
      Array.from(
        specificClass?.getElementsByClassName(courseConfig[key].className) ?? []
      ) as HTMLElement[]
    ).map(courseConfig[key].extractText ?? DEFAULT_EXTRACT_TEXT);

  const paramsObj: Record<string, string[]> = {};

  for (const key in courseConfig) {
    paramsObj[key] = getCourseData(key);
  }

  const unfilterdParams: [
    sections: string[],
    types: string[],
    profs: string[],
    hours: string[],
    days: string[],
    times: string[],
    location: string[]
  ] = [
    paramsObj.sections,
    paramsObj.types,
    paramsObj.profs,
    paramsObj.hours,
    paramsObj.days,
    paramsObj.times,
    paramsObj.location,
  ];

  const usedTypes: string[] = [];

  for (const type of paramsObj.types) {
    if (usedTypes.includes(type)) continue;
    const indices = paramsObj.types
      .map((t, i) => (t === type ? i : -1))
      .filter((i) => i !== -1);

    const params = unfilterdParams.map((param) =>
      param.filter((_, i) => indices.includes(i))
    ) as typeof unfilterdParams;
    classArr.push(new Course(classAbbr, classDesc, ...params));
    usedTypes.push(type);
  }
}

/*
 *	Adds class added img and adds a remove button -- currently unfunctional
 */
export function classAdded(button: HTMLButtonElement) {
  button.setAttribute('class', 'myButton disabled');
  button.disabled = true;
  setTimeout(function () {
    button.innerHTML = 'Added';
  }, 200);
}

/*
 *	Creates the make schedule button
 */
export function makeScheduleButton(parent: HTMLElement) {
  // add make schedule button if it doesn't exist
  if (!parent.querySelector('button')) {
    $('#yui-gen9').css('height', 'auto');
    var btnContainer = document.createElement('table');
    var contR = document.createElement('tr');
    var contD = [];
    for (let i = 0; i < 3; ++i) {
      contD[i] = document.createElement('td'); // 3 table cells
      contR.appendChild(contD[i]);
      contD[i].style.width = '33.333%';
    }
    btnContainer.appendChild(contR);
    contR.style.width = '100%';
    btnContainer.style.width = '97.5%';
    var button = document.createElement('button');
    contD[1].appendChild(button);

    var prefBtn = document.createElement('button');
    prefBtn.id = 'preferenceBtn';
    prefBtn.innerHTML = 'Preferences';
    prefBtn.className = 'myButton myButton2';
    prefBtn.addEventListener('click', showPreferences);
    contD[contD.length - 1].appendChild(prefBtn);
    prefBtn.style.fontFamily = font;

    button.id = 'makeSchedBtn';
    button.className = 'myButton myButton2';
    button.style.fontFamily = font;
    button.innerHTML = 'Make Schedule';
    parent.appendChild(btnContainer);
    button.addEventListener('click', makeSchedClicked);
  }

  // add one click enroll if doesn't exist
  if (!document.querySelector('#oneClickEnrollButton')) {
    let oneClickEnrollDiv = document.createElement('div');
    let oneClickEnroll = document.createElement('button');
    $(oneClickEnroll)
      .attr('id', 'oneClickEnrollButton')
      .addClass('myButton')
      .addClass('myButton2');
    oneClickEnroll.style.fontFamily = font;
    oneClickEnroll.innerHTML = 'One Click Enroll';
    oneClickEnroll.addEventListener('click', enroll);
    $(oneClickEnrollDiv).append(oneClickEnroll);

    if (document.querySelector('#enrollButton-button'))
      $('#cartDiv').append(oneClickEnrollDiv);
  }
}

/*
 *	When make schedule button is clicked, creates a
 *	schedule array using all the classes in the cart.
 *	Puts schedules into viewable modal
 */
export function makeSchedClicked() {
  if (ready) {
    let tbaClasses: Course[] = [];
    classArr = classArr.filter((c) => {
      if (c.times.includes('TBA')) {
        tbaClasses.push(c);
      }
      return !c.times.includes('TBA');
    });
    let includeClasses = classArr.map((c) => c.copy());
    let doNotIncludeString = sessionStorage.getItem('includePreferences');
    if (doNotIncludeString) {
      let doNotIncludeClasses = new Map<string, string[]>(
        JSON.parse(doNotIncludeString)
      );
      includeClasses.forEach((c) => {
        // want to remove sections from what we are looking at
        let k = c.classAbbr.replace(' ', '_');
        if (doNotIncludeClasses.has(k)) {
          doNotIncludeClasses
            .get(k)
            ?.forEach((section) => c.removeSection(section));
        }
      });
      // remove all classes with no sections
      includeClasses = includeClasses.filter((c) => c.sections.length > 0);
    }

    var sched = new Schedule(includeClasses);
    let overlappedC = sched.overlappedClasses;
    scheduleArr = sched.scheduleArr;
    scheduleArr = sortBasedOnPreferences(scheduleArr);
    createViewableContent(scheduleArr, tbaClasses, overlappedC);
  } else {
    setTimeout(makeSchedClicked, 50);
  }
}

/*
 *	Shows the preferences for user to choose
 */
export function showPreferences() {
  const prefModal = document.getElementById('pref-modal');
  if (prefModal) prefModal.style.display = 'block';
  const width = document
    .querySelectorAll('#Wednesday.break-day-title')
    ?.item(0).clientWidth;
  for (const el of document.getElementsByClassName(
    'break-select'
  ) as HTMLCollectionOf<HTMLElement>) {
    el.style.minWidth = `${width}px`;
  }
}

/*
 * Uses code courtesy of Samuel Lijin to enroll in every class in your cart with one click
 */
export function enroll() {
  const classes = document
    .getElementById('StudentCartList_div')
    ?.getElementsByClassName('classTable');
  //There are multiple classTables within the page; specifying those within the StudentCartList_div
  //restricts $classes to those tables corresponding to actual classes.
  //console.log(classes);
  //console.log(cart.childNodes);

  if (!classes) return;

  for (let i = 0; i < classes.length; i++) {
    //Log the iteration step.
    //console.log(i);

    const classInfo = classes[i].getElementsByClassName('left')[0]
      .childNodes as NodeListOf<HTMLElement>;
    const className = classInfo[1].innerText + ' ' + classInfo[3].innerText;
    //console.log(className);
    //Voodoo magic to grab the contents of the <div> containing the class name.

    const classSelection =
      classes[i].getElementsByClassName('classSelection')[0];
    //console.log(classSelection);
    //Grabs the classSelection <td> associated with the class.
    //Note that if registered for multiple /sections/ of the same class, this only grabs the first section.
    //The Class Cart page is formatted to give each class its own classTable <table>, but different sections
    //of the SAME class are placed as classSelection <td>s within a single classTable <table>.

    const sub = classSelection.childNodes as NodeListOf<HTMLElement>;
    //console.log(sub);
    //This grabs the childNode tree of the accessed TableData element, which contains 7 elements:
    //0: text ; 1: input ; 2: text ; 3: input.waitListHidden ; 4: text ; 5: div.enrollmentMenuDiv ; 6: text
    //The only relevant elements are [1], [3], [5].
    //[1] and [3] are inputs to enroll and/or waitList in the class; 5 is the 3rd parent of the ▼ dropdown text.
    //Not 100% sure why there are two associated inputs, but the following behavior is known:
    //    Clicking E▼ removes the "disabled" attribute from both, but does NOT toggle the waitListHidden input true.
    //    Clicking W▼ does the same, but DOES toggle the waitListHidden input true.
    //    Registering for a full class WITHOUT toggling the waitListHidden input true does NOT give a waitlist message.
    //    Registering for a full class WHEN toggling the waitListHidden input true DOES give a waitlist message.
    //    * In both attempts, an error of failure to enroll in the class is thrown, as would be expected.
    //Thus HIGHLY LIKELY that [1] and [3] are enrollment and waitlist inputs, e.g.:
    //    try {register-for-class(this) if [1]} catch {waitlist-for-class(this) if [3]}
    //The first code revision, however, was perfectly functional and only enabled the first input. Its ability to
    //handle waitlisting was not specifically tested.

    try {
      sub[1].removeAttribute('disabled');
      sub[3].removeAttribute('disabled');
      (sub[3] as HTMLInputElement).value = 'true';

      const buttonText = sub[5]?.firstChild?.firstChild?.firstChild;
      if (buttonText) buttonText.textContent = 'W▼';
      //This accesses and modifies the dropdown text. While not necessary for this script to be
      //functional, that its it serves as
      //visual confirmation that the function has executed properly.
      //firstChild returns a read-only element; textContent references the actual string in the CSS
      //console.log(buttonText.textContent);

      //console.log("Trying to enrollwaitlist for: " + className);
    } catch (TypeError) {
      console.log('Error during ' + i + '-th iteration:');
      console.log(TypeError);
    }
    //This enables the inputs.
    //console.log(sub[1]);
    //console.log(sub[3]);

    //console.log(buttonText);
  }

  document.getElementById('enrollButton-button')?.click();
}

/*
 *	Sorts the array based on the preferences and returns the array
 */
export function sortBasedOnPreferences(arr: ScheduleArray[]) {
  let prefNotMetCount = 0; // number of preferences broken
  let breakArr: [
    courseAbbr: string,
    courseSect: string,
    t: string,
    d: string
  ][] = [];
  let t: string;
  let d: DayAbbr;

  for (const day of BreakTime.AVAILABLE_DAYS) {
    d = BreakTime.toDayAbbr(day);

    for (const time of preferences.breakTime?.get(day) ?? []) {
      t = BreakTime.toTimeString(time as Hour);
      breakArr.push(['CLASS ABBRV', '00', t, d]);
    }
  }

  if (preferences.noPreferenceMet) {
    arr = arr.filter((sched) => {
      breakArr.forEach((c) => {
        if (Schedule.checkOverlap(c, sched)) {
          return false;
        }
      });
      return true;
    });
  } else {
    arr.sort((a, b) => {
      prefNotMetCount = 0;
      // a - b: negative then a is before b, 0  then same, pos then b before a
      breakArr.forEach((c) => {
        if (Schedule.checkOverlap(c, a)) {
          ++prefNotMetCount; // positive: more pref not met by a so a comes after b
        }
        if (Schedule.checkOverlap(c, b)) {
          --prefNotMetCount; // negative: more pref not met by b so b comes after a
        }
      });
      return prefNotMetCount;
    });
  }

  return arr;
}

/*
 *	Creates modal with different schedules and tables
 */
export function createViewableContent(
  arr: ScheduleArray[],
  tbaClasses: Course[],
  overlappedClasses: Map<string, number>
) {
  let scheduleDiv: HTMLDivElement;

  if (arr.length > 0) {
    schedArr = convertToDetailed(arr);
    let bigSchedDiv = document.createElement('div');
    if (tbaClasses.length > 0) {
      let tbaClassesP = document.createElement('p');
      let is_are = tbaClasses.length > 1 ? ' are' : ' is';
      tbaClassesP.innerHTML =
        '**' +
        tbaClasses
          .map((c) => c.classAbbr)
          .toString()
          .replace(/,/g, ', ') +
        is_are +
        ' not shown because the' +
        (tbaClasses.length > 1 ? ' times' : ' time') +
        is_are +
        ' TBA.';
      bigSchedDiv.appendChild(tbaClassesP);
      $(tbaClassesP).addClass('tba-classes');
    }

    // creates schedule table
    schedArr.forEach(function (schedule, idx) {
      scheduleDiv = document.createElement('div');
      idx % 2 === 0
        ? $(scheduleDiv).addClass('schedule-div')
        : $(scheduleDiv)
            .addClass('schedule-div')
            .css('background-color', '#dedede');

      let table = document.createElement('table');
      $(table).addClass('schedule-table');
      scheduleDiv.appendChild(table);
      let caption = table.createCaption();
      let capSpan = document.createElement('span');
      let capButtonSpan = document.createElement('span');
      let pickSchedBtn = document.createElement('button');
      caption.appendChild(capSpan);
      caption.appendChild(capButtonSpan);
      capButtonSpan.appendChild(pickSchedBtn);
      capSpan.innerHTML = 'Schedule #' + (idx + 1).toString();
      pickSchedBtn.className = 'myButton modalButton';
      pickSchedBtn.innerHTML = 'Pick Schedule';

      // Remove classes not in schedule from cart
      pickSchedBtn.addEventListener('click', () => {
        const num = (
          pickSchedBtn.parentNode?.previousSibling as HTMLElement | null
        )?.innerHTML.match(/[0-9]+/);
        if (!num) return;

        let curSched = schedArr[~~num - 1];
        let classTab = document
          .getElementById('studentCart')
          ?.getElementsByClassName('classTable');

        let inSchedule = new Map();
        curSched.forEach((c) => {
          // gets key for inSchedule which is the index of the overall class (class table)
          let key = Array.from(parent2 ?? []).findIndex((el) =>
            (el.children[0] as HTMLElement).innerText.includes(c.classAbbr)
          );
          // gets value for key which is index of section in class
          let value = [
            Array.from(
              classTab?.[key]?.getElementsByClassName('classRow') ?? []
            ).findIndex(
              (el) =>
                (
                  el.querySelector('.classSection') as HTMLElement | null
                )?.innerText.trim() === c.sections[0]
            ),
          ];
          if (inSchedule.has(key))
            inSchedule.set(key, inSchedule.get(key).concat(value));
          else inSchedule.set(key, value);
        });

        // if key & value are not in inSchedule => remove
        Array.from(classTab ?? []).forEach((cl, i) =>
          Array.from(cl.getElementsByClassName('classRow')).forEach((el, k) => {
            // If not including class in schedule making via preferences, then i will not be in 'inSchedule'
            // TODO: change the following:
            // In preferences, if a certain section is not included then it will still be deleted
            if (!inSchedule.has(i)) {
              // class not in schedule -- remove or don't remove based on preference
              if (includeClassesInRemoval) {
                (
                  el
                    .querySelector('.classActionButtons')
                    ?.querySelector(
                      "a[title='Remove Class From Cart']"
                    ) as HTMLElement | null
                )?.click();
              }
            } else if (!inSchedule.get(i).includes(k)) {
              let key = (
                el.parentElement
                  ?.querySelectorAll('classHeader')
                  .item(0)
                  ?.getElementsByClassName('classAbbreviation')
                  .item(0) as HTMLElement | null
              )?.innerText
                ?.match(/[^:]+/)?.[0]
                ?.replace(' ', '_');

              let value = (
                el.querySelector('.classSection') as HTMLElement | null
              )?.innerText.match(/[\S]+/)?.[0];

              if (
                includePreferences.has(key) &&
                includePreferences.get(key).includes(value)
              ) {
                if (includeClassesInRemoval)
                  (
                    el
                      .querySelector('.classActionButtons')
                      ?.querySelector(
                        "a[title='Remove Class From Cart']"
                      ) as HTMLAnchorElement | null
                  )?.click();
              } else {
                (
                  el
                    .querySelector('.classActionButtons')
                    ?.querySelector(
                      "a[title='Remove Class From Cart']"
                    ) as HTMLAnchorElement | null
                )?.click();
              }
            }
          })
        );

        modal.style.display = 'none';
        $('#modalBody').html('');

        scheduleArr = [];
      });

      // creates table
      $(capSpan).css('font-family', font).addClass('schedule-caption');
      let divId = caption.querySelector('span')?.innerText;
      if (divId) scheduleDiv.id = divId;
      var header = table.createTHead();
      var hrow = header.insertRow(0);
      for (var i = 0; i < 8; i++) {
        var hcell = document.createElement('th');
        hrow.appendChild(hcell);
        $(hcell).css('font-family', font).addClass('schedule-th');
        switch (i) {
          case 0:
            hcell.innerHTML = '';
            break;
          case 1:
            hcell.innerHTML = 'Mon';
            break;
          case 2:
            hcell.innerHTML = 'Tues';
            break;
          case 3:
            hcell.innerHTML = 'Wed';
            break;
          case 4:
            hcell.innerHTML = 'Thurs';
            break;
          case 5:
            hcell.innerHTML = 'Fri';
            break;
          case 6:
            hcell.innerHTML = 'Sat';
            break;
          case 7:
            hcell.innerHTML = 'Sun';
            break;
        }
      }

      // creates times
      var tBody = table.createTBody();
      for (var i = 0; i < 13; i++) {
        var row = tBody.insertRow(i);
        $(row).addClass('schedule-tr');
        for (var j = 0; j < 8; j++) {
          var cell = row.insertCell(j);
          $(cell).addClass('schedule-td');
          if (j === 0) {
            var timeText =
              i + 7 <= 12
                ? (i + 7).toString()
                : (((i + 7) % 13) + 1).toString();
            if (i + 7 < 12) {
              timeText += ' am';
            } else {
              timeText += ' pm';
            }
            cell.innerHTML = timeText;
            $(cell).addClass('c1');
          } else {
            $(cell).append($('<div></div>').addClass('schedule-td-div'));
          }
        }
      }
      bigSchedDiv.appendChild(scheduleDiv);
      $(scheduleDiv).css({
        position: 'relative',
      });
    });

    $('#modalBody').append(bigSchedDiv);
    document
      .getElementsByClassName('modal-header')[0]
      .getElementsByTagName('h2')[0].innerHTML = 'Pick Schedule';
    $('.modal-header h2').css('color', 'black');
    $('.modal-content').css('font-family', font);
    modal.style.display = 'block';

    schedArr.forEach((schedule, idx) => {
      // Places class
      scheduleDiv = document.getElementsByClassName('schedule-div')[
        idx
      ] as HTMLDivElement;
      schedule.forEach((c) => {
        if (c.days[0] !== 'TBA') {
          for (var k = 0; k < c.days[0].length; k++) {
            var classDiv = document.createElement('div');
            classDiv.className = 'class';
            $(classDiv).prop('time', c.times[0]);
            $(classDiv).prop('location', c.location[0]);
            classDiv.id = c.classAbbr.replace(/\s/g, '') + '_' + k;
            var classTextDiv = document.createElement('div');
            classTextDiv.className = 'classText';
            classTextDiv.innerHTML = c.classAbbr + '-' + c.sections[0];
            classDiv.appendChild(classTextDiv);
            placeClass(classDiv, scheduleDiv, c.days[0].charAt(k), c.times[0]);
            let offsetHeight = $(classDiv).parent().get(0)?.offsetHeight ?? 100; // TODO: is 100 right?
            var height =
              Course.lengthOfClass(c.times[0]) * 100 - 200 / offsetHeight; // account for border
            $(classDiv).css('height', height.toString() + '%');
          }
        }
      });
    });
  } else {
    let errorText =
      "<div class='errorText'><p>There was no possible schedule that could be created from the classes in your cart.</p>";
    let errorClasses = Array.from(overlappedClasses);
    let nonOverlapped = errorClasses
      .filter((item) => item[1] === 0)
      .map((item) => item[0].substring(0, item[0].indexOf('-')));

    errorClasses = errorClasses.filter((item) => {
      let str = item[0].substring(0, item[0].indexOf('-'));
      return !nonOverlapped.includes(str);
    });
    errorClasses = errorClasses.sort((a, b) => b[1] - a[1]);
    let ec = new Set(
      errorClasses.map((item) => item[0].substring(0, item[0].indexOf('-')))
    );
    if (ec.size !== 0) {
      errorText +=
        "<p>The following classes have conflicts:</p><br/><p style='padding-left: 10px'>" +
        ec.toString().replace(/,/g, ', ') +
        '</p><br/><p>In preferences you can choose to <strong><i>not</i></strong> include the classes when creating a schedule. This will not remove the classes from your cart but will just ignore the classes when creating schedules. If a schedule is chosen, then the ignored classes will be removed from your cart.</p><p>Alternately, try clicking "show" for classes that do not meet preferences in preferences.</p></div>';
    } else {
      errorText +=
        '<p>Try clicking "show" for classes that do not meet preferences in preferences.</p></div>';
    }
    $('.modal-header h2').html('Error creating schedule!');

    $('.modal-header h2').css('color', 'red');
    $('.modal-content').css('font-family', font);
    $('#modalBody').html(errorText);
    modal.style.display = 'block';
  }
}

/*
 *	Creates detailed schedule array from the less detailed array
 */
export function convertToDetailed(arr: ScheduleArray[]) {
  let ss: Course[][] = [];
  let s: Course[] = [];
  let classAbbr: string;
  let section: string;
  let course: Course | undefined, index: number | undefined;

  arr.forEach((sched) => {
    for (const c of sched) {
      classAbbr = c[0];
      section = c[1];

      [course, index] = getClass(classAbbr, section);
      if (!course || !index) {
        continue;
      }

      if (/\n/.test(course.times[index]) && /\n/.test(course.days[index])) {
        let times = course.times[index].split(/\n/);
        let days = course.days[index].split(/\n/);
        let locations = course.location[index].split(/\n/);
        while (locations.length < days.length) {
          locations.push(locations[locations.length - 1]);
        }
        for (let i = 0; i < times.length; ++i) {
          // TODO:: fix this
          s.push(
            new Course(
              course.classAbbr,
              course.classDesc,
              [course.sections[index]],
              [course.type[index]],
              [course.prof[index]],
              [course.hours[index]],
              [days[i]],
              [times[i]],
              [locations[i]]
            )
          );
        }
      } else {
        s.push(
          new Course(
            course.classAbbr,
            course.classDesc,
            [course.sections[index]],
            [course.type[index]],
            [course.prof[index]],
            [course.hours[index]],
            [course.days[index]],
            [course.times[index]],
            [course.location[index]]
          )
        );
      }
    }
    ss.push(s);
    s = [];
  });

  return ss;
}

/*
 *	Gets the class with the class abbreviation and section from
 *	the class array. Returns class and index of section
 */
export function getClass(
  classAbbr: string,
  section: string
): [course: Course, i: number] | [] {
  for (var i = 0; i < classArr.length; i++) {
    if (classAbbr === classArr[i].classAbbr) {
      for (var j = 0; j < classArr[i].sections.length; j++) {
        if (classArr[i].sections[j] === section) {
          return [classArr[i], j];
        }
      }
    }
  }
  return [];
}

/*
 *	Places class on schedule based on time and day
 */
export function placeClass(
  classDiv: HTMLDivElement,
  scheduleDiv: HTMLDivElement,
  day: string,
  time: string
) {
  var divHeight = scheduleDiv.offsetHeight;
  if (divHeight !== 0) {
    var xDisplace = 0;
    switch (day) {
      case 'M':
        xDisplace = 0;
        break;
      case 'T':
        xDisplace = 1;
        break;
      case 'W':
        xDisplace = 2;
        break;
      case 'R':
        xDisplace = 3;
        break;
      case 'F':
        xDisplace = 4;
        break;
      case 'S':
        xDisplace = 5;
        break;
      case 'U':
        xDisplace = 6;
        break;
    }
    time = time.substring(0, time.indexOf('-'));
    var h, m;
    if (time.indexOf('p') >= 0 && time.substring(0, 2) !== '12') {
      h = ~~time.substring(0, 2) + 12;
    } else {
      h = ~~time.substring(0, 2);
    }
    h -= 7; // 7am = 0
    m = ~~time.substring(time.indexOf(':') + 1, time.indexOf(':') + 3);
    m /= 60;
    let tr = $(scheduleDiv).find('tbody tr').get(h);
    if (tr) {
      let cell = $(tr).find('td .schedule-td-div').get(xDisplace);
      cell?.appendChild(classDiv);
    }

    $(classDiv).css('top', (m * 100).toString() + '%');

    // adds detailed comment bubble on hover
    var commentDiv = document.createElement('div');
    commentDiv.className = 'comment-div';
    var commentImg = document.createElement('img');
    var iconUrl2 = chrome.extension.getURL('png/comment-pic2.png');
    var iconUrl3 = chrome.extension.getURL('png/comment-pic3.png');
    if (
      $(scheduleDiv).css('background-color').toString() === 'rgb(222, 222, 222)'
    ) {
      $(commentImg).attr('src', iconUrl3);
    } else {
      $(commentImg).attr('src', iconUrl2);
    }
    commentImg.className = 'comment-img';
    commentDiv.appendChild(commentImg);
    scheduleDiv.appendChild(commentDiv);

    var upperLeftText = document.createElement('div');
    upperLeftText.innerHTML = 'Cannot display additional information.';
    upperLeftText.className = 'comment-text';
    commentDiv.appendChild(upperLeftText);
    $(upperLeftText).css('font-family', font);

    for (let i = 0; i < schedArr.length; i++) {
      if (scheduleDiv.id.includes(`${i + 1}`)) {
        for (var j = 0; j < schedArr[i].length; j++) {
          if (
            (classDiv.firstChild as HTMLElement | null)?.innerHTML.includes(
              schedArr[i][j].classAbbr + '-' + schedArr[i][j].sections[0]
            )
          ) {
            upperLeftText.innerHTML =
              (classDiv.firstChild as HTMLElement | null)?.innerHTML +
              '<br/>' +
              $(classDiv).prop('time') +
              '&emsp;' +
              $(classDiv).prop('location') +
              '<br/>' +
              schedArr[i][j].prof[0];
          }
        }
      }
    }

    // displays when hovered over class div
    classDiv.onmouseover = (event) => {
      commentDiv.style.display = 'block';
      var curClassDiv: HTMLElement;
      if ((event.target as HTMLElement)?.className === 'class') {
        curClassDiv = event.target as HTMLElement;
      } else {
        curClassDiv = (event.target as HTMLElement).parentNode as HTMLElement;
      }

      let top =
        ($(classDiv).offset()?.top ?? 0) -
        ($(scheduleDiv).offset()?.top ?? 0) -
        ($(commentDiv).height() ?? 0);
      let left =
        ($(classDiv).offset()?.left ?? 0) -
        ($(scheduleDiv).offset()?.left ?? 0);

      $(commentDiv).css({
        top: top,
        left: left,
      });
    };
    classDiv.onmouseout = () => {
      commentDiv.style.display = 'none';
    };
  }
  // scheduleDiv.appendChild(classDiv);
}
