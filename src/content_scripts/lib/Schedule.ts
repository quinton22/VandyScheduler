import { Course } from './Course';

type CourseTuple = [
  classAbbr: string,
  section: string,
  time: string,
  days: string,
  type?: string
];
export type ScheduleArray = Array<CourseTuple>;

export class Schedule {
  public courseList: Course[];
  public scheduleArr: ScheduleArray[];
  public overlappedClasses: Map<string, number>;

  constructor(courseList: Course[]) {
    this.courseList = courseList; // all the classes to be put in schedule
    this.scheduleArr = []; // Array of schedules
    this.overlappedClasses = new Map();

    this.sortClasses();
    this.checkOverlapOfAllClasses();
  }

  /*
   *	Makes initial call to the recursive loop & sets the current schedule
   *  to empty
   */
  sortClasses() {
    let schedule: ScheduleArray = [];
    if (this.courseList.length > 0) {
      this.sortClassesSub(this.courseList, schedule);
    }
  }

  /*
   *	Recursive sorting method of classes that takes each class and compares
   *	times and days to check overlap and places into a schedule
   */
  sortClassesSub(subClassArr: Course[], schedule: ScheduleArray) {
    let newSubClassArr: Course[] = [];

    if (subClassArr.length > 1) {
      for (let j = 1; j < subClassArr.length; j++) {
        newSubClassArr[j - 1] = subClassArr[j];
      }
    }

    for (let i = 0; i < subClassArr[0].times.length; i++) {
      let curClass: CourseTuple = [
        subClassArr[0].classAbbr,
        subClassArr[0].sections[i],
        subClassArr[0].times[i],
        subClassArr[0].days[i],
      ];

      let newSched: ScheduleArray = [];
      for (let j = 0; j < schedule.length; j++) {
        newSched.push(schedule[j]);
      }

      if (!Schedule.checkOverlap(curClass, newSched)) {
        if (subClassArr.length > 1) {
          newSched.push(curClass);
          this.sortClassesSub(newSubClassArr, newSched);
        } else {
          newSched.push(curClass);
          this.scheduleArr.push(newSched);
        }
      }
    }
  }

  /*
   *	Checks the overlap of a class with the schedule it is in
   *	returns true if overlap
   */
  static checkOverlap(currentCourse: CourseTuple, schedule: ScheduleArray) {
    for (var i = 0; i < schedule.length; ++i) {
      if (schedule[i][0] !== currentCourse[0]) {
        if (
          /\n/.test(schedule[i][2]) &&
          /\n/.test(schedule[i][3]) &&
          /\n/.test(currentCourse[2]) &&
          /\n/.test(currentCourse[3])
        ) {
          let times1 = schedule[i][2].split(/\n/);
          let days1 = schedule[i][3].split(/\n/);
          let times2 = currentCourse[2].split(/\n/);
          let days2 = currentCourse[3].split(/\n/);

          for (let j = 0; j < days1.length; ++j) {
            for (let k = 0; k < days2.length; ++k) {
              if (!Course.compareDays(days1[j], days2[k])) {
                if (!Course.compareTimes(times1[j], times2[k])) {
                  return true;
                }
              }
            }
          }
        } else if (/\n/.test(schedule[i][2]) && /\n/.test(schedule[i][3])) {
          let times = schedule[i][2].split(/\n/);
          let days = schedule[i][3].split(/\n/);
          for (let j = 0; j < days.length; ++j) {
            if (!Course.compareDays(days[j], currentCourse[3])) {
              if (!Course.compareTimes(times[j], currentCourse[2])) {
                return true;
              }
            }
          }
        } else if (/\n/.test(currentCourse[2]) && /\n/.test(currentCourse[3])) {
          let times = currentCourse[2].split(/\n/);
          let days = currentCourse[3].split(/\n/);
          for (let j = 0; j < days.length; ++j) {
            if (!Course.compareDays(days[j], schedule[i][3])) {
              if (!Course.compareTimes(times[j], schedule[i][2])) {
                return true;
              }
            }
          }
        } else {
          if (!Course.compareDays(schedule[i][3], currentCourse[3])) {
            if (!Course.compareTimes(schedule[i][2], currentCourse[2])) {
              return true; // times are equal
            } // days are equal
          }
        }
      }
    }

    return false; // no overlap
  }

  checkOverlapOfAllClasses() {
    this.courseList.forEach((_class) => {
      _class.sections.forEach((section, i) => {
        this.overlappedClasses.set(
          _class.classAbbr + '-' + section,
          this.courseList
            .map((c) => {
              let overlap = 0;
              if (c.classAbbr !== _class.classAbbr) {
                c.times.forEach((time, ind) => {
                  if (
                    Schedule.checkOverlap(
                      [
                        _class.classAbbr,
                        section,
                        _class.times[i],
                        _class.days[i],
                        _class.type[i],
                      ],
                      [
                        [
                          c.classAbbr,
                          c.sections[ind],
                          time,
                          c.days[ind],
                          c.type[i],
                        ],
                      ]
                    )
                  ) {
                    ++overlap;
                  }
                });
              }
              return overlap;
            })
            .reduce((accum, current) => accum + current)
        );
      });
    });
  }
}