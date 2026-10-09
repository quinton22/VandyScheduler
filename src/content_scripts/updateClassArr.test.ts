/**
 * @jest-environment jsdom
 */
import fs from 'fs';
import path from 'path';
import { readAllCourseInformationFromCart } from './updateClassArr';
import { Schedule } from './lib/schedule.ts';

const cartHtml = fs.readFileSync(
  path.resolve(__dirname, '../html/examples/classCart.html'),
  'utf8',
);

// jsdom does not implement innerText; approximate it, ignoring script/style
function visibleText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? '';
  }
  const tag = (node as Element).tagName;
  if (tag === 'SCRIPT' || tag === 'STYLE') {
    return '';
  }
  if (tag === 'BR') {
    return '\n';
  }
  return Array.from(node.childNodes).map(visibleText).join('');
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'innerText', {
    configurable: true,
    get() {
      return visibleText(this);
    },
  });
});

describe('readAllCourseInformationFromCart', () => {
  it('should return undefined if there is no cart', () => {
    document.body.innerHTML = '<div></div>';
    expect(readAllCourseInformationFromCart()).toBeUndefined();
  });

  it('should throw if a course has no header', () => {
    document.body.innerHTML =
      '<div id="studentCart"><table class="classTable"></table></div>';
    expect(() => readAllCourseInformationFromCart()).toThrow('No header');
  });

  describe('with the real cart page', () => {
    beforeEach(() => {
      document.body.innerHTML = cartHtml;
    });

    it('should read every course in the cart', () => {
      const courses = readAllCourseInformationFromCart()!;
      expect(courses).toHaveLength(
        document.querySelectorAll('#studentCart table.classTable').length,
      );
      expect(courses[0].courseData).toMatchObject({
        department: 'MTED',
        courseNumber: '3360',
      });
      const total = document.querySelectorAll(
        '#studentCart tr.classRow',
      ).length;
      expect(courses.reduce((n, c) => n + c.sections.length, 0)).toBe(total);
    });

    it('should parse section details', () => {
      const s = readAllCourseInformationFromCart()![0].sections[0];
      expect(s.section).toBe('01');
      expect(s.hours).toBe(3);
      expect(s.type).toBe('Lecture');
      expect(s.days.daysList).toEqual(['thursday']);
      expect(s.time.start.hour).toBe(13);
      expect(s.availability).toEqual({ filled: 0, total: 10 });
    });

    it('should build schedules from the cart', () => {
      const courses = readAllCourseInformationFromCart()!;
      const schedule = new Schedule(courses);
      expect(schedule.overlappedClasses.size).toBeGreaterThan(0);
      expect(Array.isArray(schedule.getAllPossibleSchedules())).toBe(true);
    });
  });
});
