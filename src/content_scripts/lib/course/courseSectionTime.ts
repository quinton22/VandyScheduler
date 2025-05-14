import { Time } from './time';

export class CourseSectionTime {
  private _start: Time;
  private _end: Time;

  constructor(start: Time, end: Time) {
    this._start = start;
    this._end = end;
  }

  get start(): Time {
    return this._start.copy();
  }
  get end(): Time {
    return this._end.copy();
  }

  get length(): number {
    return Time.difference(this.end, this.start);
  }

  /**
   * Returns true if this overlaps with other
   * @param other
   */
  overlapsWith(other: CourseSectionTime): boolean {
    return this.start.isBefore(other.end) && other.start.isBefore(this.end);
  }
}
