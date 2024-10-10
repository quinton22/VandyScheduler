import { DEFAULT_SCHOOL_ID, DEFAULT_SCHOOL_NAME } from '../../constants';
import { RateMyProfessorApi, getResult, withCache } from './RateMyProfessorApi';
import { stringSimilarity } from 'string-similarity-js';
import {
  TeacherQueryVariables,
  TeacherQueryResponse,
  SchoolQueryResponse,
  School,
  Teacher,
} from './graphql.types';

export class RateMyProfessorGraphql extends RateMyProfessorApi {
  private readonly queries = {
    school: `query SchoolQuery($schoolName: String) {
  newSearch {
    schools(query: {
      text: $schoolName
    }) {
      edges {
        node {
          name
          id
        }
      }
    }
  }
}`,
    teachers: `query TeacherSearchQuery(
  $schoolId: ID!,
  $teacherName: String
  $number: Int
) {
  newSearch {
    teachers(first: $number, query: { 
      schoolID: $schoolId,
      text: $teacherName
    }) {
      edges {
        node {
          avgDifficultyRounded
          avgRatingRounded
          id
          legacyId
          firstName
          lastName
          numRatings
          teacherRatingTags {
            tagName
          }
          wouldTakeAgainPercentRounded
          wouldTakeAgainCount
        }
      }
      didFallback
      resultCount
    }
  }
}`,
  };
  private readonly requestOptions: RequestInit = {
    method: 'POST',
    mode: 'cors',
    headers: new Headers({
      'Content-Type': 'application/json',
      accept: 'application/json',
      Authorization: 'Basic dGVzdDp0ZXN0',
    }),
  };

  private async queryTeachers(
    {
      schoolId = DEFAULT_SCHOOL_ID,
      number,
      teacherName,
    }: TeacherQueryVariables = {
      schoolId: DEFAULT_SCHOOL_ID,
    }
  ): Promise<TeacherQueryResponse | undefined> {
    const variables = {
      schoolId,
      ...(number && { number }),
      ...(teacherName && { teacherName }),
    };

    try {
      return await fetch(this.getUrl('graphql'), {
        ...this.requestOptions,
        body: JSON.stringify({
          query: this.queries.teachers,
          variables,
        }),
      }).then((res) => res.json());
    } catch (e) {
      console.log('Error querying teachers', e);
    }
  }

  private async querySchoolId(
    schoolName: string
  ): Promise<SchoolQueryResponse | undefined> {
    try {
      return await fetch(this.getUrl('graphql'), {
        ...this.requestOptions,
        body: JSON.stringify({
          query: this.queries.school,
          variables: {
            schoolName,
          },
        }),
      }).then((res) => res.json());
    } catch (e) {
      console.error('Error querying school', e);
    }
  }

  private parseSchoolQueryResponse(
    response?: SchoolQueryResponse
  ): Array<School> {
    return response
      ? response.data.newSearch.schools.edges.map(({ node: { id, name } }) => ({
          id,
          name,
        }))
      : [];
  }

  private getNumTeachersFromQuery(response?: TeacherQueryResponse): number {
    return response ? response.data.newSearch.teachers.resultCount : 0;
  }

  private getTeachersFromQuery(
    response?: TeacherQueryResponse
  ): Array<Teacher> {
    return response
      ? response.data.newSearch.teachers.edges.map(({ node }) => node)
      : [];
  }

  private async getSchoolId(
    schoolName = DEFAULT_SCHOOL_NAME
  ): Promise<string | undefined> {
    const res = await this.querySchoolId(schoolName);
    return this.parseSchoolQueryResponse(res)[0]?.id;
  }

  @withCache
  private async getTeachers(
    profName: string,
    schoolId = DEFAULT_SCHOOL_ID
  ): Promise<Teacher[]> {
    const result = await getResult(profName, (n) =>
      this.queryTeachers({
        teacherName: n,
        schoolId,
        number: 3,
      }).then(this.getTeachersFromQuery)
    );

    return result
      .map((t) => ({
        similarity: stringSimilarity(profName, `${t.lastName}, ${t.firstName}`),
        teacher: t,
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .map(({ teacher }) => teacher);
  }

  async getProfId(
    ...args: Parameters<typeof this.getTeachers>
  ): Promise<string | undefined> {
    const queryResult = await this.getTeachers(...args);
    // TODO: if more than one result, we should allow the user to see different options
    return queryResult[0]?.legacyId;
  }

  async getOverallScore(
    ...args: Parameters<typeof this.getTeachers>
  ): Promise<number | undefined> {
    const queryResult = await this.getTeachers(...args);

    return queryResult[0]?.avgRatingRounded;
  }

  async getAllProfessors(schoolName = DEFAULT_SCHOOL_NAME) {
    const schoolId = await this.getSchoolId(schoolName);

    if (!schoolId) return [];

    let queryResult = await this.queryTeachers({ number: 0, schoolId });
    const numTeachers = this.getNumTeachersFromQuery(queryResult);
    queryResult = await this.queryTeachers({ number: numTeachers, schoolId });
    return this.getTeachersFromQuery(queryResult);
  }
}
