export type RawSectionData = {
  section: string;
  hours: string;
  type: string;
  availability: string;
  days: string;
  time: string;
  location: string;
  professor: string;
};

export type RawSectionDataKeys = keyof RawSectionData;

export type CourseData = {
  department: string;
  courseNumber: string;
  description: string;
};

export type CourseSectionProfessor = {
  raw: string;
  firstName: string;
  lastName: string;
  middleName: string;
  preferredName: string;
};

export type Days =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type CourseSectionDaysRecord = Record<Days, boolean>;

export type CourseSectionAvailabilty = {
  filled: number;
  total: number;
};
