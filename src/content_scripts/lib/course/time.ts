export enum TimeStringType {
  h12,
  h24,
  unknown,
}

export function enforceInt(i: number) {
  if (Math.floor(i) !== i) {
    throw Error(`Number is not integer: ${i}`);
  }
}

export function enforceRange(i: number, ...inclusiveRange: [number, number]) {
  if (i < inclusiveRange[0] || i > inclusiveRange[1]) {
    throw Error(`Number not in inclusive range ${inclusiveRange}: ${i}`);
  }
}

export class Time {
  private _hour: number;
  private _minute: number;

  /**
   * Time should be in the format of hour: 0-24, minute: 0-60
   * @param hour @type {int} [0, 24)
   * @param minute @type {int} [0, 60)
   */
  constructor(hour: number, minute: number) {
    enforceInt(hour);
    enforceInt(minute);
    enforceRange(hour, 0, 23);
    enforceRange(minute, 0, 59);

    this._hour = hour;
    this._minute = minute;
  }

  static getStringType(str: string): TimeStringType {
    const h12r = /^\d{1,2}:\d{2}[ap]?$/;
    const h24r = /^\d{4}$/;

    if (h12r.test(str)) {
      return TimeStringType.h12;
    }

    if (h24r.test(str)) {
      return TimeStringType.h24;
    }

    return TimeStringType.unknown;
  }

  static fromString(str: string): Time {
    switch (Time.getStringType(str)) {
      case TimeStringType.h12:
        return Time.from12HrString(str);
      case TimeStringType.h24:
        return Time.from24HrString(str);
    }

    throw Error(
      'Invalid time string syntax. Format should be either hh:mma or hhmm'
    );
  }

  /**
   * @param str in the format of hh:mma
   * @returns {Time}
   */
  static from12HrString(str: string): Time {
    const match = /(?<hour>\d{2}):(?<minute>\d{2})(?<ampm>[ap])/.exec(str);

    if (match?.groups) {
      let hour = parseInt(match.groups.hour);
      const minute = parseInt(match.groups.minute);

      if (match.groups.ampm === 'p') {
        hour += hour !== 12 ? 12 : 0;
      } else if (hour === 12) {
        hour = 0;
      }

      return new Time(hour, minute);
    }

    throw Error('Invalid time string syntax. Format should be hh:mma');
  }

  static from24HrString(str: string): Time {
    const match = /(?<hour>\d{2})(?<minute>\d{2})/.exec(str);
    const hour = !!match?.groups?.hour && parseInt(match.groups.hour);
    const minute = !!match?.groups?.minute && parseInt(match.groups.minute);

    if (!hour || !minute) {
      throw Error('Invalid time string syntax. Format should be hhmm');
    }

    return new Time(hour, minute);
  }

  static difference(t1: Time, t2: Time) {
    return t1.hour - t2.hour + (t1.minute - t2.minute) / 60;
  }

  get hour() {
    return this._hour;
  }

  get hourString() {
    return this.toDoubleDigitString(this._hour);
  }

  get minute() {
    return this._minute;
  }

  get minuteString() {
    return this.toDoubleDigitString(this._minute);
  }

  get time() {
    return {
      hour: this._hour,
      minute: this._minute,
    };
  }

  private toDoubleDigitString(n: number) {
    return n < 10 ? `0${n}` : `${n}`;
  }

  timeString(is24Hr = false) {
    if (is24Hr) {
      return `${this.hourString}${this.minuteString}`;
    }
    const ampm = this._hour < 12 ? 'a' : 'p';
    const hour =
      this._hour > 12 ? this._hour - 12 : this._hour === 0 ? 12 : this._hour;
    return `${this.toDoubleDigitString(hour)}:${this.toDoubleDigitString(
      this._minute
    )}${ampm}`;
  }

  isBefore(other: Time): boolean {
    return (
      this.hour < other.hour ||
      (this.hour === other.hour && this.minute < other.minute)
    );
  }

  isAfter(other: Time): boolean {
    return (
      this.hour > other.hour ||
      (this.hour === other.hour && this.minute > other.minute)
    );
  }

  isEqual(other: Time): boolean {
    return other.hour === this.hour && other.minute === this.minute;
  }

  copy() {
    return new Time(this._hour, this._minute);
  }
}
