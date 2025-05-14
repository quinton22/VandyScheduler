import { Days } from './course';

export type StoredPreferences = {
  breakTime?: BreakTimesMap;
  noPrefMet?: boolean;
  retainCoursesInCart?: boolean;
};

export type BreakTimes =
  | '0700'
  | '0800'
  | '0900'
  | '1000'
  | '1100'
  | '1200'
  | '1300'
  | '1400'
  | '1500'
  | '1600'
  | '1700'
  | '1800';

export const ALL_BREAK_TIMES: BreakTimes[] = [
  '0700',
  '0800',
  '0900',
  '1000',
  '1100',
  '1200',
  '1300',
  '1400',
  '1500',
  '1600',
  '1700',
  '1800',
];

export type BreakTimesMap = {
  [D in Days]?: {
    [T in BreakTimes]?: boolean;
  };
};

const DEFAULT_PREFERENCES: StoredPreferences = Object.freeze({
  breakTime: {
    monday: {
      '1200': true,
    },
    tuesday: {
      '1200': true,
    },
    wednesday: {
      '1200': true,
    },
    thursday: {
      '1200': true,
    },
    friday: {
      '1200': true,
    },
    saturday: {
      '0700': true,
      '0800': true,
      '0900': true,
      '1000': true,
      '1100': true,
      '1200': true,
      '1300': true,
      '1400': true,
      '1500': true,
      '1600': true,
      '1700': true,
      '1800': true,
    },
    sunday: {
      '0700': true,
      '0800': true,
      '0900': true,
      '1000': true,
      '1100': true,
      '1200': true,
      '1300': true,
      '1400': true,
      '1500': true,
      '1600': true,
      '1700': true,
      '1800': true,
    },
  },
  noPrefMet: false,
  retainCoursesInCart: false,
});

export class Preferences {
  private _preferences: StoredPreferences = Object.assign(
    {},
    DEFAULT_PREFERENCES
  );

  private static _instance: Preferences = new Preferences();

  static get instance(): Preferences {
    return this._instance;
  }

  private constructor() {}

  reset(): void {
    this._preferences = Object.assign({}, DEFAULT_PREFERENCES);
    this.saveToStorage();
  }

  async loadFromStorage(): Promise<void> {
    const { pref: oldPreferences } = await chrome.storage.sync.get('pref');

    if (oldPreferences && Object.keys(oldPreferences).length > 0) {
      this._preferences = oldPreferences;
      await this.saveToStorage();
      await chrome.storage.sync.remove('pref');
      return;
    }

    const { preferences: p } = await chrome.storage.sync.get('preferences');
    if (p) {
      this._preferences = p;
    }
  }

  get preferences(): StoredPreferences {
    return Object.assign({}, this._preferences);
  }

  set preferences(value: StoredPreferences) {
    this._preferences = Object.assign({}, value);
    this.saveToStorage();
  }

  getPreference<K extends keyof StoredPreferences>(
    key: K
  ): StoredPreferences[K] {
    return this._preferences[key];
  }

  setPreference<K extends keyof StoredPreferences>(
    key: K,
    value: StoredPreferences[K]
  ): void {
    this._preferences[key] = value;
    this.saveToStorage();
  }

  hasPreference(key: keyof StoredPreferences): boolean {
    return key in this._preferences;
  }

  removePreference(key: keyof StoredPreferences): void {
    delete this._preferences[key];
    this.saveToStorage();
  }

  private async saveToStorage(): Promise<void> {
    await chrome.storage.sync.set({ preferences: this._preferences });
  }

  updateBreakTimes(breakTimes: Partial<BreakTimesMap>): void {
    let { breakTime: storedBreakTime } = this._preferences;
    storedBreakTime ??= {};

    for (const key in breakTimes) {
      const day = breakTimes[key as Days];
      if (day === undefined) {
        delete breakTimes[key as Days];
      } else {
        for (const time in breakTimes[key as Days]) {
          if (day[time as BreakTimes] === undefined) {
            delete breakTimes[key as Days]?.[time as BreakTimes];
          }
        }
      }
    }

    storedBreakTime = {
      ...storedBreakTime,
      ...breakTimes,
    };
    this.setPreference('breakTime', storedBreakTime);
  }

  setBreakTime(day: Days, time: BreakTimes, value: boolean): void {
    let { breakTime } = this._preferences;
    breakTime ??= {};
    breakTime[day] ??= {};

    breakTime[day][time] = value;

    this.setPreference('breakTime', breakTime);
  }

  setAllBreakTimes(day: Days, value: boolean): void {
    let { breakTime } = this._preferences;
    breakTime ??= {};
    breakTime[day] ??= {};

    for (const time of ALL_BREAK_TIMES) {
      breakTime[day][time] = value;
    }

    this.setPreference('breakTime', breakTime);
  }

  toggleBreakTime(day: Days, time: BreakTimes): void {
    this.setBreakTime(day, time, !this.getBreakTime(day, time));
  }

  getBreakTime(day: Days, time: BreakTimes): boolean {
    return !!this._preferences.breakTime?.[day]?.[time];
  }

  toggleNoPrefMet(): void {
    this.setPreference('noPrefMet', !this._preferences.noPrefMet);
  }
}
