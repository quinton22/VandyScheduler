import { Course, CourseSection } from './course';

export class Schedule {
  constructor(classesArr: Course[]) {
    this.classesArr = classesArr; // all the classes to be put in schedule

    this.sortClasses();
    this.checkOverlapOfAllClasses();
  }

  public classesArr: Course[];
  public scheduleArr: CourseSection[][] = [];
  public overlappedClasses = new Map();

  private get allSections(): CourseSection[] {
    return this.classesArr.flatMap((c) => c.sections);
  }

  /*
   *	Makes initial call to the recursive loop & sets the current schedule
   *  to empty
   */
  sortClasses() {
    if (this.classesArr.length > 0) {
      this.sortClassesSub(this.classesArr, []);
    }
  }

  /*
   *	Recursive sorting method of classes that takes each class and compares
   *	times and days to check overlap and places into a schedule
   */
  sortClassesSub(subClassArr: Course[], schedule: CourseSection[]) {
    const [firstCourse, ...newSubClassArr] = subClassArr;

    for (const section of firstCourse.sections) {
      const newSched: CourseSection[] = [...schedule];

      if (!Schedule.checkOverlap(section, newSched)) {
        newSched.push(section);

        if (newSubClassArr.length > 0) {
          this.sortClassesSub(newSubClassArr, newSched);
        } else {
          // end recursion
          this.scheduleArr.push(newSched);
        }
      }
    }
  }

  /*
   *	Checks the overlap of a class with the schedule it is in
   *	returns true if overlap
   */
  static checkOverlap(currentClass: CourseSection, schedule: CourseSection[]) {
    for (let i = 0; i < schedule.length; ++i) {
      if (schedule[i].course?.classAbbr !== currentClass.course?.classAbbr) {
        if (
          /\n/.test(schedule[i].time) &&
          /\n/.test(schedule[i].days) &&
          /\n/.test(currentClass.time) &&
          /\n/.test(currentClass.days)
        ) {
          const times1 = schedule[i].time.split(/\n/);
          const days1 = schedule[i].days.split(/\n/);
          const times2 = currentClass.time.split(/\n/);
          const days2 = currentClass.days.split(/\n/);

          for (let j = 0; j < days1.length; ++j) {
            for (let k = 0; k < days2.length; ++k) {
              if (!Course.compareDays(days1[j], days2[k])) {
                if (!Course.compareTimes(times1[j], times2[k])) {
                  return true;
                }
              }
            }
          }
        } else if (/\n/.test(schedule[i].time) && /\n/.test(schedule[i].days)) {
          const times = schedule[i].time.split(/\n/);
          const days = schedule[i].days.split(/\n/);
          for (let j = 0; j < days.length; ++j) {
            if (!Course.compareDays(days[j], currentClass.days)) {
              if (!Course.compareTimes(times[j], currentClass.time)) {
                return true;
              }
            }
          }
        } else if (
          /\n/.test(currentClass.time) &&
          /\n/.test(currentClass.days)
        ) {
          const times = currentClass.time.split(/\n/);
          const days = currentClass.days.split(/\n/);
          for (let j = 0; j < days.length; ++j) {
            if (!Course.compareDays(days[j], schedule[i].days)) {
              if (!Course.compareTimes(times[j], schedule[i].time)) {
                return true;
              }
            }
          }
        } else {
          if (!Course.compareDays(schedule[i].days, currentClass.days)) {
            if (!Course.compareTimes(schedule[i].time, currentClass.time)) {
              return true; // times are equal
            } // days are equal
          }
        }
      }
    }

    return false; // no overlap
  }

  checkOverlapOfAllClasses() {
    const allSections = this.allSections;

    for (const section of this.allSections) {
      this.overlappedClasses.set(
        `${section.course?.classAbbr}-${section.section}`,
        allSections.reduce((acc, curSection) => {
          if (section.course?.classAbbr === curSection.course?.classAbbr) {
            return acc;
          }
          return acc + (Schedule.checkOverlap(section, [curSection]) ? 1 : 0);
        }, 0)
      );
    }
  }
}
