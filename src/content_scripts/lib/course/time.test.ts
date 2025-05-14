import { Time, TimeStringType } from './time';

describe('Time', () => {
  describe('constructor', () => {
    it('should create a valid Time object', () => {
      const time = new Time(10, 30);
      expect(time.hour).toBe(10);
      expect(time.minute).toBe(30);
    });

    it('should throw an error for invalid hour', () => {
      expect(() => new Time(24, 30)).toThrow(
        'Number not in inclusive range 0,23: 24'
      );
    });

    it('should throw an error for invalid minute', () => {
      expect(() => new Time(10, 60)).toThrow(
        'Number not in inclusive range 0,59: 60'
      );
    });
  });

  describe('getStringType', () => {
    it('should return h12 for 12-hour format', () => {
      expect(Time.getStringType('10:30a')).toBe(TimeStringType.h12);
    });

    it('should return h24 for 24-hour format', () => {
      expect(Time.getStringType('1030')).toBe(TimeStringType.h24);
    });

    it('should return unknown for invalid format', () => {
      expect(Time.getStringType('invalid')).toBe(TimeStringType.unknown);
    });
  });

  describe('fromString', () => {
    it('should create a Time object from 12-hour format string', () => {
      const time = Time.fromString('10:30a');
      expect(time.hour).toBe(10);
      expect(time.minute).toBe(30);
    });

    it('should create a Time object from 24-hour format string', () => {
      const time = Time.fromString('1030');
      expect(time.hour).toBe(10);
      expect(time.minute).toBe(30);
    });

    it('should throw an error for invalid format', () => {
      expect(() => Time.fromString('invalid')).toThrow(
        'Invalid time string syntax. Format should be either hh:mma or hhmm'
      );
    });
  });

  describe('from12HrString', () => {
    it('should create a Time object from 12-hour format string', () => {
      const time = Time.from12HrString('10:30a');
      expect(time.hour).toBe(10);
      expect(time.minute).toBe(30);
    });

    it('should handle PM correctly', () => {
      const time = Time.from12HrString('10:30p');
      expect(time.hour).toBe(22);
      expect(time.minute).toBe(30);
    });

    it('should handle 12 AM correctly', () => {
      const time = Time.from12HrString('12:00a');
      expect(time.hour).toBe(0);
      expect(time.minute).toBe(0);
    });

    it('should handle 12 PM correctly', () => {
      const time = Time.from12HrString('12:00p');
      expect(time.hour).toBe(12);
      expect(time.minute).toBe(0);
    });

    it('should throw an error for invalid format', () => {
      expect(() => Time.from12HrString('invalid')).toThrow(
        'Invalid time string syntax. Format should be hh:mma'
      );
    });
  });

  describe('from24HrString', () => {
    it('should create a Time object from 24-hour format string', () => {
      const time = Time.from24HrString('1030');
      expect(time.hour).toBe(10);
      expect(time.minute).toBe(30);
    });

    it('should throw an error for invalid format', () => {
      expect(() => Time.from24HrString('invalid')).toThrow(
        'Invalid time string syntax. Format should be hhmm'
      );
    });
  });

  describe('timeString', () => {
    it('should return time in 24-hour format', () => {
      const time = new Time(10, 30);
      expect(time.timeString(true)).toBe('1030');
    });

    it('should return time in 12-hour format', () => {
      const time = new Time(10, 30);
      expect(time.timeString()).toBe('10:30a');
    });

    it('should handle PM correctly in 12-hour format', () => {
      const time = new Time(22, 30);
      expect(time.timeString()).toBe('10:30p');
    });

    it('should handle midnight correctly in 12-hour format', () => {
      const time = new Time(0, 0);
      expect(time.timeString()).toBe('12:00a');
    });

    it('should handle noon correctly in 12-hour format', () => {
      const time = new Time(12, 0);
      expect(time.timeString()).toBe('12:00p');
    });
  });

  describe('difference', () => {
    it('should return the difference in hours between two times', () => {
      const time1 = new Time(10, 30);
      const time2 = new Time(12, 30);
      expect(Time.difference(time1, time2)).toBe(-2);
    });

    it('should return the difference in fractional hours between two times', () => {
      const time1 = new Time(10, 30);
      const time2 = new Time(12, 45);
      expect(Time.difference(time1, time2)).toBe(-2.25);
    });

    it('should return a positive difference if the first time is later', () => {
      const time1 = new Time(14, 30);
      const time2 = new Time(12, 30);
      expect(Time.difference(time1, time2)).toBe(2);
    });

    it('should return zero if the times are equal', () => {
      const time1 = new Time(10, 30);
      const time2 = new Time(10, 30);
      expect(Time.difference(time1, time2)).toBe(0);
    });
  });

  describe('isBefore', () => {
    it('should return true if the time is before the other time', () => {
      const time1 = new Time(10, 30);
      const time2 = new Time(11, 30);
      expect(time1.isBefore(time2)).toBe(true);
    });

    it('should return false if the time is not before the other time', () => {
      const time1 = new Time(12, 30);
      const time2 = new Time(11, 30);
      expect(time1.isBefore(time2)).toBe(false);
    });
  });

  describe('isAfter', () => {
    it('should return true if the time is after the other time', () => {
      const time1 = new Time(12, 30);
      const time2 = new Time(11, 30);
      expect(time1.isAfter(time2)).toBe(true);
    });

    it('should return false if the time is not after the other time', () => {
      const time1 = new Time(10, 30);
      const time2 = new Time(11, 30);
      expect(time1.isAfter(time2)).toBe(false);
    });
  });

  describe('isEqual', () => {
    it('should return true if the times are equal', () => {
      const time1 = new Time(10, 30);
      const time2 = new Time(10, 30);
      expect(time1.isEqual(time2)).toBe(true);
    });

    it('should return false if the times are not equal', () => {
      const time1 = new Time(10, 30);
      const time2 = new Time(11, 30);
      expect(time1.isEqual(time2)).toBe(false);
    });
  });

  describe('copy', () => {
    it('should create a copy of the Time object', () => {
      const time1 = new Time(10, 30);
      const time2 = time1.copy();
      expect(time1.isEqual(time2)).toBe(true);
      expect(time1).not.toBe(time2); // Ensure it's a different object
    });
  });
});
