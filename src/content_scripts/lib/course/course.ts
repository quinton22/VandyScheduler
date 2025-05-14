import { CourseSectionDays } from './courseSectionDays';
import { CourseSectionTime } from './courseSectionTime';
import {
  courseTitleParser,
  descriptionParser,
  sectionParsers,
} from './parsers';
import { CourseData, CourseSectionAvailabilty, RawSectionData } from './types';

export class CourseSection {
  public section: string;
  public type: string;
  public professor: string;
  public hours: number;
  public days: CourseSectionDays;
  public availability: CourseSectionAvailabilty;
  public time: CourseSectionTime;
  public location: string;

  private _course;

  constructor(course: Course | undefined, sectionData: RawSectionData) {
    this._course = course;
    this.section = sectionParsers.section(sectionData.section);
    this.type = sectionData.type;
    this.professor = sectionParsers.professor(sectionData.professor);
    this.hours = sectionParsers.hours(sectionData.hours);
    this.days = sectionParsers.days(sectionData.days);
    this.time = sectionParsers.time(sectionData.time);
    this.location = sectionParsers.location(sectionData.location);
    this.availability = sectionParsers.availability(sectionData.availability);
  }

  get course() {
    return this._course;
  }

  get length(): number {
    return this.time.length;
  }

  overlapsWith(other: CourseSection): boolean {
    return (
      this.days.overlapsWith(other.days) && this.time.overlapsWith(other.time)
    );
  }

  getNumOverlaps(others: CourseSection[]): number {
    return others.filter((o) => this.overlapsWith(o)).length;
  }

  addCourse(c: Course): void {
    this._course ??= c;
  }

  toString() {
    return JSON.stringify({
      course: this.course?.classAbbr,
      section: this.section,
      type: this.type,
      prof: this.professor,
      hours: this.hours,
      days: this.days,
      time: this.time,
      location: this.location,
    });
  }
}

export class Course {
  public classAbbr: string;
  public classDesc: string;
  public sections: Array<CourseSection>;

  public get courseData(): CourseData {
    return {
      ...courseTitleParser(this.classAbbr),
      description: descriptionParser(this.classDesc),
    };
  }

  static fromArrays(
    classAbbr: string,
    classDesc: string,
    sections: string[],
    type: string[],
    prof: string[],
    hours: string[],
    days: string[],
    times: string[],
    location: string[],
    availability: string[] = []
  ): Course {
    const s: CourseSection[] = [];
    const course = new Course(classAbbr, classDesc, s);
    for (let i = 0; i < sections.length; ++i) {
      s.push(
        new CourseSection(course, {
          section: sections[i],
          type: type[i],
          professor: prof[i],
          hours: hours[i],
          days: days[i],
          time: times[i],
          location: location[i],
          availability: availability[i],
        })
      );
    }
    course.sections = s;
    return course;
  }

  constructor(
    classAbbr: string,
    classDesc: string,
    sections: CourseSection[] = []
  ) {
    this.classAbbr = classAbbr;
    this.classDesc = classDesc;
    this.sections = sections;
  }

  addSection(rawSectionData: RawSectionData) {
    this.sections.push(new CourseSection(this, rawSectionData));
  }

  toString() {
    return JSON.stringify({
      classAbbr: this.classAbbr,
      classDesc: this.classDesc,
      sections: this.sections.map((s) => s.toString()),
    });
  }

  equal(other: Course) {
    return this.toString() === other.toString();
  }

  copy() {
    return new Course(this.classAbbr, this.classDesc, this.sections);
  }

  removeSection(sectionString: string) {
    this.sections = this.sections.filter((s) => s.section !== sectionString);
  }
}
