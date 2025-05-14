import { sectionParsers } from './parsers';
import { Days } from './types';

export const ALL_DAYS_ORDERED: Days[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export class CourseSectionDays {
  private _days: Days[] = [];
  private _daysRecord: Record<Days, boolean> = {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  };

  constructor(days: Days[]) {
    this.days = days;
  }

  static fromString(str: string): CourseSectionDays {
    return sectionParsers.days(str);
  }

  set days(value: Days[]) {
    this._days = value.slice();
    for (const d of value) {
      this._daysRecord[d] = true;
    }
  }

  get daysList(): Days[] {
    return this._days.slice();
  }

  get daysRecord(): Record<Days, boolean> {
    return Object.assign({}, this._daysRecord);
  }

  hasDay(d: Days): boolean {
    return this._daysRecord[d];
  }

  overlapsWith(other: CourseSectionDays): boolean {
    return this.getOverlappingDays(other).length > 0;
  }

  getOverlappingDays(other: CourseSectionDays): Days[] {
    return this.days.filter((d) => other.hasDay(d));
  }
}
