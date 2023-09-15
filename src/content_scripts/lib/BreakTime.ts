export type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type DayAbbr = 'M' | 'T' | 'W' | 'R' | 'F' | 'S' | 'U';

export type Hour = 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18;

export const isWeekend = (day: Day) => day === 'Saturday' || day === 'Sunday';

export class BreakTime {
  static readonly AVAILABLE_DAYS: readonly Day[] = Object.freeze([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]);

  static readonly AVAILABLE_HOURS: readonly Hour[] = Object.freeze([
    7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
  ]);

  private static readonly DAY_ABBR_MAP: Record<Day, DayAbbr> = Object.freeze({
    Monday: 'M',
    Tuesday: 'T',
    Wednesday: 'W',
    Thursday: 'R',
    Friday: 'F',
    Saturday: 'S',
    Sunday: 'U',
  });

  static toDayAbbr(day: Day): DayAbbr {
    return BreakTime.DAY_ABBR_MAP[day];
  }

  static fromDayAbbr(d: DayAbbr): Day {
    return Object.entries(BreakTime.DAY_ABBR_MAP).find(
      ([_, v]) => v === d
    )![0] as Day;
  }

  static toTimeString(hour: Hour) {
    let h = `${hour}`;
    h = h.length < 2 ? `0${h}` : h;
    return `${h}:00-${h}:59`;
  }

  private map: Record<Day, Hour[]> = this.createDefaultMap();

  private createEmptyMap() {
    return BreakTime.AVAILABLE_DAYS.reduce(
      (prev, cur) => ({ ...prev, [cur]: [] }),
      {} as Record<Day, Hour[]>
    );
  }

  private createDefaultMap() {
    return BreakTime.AVAILABLE_DAYS.reduce(
      (prev, cur) => ({
        ...prev,
        [cur]: isWeekend(cur) ? BreakTime.AVAILABLE_HOURS.slice() : [12],
      }),
      {} as Record<Day, Hour[]>
    );
  }

  private insert(day: Day, hour: Hour, closest: number) {
    let index = this.map[day][closest] > hour ? closest : closest + 1;
    this.map[day].splice(index, 0, hour);
  }

  private remove(day: Day, index: number) {
    this.map[day].splice(index, 1);
  }

  // average number of iterations to get index or find closest is 4 on random lists
  private getIndexOrClosest(day: Day, hour: Hour) {
    let array = this.map[day];
    let guessIndex, index, val;
    let closest = 0;
    let offset = 0;
    let totalOffset = 0;
    while (true) {
      totalOffset += offset;
      offset = 0;

      guessIndex = Math.floor(
        ((hour - array[0]) * array.length) / BreakTime.AVAILABLE_HOURS.length
      );

      index = Math.min(guessIndex, array.length - 1);
      val = array[index];

      if (val === hour) {
        return { index, found: true };
      }

      if (val < hour) {
        offset = index + 1;
        closest = Math.min(index + 1, array.length - 1);
        array = array.slice(index + 1);
      } else {
        closest = Math.max(index - 1, 0);
        array = array.slice(0, index);
      }

      if (array.length === 0) {
        return { index: closest + totalOffset, found: false };
      }
    }
  }

  /**
   *
   * @param day
   * @param hour
   * @returns `true` if selected, `false` if unselected
   */
  toggle(day: Day, hour: Hour) {
    const { index, found } = this.getIndexOrClosest(day, hour);
    if (!found) {
      this.insert(day, hour, index);
    } else {
      this.remove(day, index);
    }

    return !found;
  }

  /**
   *
   * @param day
   * @param hour
   * @returns `true` if successfully selected, `false` if not
   */
  select(day: Day, hour: Hour) {
    const { index, found } = this.getIndexOrClosest(day, hour);
    if (found) {
      return false;
    }

    this.insert(day, hour, index);
    return true;
  }

  /**
   *
   * @param day
   * @param hour
   * @returns `true` if successfully unselected, `false` if not
   */
  unselect(day: Day, hour: Hour) {
    const { index, found } = this.getIndexOrClosest(day, hour);
    if (!found) {
      return false;
    }

    this.remove(day, index);
    return true;
  }

  /**
   *
   * @param day
   * @returns `true` if selected, `false` if unselected
   */
  toggleAll(day: Day) {
    const shouldSelectAll =
      this.map[day].length < BreakTime.AVAILABLE_HOURS.length;
    this.map[day] = shouldSelectAll ? BreakTime.AVAILABLE_HOURS.slice() : [];
    return shouldSelectAll;
  }

  selectAll(day?: Day) {
    if (!day) {
      BreakTime.AVAILABLE_DAYS.forEach(this.selectAll.bind(this));
      return;
    }

    this.map[day] = BreakTime.AVAILABLE_HOURS.slice();
  }

  unselectAll(day?: Day) {
    if (!day) {
      BreakTime.AVAILABLE_DAYS.forEach(this.unselectAll.bind(this));
      return;
    }

    this.map[day] = [];
  }

  private _get(day?: Day) {
    return !day ? this.map : this.map[day];
  }

  get(): Record<Day, Hour[]>;
  get(day: Day): Hour[];
  get(day?: Day) {
    return JSON.parse(JSON.stringify(this._get(day)));
  }

  isAllSelected(day: Day) {
    return this.map[day].length === BreakTime.AVAILABLE_HOURS.length;
  }

  isAllUnselected(day: Day) {
    return this.map[day].length === 0;
  }

  static isValidDay(str: any): str is Day {
    return (
      typeof str === 'string' &&
      (BreakTime.AVAILABLE_DAYS as string[]).includes(str)
    );
  }

  static isValidHour(num: any): num is Hour {
    return (
      typeof num === 'number' &&
      (BreakTime.AVAILABLE_HOURS as number[]).includes(num)
    );
  }

  private static isValidMap(object: any): object is Record<Day, Hour[]> {
    for (const key in object) {
      if (!BreakTime.isValidDay(key)) {
        return false;
      }

      if (!('length' in object[key])) {
        return false;
      }

      for (const hour of object[key]) {
        if (!BreakTime.isValidHour(hour)) {
          return false;
        }
      }
    }

    return true;
  }

  toJson() {
    return JSON.parse(this.toJsonString());
  }

  toJsonString(): string {
    const map: Record<Day, Hour[]> = Object.assign({}, this.map);
    for (const day in map) {
      if (map[day as Day].length === 0) {
        delete map[day as Day];
      }
    }

    return JSON.stringify(map);
  }

  static fromJson(json: any): BreakTime {
    const breakTime = new BreakTime();
    breakTime.fromJson(json);
    return breakTime;
  }

  fromJson(json: any) {
    if (!BreakTime.isValidMap(json)) {
      throw new Error('Invalid json');
    }

    this.map = Object.assign(this.createEmptyMap(), json);
  }

  static fromJsonString(json: string) {
    const map = JSON.parse(json);
    return BreakTime.fromJson(map);
  }

  fromJsonString(json: string) {
    const map = JSON.parse(json);
    this.fromJson(map);
  }
}
