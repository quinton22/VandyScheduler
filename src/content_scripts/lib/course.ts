export class CourseSection {
  public section: string;
  public type: string;
  public prof: string;
  public hours: string;
  public days: string;
  // TODO: input is in format hh:mma - hh:mma, should not expect a different format
  /**
   * Expected to be in the format of hh:mma-hh:mma where
   * 'hh' is '01'-'12', 'mm' is '00'-'59', and 'a' is 'a' or 'p'
   */
  public time: string;
  public location: string;

  private _course;

  constructor(
    course: Course | undefined,
    section: string,
    type: string,
    prof: string,
    hours: string,
    days: string,
    time: string,
    location: string
  ) {
    this._course = course;
    this.section = section;
    this.type = type;
    this.prof = prof;
    this.hours = hours;
    this.days = days;
    this.time = time;
    this.location = location;
  }

  get course() {
    return this._course;
  }

  public addCourse(c: Course): void {
    this._course ??= c;
  }
}

export class Course {
  public classAbbr: string;
  public classDesc: string;
  public sections: Array<CourseSection>;

  static fromArrays(
    classAbbr: string,
    classDesc: string,
    sections: string[],
    type: string[],
    prof: string[],
    hours: string[],
    days: string[],
    times: string[],
    location: string[]
  ): Course {
    const s: CourseSection[] = [];
    const course = new Course(classAbbr, classDesc, s);
    for (let i = 0; i < sections.length; ++i) {
      s.push(
        new CourseSection(
          course,
          sections[i],
          type[i],
          prof[i],
          hours[i],
          days[i],
          times[i],
          location[i]
        )
      );
    }
    course.sections = s;
    return course;
  }

  constructor(classAbbr: string, classDesc: string, sections: CourseSection[]) {
    this.classAbbr = classAbbr;
    this.classDesc = classDesc;
    this.sections = sections;
  }

  /*
   *  Compares 2 times to determine if they overlap. Returns false if overlap
   */
  static compareTimes(t1: string, t2: string) {
    while (t1.indexOf('p') !== -1) {
      if (t1.substring(t1.indexOf('p') - 5, t1.indexOf('p') - 3) !== '12') {
        t1 =
          t1.substring(0, t1.indexOf('p') - 5) +
          (
            ~~t1.substring(t1.indexOf('p') - 5, t1.indexOf('p') - 3) + 12
          ).toString() +
          t1.substring(t1.indexOf('p') - 3, t1.indexOf('p')) +
          t1.substring(t1.indexOf('p') + 1);
      } else {
        t1 =
          t1.substring(0, t1.indexOf('p')) + t1.substring(t1.indexOf('p') + 1);
      }
    }
    while (t2.indexOf('p') !== -1) {
      if (t2.substring(t2.indexOf('p') - 5, t2.indexOf('p') - 3) !== '12') {
        t2 =
          t2.substring(0, t2.indexOf('p') - 5) +
          (
            ~~t2.substring(t2.indexOf('p') - 5, t2.indexOf('p') - 3) + 12
          ).toString() +
          t2.substring(t2.indexOf('p') - 3, t2.indexOf('p')) +
          t2.substring(t2.indexOf('p') + 1);
      } else {
        t2 =
          t2.substring(0, t2.indexOf('p')) + t2.substring(t2.indexOf('p') + 1);
      }
    }

    const t11 = t1.substring(0, t1.indexOf('-'));
    const t12 = t1.substring(t1.indexOf('-') + 1);
    const t21 = t2.substring(0, t2.indexOf('-'));
    const t22 = t2.substring(t2.indexOf('-') + 1);

    if (
      (t21 >= t11 && t21 <= t12) ||
      (t22 >= t11 && t22 <= t12) ||
      (t11 >= t21 && t11 <= t22)
    ) {
      return false;
    } else {
      return true;
    }
  }

  /*
   *  Compares days to see if days overlap. Returns false if overlap
   */
  static compareDays(d1: string, d2: string) {
    for (let i = 0; i < d1.length; i++) {
      if (d2.indexOf(d1[i]) !== -1) {
        return false; // d1 and d2 overlap
      }
    }

    return true;
  }

  /*
   *  Returns the length of a class in the form [hours].[min/60]
   */
  static lengthOfClass(t1: string) {
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

    return hour2 + minute2 - hour1 - minute1;
  }

  toString() {
    return JSON.stringify(this);
  }

  equal(other: Course) {
    return this.toString() === other.toString();
  }

  copy() {
    return new Course(this.classAbbr, this.classDesc, this.sections);
  }

  removeSection(sectionString: string) {
    this.sections = this.sections.filter((s) => s.section === sectionString);
  }
}
