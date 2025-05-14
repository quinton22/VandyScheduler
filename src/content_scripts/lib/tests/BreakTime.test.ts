import { BreakTime, Hour, isWeekend } from '../BreakTime';

const generateRandomHour = () =>
  BreakTime.AVAILABLE_HOURS[
    Math.min(
      Math.floor(BreakTime.AVAILABLE_HOURS.length * Math.random()),
      BreakTime.AVAILABLE_HOURS.length - 1
    )
  ];

describe('BreakTime', () => {
  let breakTime: BreakTime;

  const expectDefault = () => {
    for (const day of BreakTime.AVAILABLE_DAYS) {
      if (isWeekend(day)) {
        expect(breakTime.get(day)).toEqual(BreakTime.AVAILABLE_HOURS);
      } else {
        expect(breakTime.get(day)).toEqual([12]);
      }
    }
  };

  beforeEach(() => {
    breakTime = new BreakTime();
  });

  it('should select and unselect properly', () => {
    let hour: Hour;
    let action: 'select' | 'unselect';
    let hours1 = [],
      hours2 = [];
    let iterations = 1_000;
    while (iterations-- > 0) {
      hour = generateRandomHour();
      action = Math.random() > 0.5 ? 'select' : 'unselect';

      hours1 = breakTime.get('Monday');
      breakTime[action]('Monday', hour);
      hours2 = breakTime.get('Monday');

      if (
        (hours1.includes(hour) && action === 'select') ||
        (!hours1.includes(hour) && action === 'unselect')
      ) {
        expect(hours1.length).toEqual(hours2.length);
      } else {
        let comparator =
          action === 'select'
            ? ('toBeLessThan' as const)
            : ('toBeGreaterThan' as const);

        expect(hours1.length)[comparator](hours2.length);
      }

      expect(breakTime.get('Monday')).toEqual(
        breakTime.get('Monday').sort((a, b) => a - b)
      );
    }
  });

  it('should select all', () => {
    expectDefault();

    breakTime.selectAll('Monday');
    expect(breakTime.get('Monday')).toEqual(BreakTime.AVAILABLE_HOURS);
    breakTime.selectAll();
    for (const day of BreakTime.AVAILABLE_DAYS) {
      expect(breakTime.get(day)).toEqual(BreakTime.AVAILABLE_HOURS);
    }
  });

  it('should unselect all', () => {
    breakTime.selectAll();
    for (const day of BreakTime.AVAILABLE_DAYS) {
      expect(breakTime.get(day)).toEqual(BreakTime.AVAILABLE_HOURS);
    }
    breakTime.unselectAll('Monday');
    expect(breakTime.get('Monday')).toEqual([]);
    breakTime.unselectAll();
    for (const day of BreakTime.AVAILABLE_DAYS) {
      expect(breakTime.get(day)).toEqual([]);
    }
  });

  it('should stringify to json correctly', () => {});

  it('should parse from json correctly', () => {});
});
