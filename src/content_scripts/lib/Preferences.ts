import { BreakTime } from './BreakTime';

export class Preferences {
  private static KEY = 'VandyScheduler/v2/pref';
  private _breakTime?: BreakTime;
  private _noPreferenceMet: boolean = false;

  get breakTime() {
    return this._breakTime;
  }

  get noPreferenceMet() {
    return this._noPreferenceMet;
  }

  createBreakTime() {
    this._breakTime = new BreakTime();
  }

  async loadFromStorage() {
    const obj = await chrome.storage.sync.get(Preferences.KEY);
    if (!!obj && typeof obj === 'object' && Preferences.KEY in obj) {
      this.fromJsonString(obj[Preferences.KEY]);
    } else {
      await this.syncWithStorage();
    }

    if (!this._breakTime) {
      this._breakTime = new BreakTime();
    }
  }

  async syncWithStorage() {
    await chrome.storage.sync.set({
      [Preferences.KEY]: this.toJsonString(),
    });

    if (chrome.runtime.lastError) {
      console.error('Could not save preferences');
      window.alert('Preferences not saved. Check internet connection.');
    }
  }

  toJsonString() {
    return JSON.stringify({
      breakTime: this._breakTime?.toJson(),
      noPreferenceMet: this._noPreferenceMet,
    });
  }

  fromJsonString(str: string) {
    const { breakTime, noPreferenceMet } = JSON.parse(str);
    try {
      this._breakTime = BreakTime.fromJson(breakTime);
    } catch {}

    this._noPreferenceMet = !!noPreferenceMet;
  }
}

export const preferences = new Preferences();
