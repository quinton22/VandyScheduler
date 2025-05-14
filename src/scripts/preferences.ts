import { Days } from '../content_scripts/lib/course';
import { BreakTimes, Preferences } from '../content_scripts/lib/preferences';

const dayGroups: Record<Days, Days[]> = {
  monday: ['monday', 'wednesday', 'friday'],
  tuesday: ['tuesday', 'thursday'],
  wednesday: ['monday', 'wednesday', 'friday'],
  thursday: ['tuesday', 'thursday'],
  friday: ['monday', 'wednesday', 'friday'],
  saturday: ['saturday', 'sunday'],
  sunday: ['saturday', 'sunday'],
};

function updateSelectAll(parentElement: HTMLElement | null) {
  if (!parentElement) {
    return;
  }
  const selectAll = parentElement.querySelector('.select-all');

  const allTimes = Array.from(
    parentElement.getElementsByClassName('break-time') || []
  );

  const allChosen = allTimes.every((time) =>
    time.classList.contains('one-chosen')
  );

  selectAll?.classList.toggle('one-chosen', allChosen);
}

export function onBreakTimeClicked(event: MouseEvent) {
  const element = event.target as HTMLElement | null;
  if (!element) {
    return;
  }
  const time = element.getAttribute('data-time');
  const day = element.parentElement?.getAttribute('data-day');
  if (!time || !day) {
    return;
  }

  const isChosen = element.classList.toggle('one-chosen');
  updateSelectAll(element.parentElement);
  Preferences.instance.setBreakTime(day as Days, time as BreakTimes, isChosen);
}

export function onBreakTimeDoubleClicked(event: MouseEvent) {
  const element = event.target as HTMLElement | null;
  if (!element) {
    return;
  }

  const dayElement = element.parentElement;
  const allDaysElement = dayElement?.parentElement;
  if (!dayElement || !allDaysElement) {
    return;
  }

  const time = element.getAttribute('data-time');
  const day = dayElement.getAttribute('data-day');
  if (!time || !day) {
    return;
  }

  const dayGroup = dayGroups[day as Days];
  if (!dayGroup) {
    return;
  }

  // set chosen for specific time
  const isChosen = element.classList.toggle('one-chosen');

  const dayGroupElements = dayGroup.map((day) =>
    allDaysElement.querySelector(`[data-day="${day}"]`)
  );

  for (const dayGroupElement of dayGroupElements) {
    const timeElement = dayGroupElement?.querySelector(`[data-time="${time}"]`);
    timeElement?.classList.toggle('one-chosen', isChosen);
  }

  updateSelectAll(dayElement);

  Preferences.instance.updateBreakTimes(
    Object.fromEntries(dayGroup.map((day) => [day, { [time]: isChosen }]))
  );
}

function selectAllClicked(dayElement: HTMLElement, force?: boolean) {
  const allTimes = Array.from(
    dayElement.getElementsByClassName('break-time') || []
  );

  const chooseAll =
    force ?? !allTimes.every((time) => time.classList.contains('one-chosen'));

  allTimes.forEach((time) => {
    time.classList.toggle('one-chosen', chooseAll);
  });

  Preferences.instance.setAllBreakTimes(
    dayElement.getAttribute('data-day') as Days,
    chooseAll
  );

  return chooseAll;
}

export function onSelectAllClicked(event: MouseEvent) {
  const element = event.target as HTMLElement | null;
  if (!element) {
    return;
  }

  const parentElement = element.parentElement;
  if (!parentElement) {
    return;
  }

  selectAllClicked(element.parentElement);
}

export function onSelectAllDoubleClicked(event: MouseEvent) {
  const element = event.target as HTMLElement | null;
  if (!element) {
    return;
  }

  const dayElement = element.parentElement;
  const allDaysElement = dayElement?.parentElement;
  if (!dayElement || !allDaysElement) {
    return;
  }

  const day = dayElement.getAttribute('data-day');
  if (!day) {
    return;
  }

  const dayGroup = dayGroups[day as Days];
  if (!dayGroup) {
    return;
  }

  const value = selectAllClicked(dayElement);

  const dayGroupElements = dayGroup.map((day) =>
    allDaysElement.querySelector(`[data-day="${day}"]`)
  );

  for (const dayGroupElement of dayGroupElements) {
    if (dayGroupElement) {
      selectAllClicked(dayGroupElement as HTMLElement, value);
    }
  }
}

export function onNoPrefMetClicked(event: MouseEvent) {
  const element = event.target as HTMLInputElement | null;
  if (!element) {
    return;
  }

  Preferences.instance.setPreference('noPrefMet', JSON.parse(element.value));
}

export function onKeepCoursesInCartClicked(event: MouseEvent) {
  const element = event.target as HTMLInputElement | null;
  if (!element) {
    return;
  }

  Preferences.instance.setPreference(
    'retainCoursesInCart',
    JSON.parse(element.value)
  );
}

export function onRadioContainerClicked(event: MouseEvent) {
  const element = event.target as HTMLInputElement | null;
  if (!element) {
    return;
  }

  element.getElementsByTagName('input')[0].click();
}
