import { safeParseInt } from '../utils';
import { CourseSectionDays } from './courseSectionDays';
import { CourseSectionTime } from './courseSectionTime';
import { Time } from './time';
import { CourseSectionAvailabilty, CourseData, Days } from './types';

// Higher-order function for base parsers
const createParser = <T>(parser: (str: string) => T): ((str: string) => T) => {
  return (str: string): T => parser(str.trim());
};

export const courseTitleParser = createParser(
  (str: string): Omit<CourseData, 'description'> => {
    const s = str.replace(/:/g, '');
    const [department, courseNumber] = s.split(' ');
    return {
      department,
      courseNumber,
    };
  }
);

export const descriptionParser = createParser((str: string) => str);
export const sectionParser = createParser((str: string) => str);
export const typeParser = createParser((str: string) => str);

export const hoursParser = createParser((str: string): number => {
  const s = str.match(/[\d.]+/)?.[0];
  if (s) {
    return parseFloat(s);
  }
  throw Error(`Could not parse "${str}" as hours`);
});

export const availabilityParser = createParser(
  (str: string): CourseSectionAvailabilty => {
    const [filled, total] = str.split('/').map(safeParseInt);
    if (filled !== undefined && total !== undefined) {
      return { filled, total };
    }
    throw Error(`Could not parse "${str}" as availability`);
  }
);

const daysMap: Record<string, Days> = Object.freeze({
  M: 'monday',
  T: 'tuesday',
  W: 'wednesday',
  R: 'thursday',
  F: 'friday',
  S: 'saturday',
  U: 'sunday',
  Sa: 'saturday',
  Su: 'sunday',
});

export const daysParser = createParser((str: string): CourseSectionDays => {
  const base: Days[] = [];

  for (const d of str.split('')) {
    if (d in daysMap) {
      base.push(daysMap[d]);
    }
  }

  return new CourseSectionDays(base);
});

export const timeParser = createParser((str: string): CourseSectionTime => {
  const [startTime, endTime] = str
    .split('-')
    .map((t) => Time.fromString(t.trim()));
  if (startTime && endTime) {
    return new CourseSectionTime(startTime, endTime);
  }

  throw Error(`Could not parse "${str}" as availability`);
});

export const locationParser = createParser((str: string) => str);
export const professorParser = createParser((str: string) => str);

export const sectionParsers = {
  professor: professorParser,
  location: locationParser,
  time: timeParser,
  days: daysParser,
  availability: availabilityParser,
  hours: hoursParser,
  type: typeParser,
  section: sectionParser,
} as const;
