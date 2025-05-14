import preferencesHtml from 'bundle-text:./preferencesModal.html';
import breakDayHtml from 'bundle-text:./breakDay.html';
import { HtmlParser } from '../htmlParser';
import { preferences, BreakTime, Day } from '../../lib';

export function selectHour(this: Element) {
  const parent = this.parentElement;
  if (!parent) return;

  let hour: string | null | number = this.getAttribute('data-hour');
  if (!hour) return;
  try {
    hour = parseInt(hour);
  } catch (_) {
    return;
  }

  const day = parent.getAttribute('data-day');
  if (!day || !BreakTime.isValidDay(day) || !BreakTime.isValidHour(hour))
    return;

  preferences.breakTime?.toggle(day, hour);
  this.classList.toggle('one-chosen');

  const selectAll = parent.getElementsByClassName('select-all')[0];

  if (selectAll.classList.contains('one-chosen')) {
    selectAll.classList.remove('one-chosen');
  } else if (preferences.breakTime?.isAllSelected(day)) {
    selectAll.classList.add('one-chosen');
  }
}

export function selectAllForDay(this: Element) {
  const parent = this.parentElement;
  if (!parent) return;

  const key = parent.getAttribute('data-day');
  if (!BreakTime.isValidDay(key)) return;

  const selected = preferences.breakTime?.toggleAll(key);

  for (const el of parent.getElementsByClassName('break-select')) {
    if (selected) {
      el.classList.add('one-chosen');
    } else {
      el.classList.remove('one-chosen');
    }
  }
}

export function preferenceDblClickHandler(this: Element) {
  let hour: string | null | number = this.getAttribute('data-hour');
  if (!hour) return;

  const dayGroup = this.parentElement?.getAttribute('data-day-group');
  if (!dayGroup) return;
  const clickFlag = !this.classList.contains('one-chosen');

  for (const el of document.getElementsByClassName(dayGroup)) {
    const hourElement = el.getElementsByClassName(hour)[0];
    if (hourElement) {
      if (
        hourElement.classList.contains('one-chosen') ? !clickFlag : clickFlag
      ) {
        selectHour.bind(hourElement)();
      }
    }
  }
}

const showFirstTimeMessages = () => {
  const firstTime = preferences.breakTime === undefined;
  preferences.createBreakTime();

  if (firstTime) {
    for (const element of document.getElementsByClassName(
      'pref-first-time-hint' // TODO: set css for .pref-first-time-hint { display: none }
    )) {
      element.classList.add('first-time'); // TODO: set css for .first-time { display: inline-block }
    }
    // display hint
    /* <p class="pref-modal-text">
			Lunch break defaults to 12 p.m. and Saturdays and Sundays are default breaks. If you do not want this click "Clear Preferences."
		</p> */
  }
};

const syncPreferencesWithUi = () => {
  for (const el of document
    .getElementById('pref-not-met-form')
    ?.querySelectorAll('input') ?? []) {
    el.checked = JSON.parse(el.value) !== preferences.noPreferenceMet;
  }

  // TODO: bubble down?
  // $('.radio-container').each(
  //   (_, el) => (el.onclick = () => $(el).find('input')[0].click())
  // );

  // loading from preferences
  for (const day of BreakTime.AVAILABLE_DAYS) {
    const hours = preferences.breakTime?.get(day) ?? [];
    for (const hour of hours) {
      for (const el of document
        .getElementById(day)
        ?.parentElement?.getElementsByClassName(hour.toString()) ?? []) {
        el.classList.add('one-chosen');
      }
    }
  }
};

// TODO: move to breaktime
const getDayGroup = (day: Day) => {
  switch (day) {
    case 'Monday':
    case 'Wednesday':
    case 'Friday':
      return 'MWF';
    case 'Tuesday':
    case 'Thursday':
      return 'TR';
    case 'Saturday':
    case 'Sunday':
      return 'SU';
  }
};

const generateHtml = () => {
  const html = preferencesHtml.replace(
    '%breakDays%',
    BreakTime.AVAILABLE_DAYS.map((d) =>
      breakDayHtml.replace('%day%', d).replace('%dayGroup%', getDayGroup(d))
    ).join('')
  );
  return HtmlParser.parse(html);
};

export const createPreferencesModal = async () => {
  const prefModal = generateHtml();
  document.body.append(prefModal);

  await preferences.loadFromStorage();

  showFirstTimeMessages();
  syncPreferencesWithUi();

  return prefModal;
};

export const closePrefModal = () => {
  const prefModal = document.getElementById('pref-modal');
  if (!prefModal) return;

  prefModal.style.display = 'none';
  void preferences.syncWithStorage();
};

export const clearPref = () => {
  document.getElementById('break-pref-input-show')?.click();
  for (const el of document.getElementsByClassName('break-select')) {
    el.classList.remove('one-chosen');
  }
  preferences.breakTime?.unselectAll();
};
