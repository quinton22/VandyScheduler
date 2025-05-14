import { Course } from './lib/course/course';
import { RawSectionData } from './lib/course/types';

const dataClassNames = Object.freeze({
  classSection: 'section',
  classHours: 'hours',
  classType: 'type',
  classAvailability: 'availability',
  classMeetingDays: 'days',
  classMeetingTimes: 'time',
  classBuilding: 'location',
  classInstructor: 'professor',
});

function parseCourseElementByTags(el: HTMLTableElement): Course {
  const header = el.querySelector('td.classHeader');
  if (!header) {
    throw new Error('No header found');
  }
  const [classAbbr, classDesc] = (header as HTMLTableCellElement).innerText
    .trim()
    .split(':');
  const course = new Course(classAbbr, classDesc, []);

  for (const sectionEl of Array.from(el.querySelectorAll('tr.classRow'))) {
    const sectionData = Object.fromEntries(
      Object.entries(dataClassNames).map(([k, v]) => [
        v,
        (
          sectionEl.querySelector(`td.${k}`) as HTMLTableCellElement
        ).innerText.trim(),
      ])
    ) as RawSectionData;
    course.addSection(sectionData);
  }
  return course;
}

/**
 *
 */
export function readAllCourseInformationFromCart(): Course[] | undefined {
  const courseCartElement = document.getElementById('studentCart');

  if (!courseCartElement) {
    return;
  }

  const courseElements = courseCartElement.getElementsByClassName('classTable');

  return Array.from(courseElements as HTMLCollectionOf<HTMLTableElement>).map(
    parseCourseElementByTags
  );
}

/**
 *	Makes a class "Class" and adds to an array containing all classes in the
 *	schedule
 */
export function addClass(courseElement: Element, classNumOnPage: number) {
  let classAbbr = courseElement.children[0].innerHTML;
  classAbbr = classAbbr.replace(/:/g, '');
  let classDesc = courseElement.children[1].innerHTML;
  let specificClass = document
    .getElementById('cartDiv')
    .getElementsByClassName('classTable')[classNumOnPage];
  let sectionsList = specificClass.getElementsByClassName('classSection');
  let profsList = specificClass.getElementsByClassName('classInstructor');
  let typeList = specificClass.getElementsByClassName('classType');
  let hoursList = specificClass.getElementsByClassName('classHours');
  let daysList = specificClass.getElementsByClassName('classMeetingDays');
  let timesList = specificClass.getElementsByClassName('classMeetingTimes');
  let classBuildingList = specificClass.getElementsByClassName('classBuilding');
  let sections = [];
  let profs = [];
  let types = [];
  let hours = [];
  let days = [];
  let times = [];
  let location = [];

  // Refines content
  for (let num = 0; num < sectionsList.length; ++num) {
    sections[num] = sectionsList[num].innerText.trim();
    profs[num] = profsList[num].innerText.trim();
    types[num] = typeList[num].innerText.trim();
    hours[num] = hoursList[num].innerText.replace(/\s+/g, '');
    days[num] = daysList[num].innerText.trim();
    times[num] = timesList[num].innerText.trim().replace(/ - /g, '-');
    location[num] = classBuildingList[num].innerText.trim();
  }

  let bigArr = [sections, types, profs, hours, days, times, location];
  let distinctTypes = new Set(types);
  distinctTypes.forEach((type) => {
    let typeIndices = types
      .map((t, i) => (t === type ? i : -1))
      .filter((index) => index !== -1);
    let bigArr2 = bigArr.map((littleArr) =>
      littleArr.filter((_, index) => typeIndices.includes(index))
    );
    let newClass = new Class_(classAbbr, classDesc, ...bigArr2);
    classArr.push(newClass);
  });
}

/**
 *	Clears class array and puts classes in cart in class arr
 */
export function updateClassArr() {
  const classCartEl = document.getElementById('studentCart');
  const classCartItemsEl = !classCartEl
    ? undefined
    : classCartEl.getElementsByClassName('left');

  if (!classCartItemsEl) {
    return;
  }

  let t: ReturnType<typeof setTimeout> | undefined;
  let oldclassArr = classArr.slice();
  classArr = [];

  // adds classes in cart to class arr
  if (t) {
    clearTimeout(t);
  }
  t = setTimeout(() => {
    for (let i = 0; i < classCartItemsEl.length; i++) {
      const item = classCartItemsEl[i];

      if (item.children) {
        addClass(item, i);
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
