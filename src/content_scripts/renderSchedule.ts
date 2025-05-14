import { Schedule } from './lib';
import { CourseSection } from './lib/course';
import { ALL_DAYS_ORDERED } from './lib/course/courseSectionDays';
import { Templates } from './lib/templates/templates';
import { TemplateIds } from '../html';

function getCourseElement(section: CourseSection, height: number, top: number) {
  const courseDiv = Templates.instance.getTemplate(TemplateIds.course, {
    courseText: `${section.course?.classAbbr}-${section.section}`,
  });

  courseDiv.setAttribute(
    'style',
    `height: ${height * 100}%; top: ${top * 100}%;`
  );
  courseDiv.setAttribute('time', section.time.toString());
  courseDiv.setAttribute('location', section.location);
  return courseDiv;
}

function placeCourseOnSchedule(
  section: CourseSection,
  scheduleElement: HTMLElement
) {
  for (const day of section.days.daysList) {
    const divHeight = scheduleElement.offsetHeight;
    if (divHeight === 0) {
      return;
    }

    const dx = ALL_DAYS_ORDERED.indexOf(day);

    const { hour, minute } = section.time.start.time;
    const dy = hour - 7; // 7am = 0
    const top = minute / 60;

    const height = section.time.length;

    const courseDiv = getCourseElement(section, height, top);
    scheduleElement
      .querySelector(
        'tbody tr:nth-child(' +
          (dy + 1) +
          ') td:nth-child(' +
          (dx + 1) +
          ' .schedule-td-div)'
      )
      ?.appendChild(courseDiv);

    // adds detailed comment bubble on hover
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment-div';
    const commentImg = document.createElement('img');
    const iconUrl2 = chrome.extension.getURL('png/comment-pic2.png');
    const iconUrl3 = chrome.extension.getURL('png/comment-pic3.png');

    if (
      Array.from(
        scheduleElement.parentElement?.getElementsByClassName('schedule-div') ??
          []
      ).indexOf(scheduleElement) %
        2 ===
      0
    ) {
      commentImg.src = iconUrl3;
    } else {
      commentImg.src = iconUrl2;
    }
    commentImg.className = 'comment-img';
    commentDiv.appendChild(commentImg);
    scheduleElement.appendChild(commentDiv);

    const upperLeftText = document.createElement('div');
    upperLeftText.innerHTML = 'Cannot display additional information.';
    upperLeftText.className = 'comment-text';
    commentDiv.appendChild(upperLeftText);
    // TODO
    // upperLeftText.style.fontFamily = font;

    // TODO: double check this
    if (section === section.course?.sections[0]) {
      upperLeftText.innerHTML =
        section.course?.classAbbr +
        '-' +
        section.section +
        '<br/>' +
        section.time.toString() +
        '&emsp;' +
        section.location +
        '<br/>' +
        section.professor;
    }

    // displays when hovered over class div
    courseDiv.onmouseover = () => {
      commentDiv.style.display = 'block';
      // var curClassDiv;
      // if (event.target.className === 'class') {
      //   curClassDiv = event.target;
      // } else {
      //   curClassDiv = event.target.parentNode;
      // }

      const top =
        courseDiv.offsetTop -
        scheduleElement.offsetTop -
        commentDiv.offsetHeight;
      const left = courseDiv.offsetLeft - scheduleElement.offsetLeft;

      commentDiv.style.top = `${top}px`;
      commentDiv.style.left = `${left}px`;
    };
    courseDiv.onmouseout = () => {
      commentDiv.style.display = 'none';
    };
  }
}

export function renderSchedule(schedule: Schedule, container: HTMLElement) {
  const schedules = schedule.getAllPossibleSchedules();

  for (const [i, sections] of schedules.entries()) {
    const scheduleElement = Templates.instance.getTemplate(
      TemplateIds.schedule,
      {
        scheduleNumber: `${i + 1}`,
      }
    );

    for (const section of sections) {
      placeCourseOnSchedule(section, scheduleElement);
    }

    container.append(scheduleElement);
  }
}
