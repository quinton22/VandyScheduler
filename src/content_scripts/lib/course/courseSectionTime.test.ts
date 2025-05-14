import { CourseSectionTime } from './courseSectionTime';
import { Time } from './time';

describe('CourseSectionTime', () => {
  let startTime1: Time;
  let endTime1: Time;
  let startTime2: Time;
  let endTime2: Time;

  beforeEach(() => {
    startTime1 = new Time(9, 0); // 9:00 AM
    endTime1 = new Time(10, 0); // 10:00 AM
    startTime2 = new Time(9, 30); // 9:30 AM
    endTime2 = new Time(10, 30); // 10:30 AM
  });

  it('should create a CourseSectionTime instance', () => {
    const courseSectionTime = new CourseSectionTime(startTime1, endTime1);
    expect(courseSectionTime).toBeInstanceOf(CourseSectionTime);
  });

  it('should return the correct start and end times', () => {
    const courseSectionTime = new CourseSectionTime(startTime1, endTime1);
    expect(courseSectionTime.start).toEqual(startTime1);
    expect(courseSectionTime.end).toEqual(endTime1);
  });

  it('should detect overlapping times', () => {
    const courseSectionTime1 = new CourseSectionTime(startTime1, endTime1);
    const courseSectionTime2 = new CourseSectionTime(startTime2, endTime2);
    expect(courseSectionTime1.overlapsWith(courseSectionTime2)).toBe(true);
    expect(courseSectionTime2.overlapsWith(courseSectionTime1)).toBe(true);

    const courseSectionTime3 = new CourseSectionTime(
      new Time(9, 30),
      new Time(9, 45)
    );
    const courseSectionTime4 = new CourseSectionTime(
      new Time(8, 30),
      new Time(10, 30)
    );

    expect(courseSectionTime1.overlapsWith(courseSectionTime3)).toBe(true);
    expect(courseSectionTime3.overlapsWith(courseSectionTime1)).toBe(true);

    expect(courseSectionTime1.overlapsWith(courseSectionTime4)).toBe(true);
    expect(courseSectionTime4.overlapsWith(courseSectionTime1)).toBe(true);
  });

  it('should detect non-overlapping times', () => {
    const nonOverlappingStartTime = new Time(11, 0); // 11:00 AM
    const nonOverlappingEndTime = new Time(12, 0); // 12:00 PM
    const courseSectionTime1 = new CourseSectionTime(startTime1, endTime1);
    const courseSectionTime2 = new CourseSectionTime(
      nonOverlappingStartTime,
      nonOverlappingEndTime
    );
    expect(courseSectionTime1.overlapsWith(courseSectionTime2)).toBe(false);
  });

  it('should handle edge case where one time ends exactly when another starts', () => {
    const edgeCaseStartTime = new Time(10, 0); // 10:00 AM
    const edgeCaseEndTime = new Time(11, 0); // 11:00 AM
    const courseSectionTime1 = new CourseSectionTime(startTime1, endTime1);
    const courseSectionTime2 = new CourseSectionTime(
      edgeCaseStartTime,
      edgeCaseEndTime
    );
    expect(courseSectionTime1.overlapsWith(courseSectionTime2)).toBe(false);
  });

  it('should correctly count the number of overlapping times', () => {
    const courseSectionTime1 = new CourseSectionTime(startTime1, endTime1);
    const courseSectionTime2 = new CourseSectionTime(startTime2, endTime2);
    const courseSectionTime3 = new CourseSectionTime(
      new Time(9, 30),
      new Time(9, 45)
    );
    const courseSectionTime4 = new CourseSectionTime(
      new Time(8, 30),
      new Time(10, 30)
    );
    const courseSectionTime5 = new CourseSectionTime(
      new Time(11, 0),
      new Time(12, 0)
    );

    const others = [
      courseSectionTime2,
      courseSectionTime3,
      courseSectionTime4,
      courseSectionTime5,
    ];

    expect(courseSectionTime1.getNumOverlaps(others)).toBe(3);
  });
});
