export type SchoolQueryVariables = {
  schoolName: string;
};

export type School = {
  id: string;
  name: string;
};

export type SchoolQueryResponse = {
  data: {
    newSearch: {
      schools: {
        edges: Array<{
          node: School;
        }>;
      };
    };
  };
};

export type TeacherQueryVariables = {
  schoolId: string;
  number?: number;
  teacherName?: string;
};

export type Teacher = {
  avgDifficultyRounded: number;
  avgRatingRounded: number;
  id: string;
  firstName: string;
  lastName: string;
  numRatings: number;
  teacherRatingTags: {
    tagName: string;
  };
  wouldTakeAgainPercentRounded: number;
  wouldTakeAgainCount: number;
};

export type TeacherQueryResponse = {
  data: {
    newSearch: {
      teachers: {
        edges: Array<{
          node: Teacher;
        }>;
        resultCount: number;
      };
    };
  };
};
