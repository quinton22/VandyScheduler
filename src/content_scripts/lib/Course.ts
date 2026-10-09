const parseTimeRange = (value: string): [number, number] | undefined => {
  const match = value.match(
    /^\s*(\d{1,2}):(\d{2})\s*(am|pm)?\s*-\s*(\d{1,2}):(\d{2})\s*(am|pm)?\s*$/i
  );
  if (!match) return;

  const startHour = Number(match[1]);
  const startMinute = Number(match[2]);
  const endHour = Number(match[4]);
  const endMinute = Number(match[5]);
  let startPeriod = match[3]?.toLowerCase();
  let endPeriod = match[6]?.toLowerCase();

  if (startPeriod && !endPeriod) {
    endPeriod =
      startPeriod === 'am' && endHour < startHour ? 'pm' : startPeriod;
  } else if (!startPeriod && endPeriod) {
    startPeriod =
      endPeriod === 'pm' &&
      startHour !== 12 &&
      (startHour > endHour || endHour === 12)
        ? 'am'
        : endPeriod;
  }

  const toMinutes = (hour: number, minute: number, period?: string) => {
    if (minute > 59) return;
    if (period) {
      if (hour < 1 || hour > 12) return;
      hour = (hour % 12) + (period === 'pm' ? 12 : 0);
    } else if (hour > 23) {
      return;
    }
    return hour * 60 + minute;
  };

  const start = toMinutes(startHour, startMinute, startPeriod);
  const end = toMinutes(endHour, endMinute, endPeriod);
  if (start === undefined || end === undefined) return;

  return [start, end];
};

export class Course {
  public classAbbr: string;
  public classDesc: string;
  public sections: string[];
  public type: string[];
  public prof: string[];
  public hours: string[];
  public days: string[];
  public times: string[];
  public location: string[];

  constructor(
    classAbbr: string,
    classDesc: string,
    sections: string[],
    type: string[],
    prof: string[],
    hours: string[],
    days: string[],
    times: string[],
    location: string[]
  ) {
    // Class Abbreviation
    // Type: String
    // Ex: "CS 1101"
    this.classAbbr = classAbbr;

    // Class Description
    // Type: String
    // Ex: "This is a description"
    this.classDesc = classDesc;

    // Class Section
    // Type: Array of String
    // Ex: "01" or "02"
    this.sections = sections;

    // Class type
    // Type: array of String
    // Ex: "Laboratory" or "Lecture"
    this.type = type;

    // Credit Hours
    // Type: array of String
    // Ex: "1.0hrs"
    this.hours = hours;

    // Class Times
    // Type: array of Strings
    // Ex: ["10:00-11:00", "9:35-10:50"]
    this.times = times;

    // Meeting Days
    // Type: array of Strings
    // Ex: ["MWF", "MWF", "TR"]
    this.days = days;

    // Professor
    // Type: array of Strings
    // Ex: ["Prof1", "Prof2", "Prof3"]
    this.prof = prof;

    // Location of class
    //	Type: array of Strings
    // Ex: ["Location1", "Location2", "Location3"]
    this.location = location;
  }

  /*
   *	Compares 2 times to determine if they overlap. Returns false if overlap
   */
  static compareTimes(t1: string, t2: string): boolean {
    const first = parseTimeRange(t1);
    const second = parseTimeRange(t2);
    if (!first || !second) return true;

    return first[1] <= second[0] || second[1] <= first[0];
  }

  /*
   *	Compares days to see if days overlap. Returns false if overlap
   */
  static compareDays(d1: string, d2: string): boolean {
    let d = true;
    for (let i = 0; i < d1.length; i++) {
      if (d2.indexOf(d1[i]) !== -1) {
        d = false; // d1 and d2 overlap
      }
    }

    return d;
  }

  /*
   *	Returns the length of a class in the form [hours].[min/60]
   */
  static lengthOfClass(t1: string): number {
    let hour1 = ~~t1.substring(t1.indexOf(':') - 2, t1.indexOf(':'));
    if (t1.indexOf('p') > 0 && t1.indexOf('p') < 7) {
      hour1 = hour1 !== 12 ? hour1 + 12 : hour1;
    }

    let minute1 = ~~t1.substring(t1.indexOf(':') + 1, t1.indexOf(':') + 3);
    minute1 /= 60;
    t1 = t1.substring(t1.indexOf('-') + 1);
    let hour2 = ~~t1.substring(t1.indexOf(':') - 2, t1.indexOf(':'));
    if (t1.indexOf('p') !== -1) {
      hour2 = hour2 !== 12 ? hour2 + 12 : hour2;
    }
    let minute2 = ~~t1.substring(t1.indexOf(':') + 1, t1.indexOf(':') + 3);
    minute2 /= 60;

    const len = hour2 + minute2 - hour1 - minute1;
    return len;
  }

  toString(): string {
    return JSON.stringify(this);
  }

  equal(other: Course): boolean {
    return this.toString() === other.toString();
  }

  copy(): Course {
    return new Course(
      this.classAbbr,
      this.classDesc,
      this.sections.slice(),
      this.type.slice(),
      this.prof.slice(),
      this.hours.slice(),
      this.days.slice(),
      this.times.slice(),
      this.location.slice()
    );
  }

  removeSection(section: string) {
    const index = this.sections.indexOf(section);
    this.sections = this.sections.filter((_, i) => i !== index);
    this.type = this.type.filter((_, i) => i !== index);
    this.prof = this.prof.filter((_, i) => i !== index);
    this.hours = this.hours.filter((_, i) => i !== index);
    this.days = this.days.filter((_, i) => i !== index);
    this.times = this.times.filter((_, i) => i !== index);
    this.location = this.location.filter((_, i) => i !== index);
  }
}
