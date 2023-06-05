import { DEFAULT_SCHOOL_ID, DEFAULT_SCHOOL_NAME } from "../../constants";
import {
  School,
  SchoolQueryResponse,
  Teacher,
  TeacherQueryResponse,
  TeacherQueryVariables,
} from "./graphql.types";

interface IRateMyProfessor {
  getProfId(profName: string, schoolId?: string): Promise<string>;
  getOverallScore(profId: string): Promise<string>;
  getOverallScore(profName: string, schoolId?: string): Promise<string>;
  getAllProfessors(schoolName: string): Promise<Array<{}>>;
}

abstract class RateMyProfessorApi implements IRateMyProfessor {
  protected apiEndpoint = "https://www.ratemyprofessors.com/";

  protected getUrl(
    path = "",
    searchParams: Array<[name: string, value: string]> = []
  ) {
    const url = new URL(path, this.apiEndpoint);
    for (const param of searchParams) {
      url.searchParams.append(...param);
    }
    return url;
  }

  abstract getProfId(profName: string, schoolName: string);
  abstract getOverallScore(profId: string);
  abstract getOverallScore(profName: string, schoolName: string);
  abstract getAllProfessors(schoolName: string);
}

class RateMyProfessorGraphql extends RateMyProfessorApi {
  private readonly queries = {
    school: `query SchoolQuery {
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
    method: "POST",
    mode: "cors",
    headers: new Headers({
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: "Basic dGVzdDp0ZXN0",
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
      return await fetch(this.getUrl("graphql"), {
        ...this.requestOptions,
        body: JSON.stringify({
          query: this.queries.teachers,
          variables,
        }),
      }).then((res) => res.json());
    } catch (e) {
      console.log("Error querying teachers", e);
    }
  }

  private async querySchoolId(
    schoolName: string
  ): Promise<SchoolQueryResponse | undefined> {
    try {
      return await fetch(this.getUrl("graphql"), {
        ...this.requestOptions,
        body: JSON.stringify({
          query: this.queries.school,
          variables: {
            schoolName,
          },
        }),
      }).then((res) => res.json());
    } catch (e) {
      console.error("Error querying school", e);
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

  async getProfId(
    profName: string,
    schoolId = DEFAULT_SCHOOL_ID
  ): Promise<string | undefined> {
    const queryResult = await this.queryTeachers({
      teacherName: profName,
      schoolId,
      number: 1,
    });
    return this.getTeachersFromQuery(queryResult)[0]?.id;
  }

  async getOverallScore(profName: string, schoolId = DEFAULT_SCHOOL_ID) {
    const queryResult = await this.queryTeachers({
      teacherName: profName,
      schoolId,
      number: 1,
    });

    return this.getTeachersFromQuery(queryResult)[0]?.avgRatingRounded.toFixed(
      2
    );
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

class RateMyProfessorHtmlParse extends RateMyProfessorApi {
  private static extractProfId(pageText) {
    // in the version of rate my professor on 05/13/2023. when requesting using fetch, we can no longer find professorId in within a tag
    // instead it is stored within a JSON data under variable __RELAY_STORE__ in a <script> tag. So here we extract it from that variabl
    let scriptDataRegex = /window\.__RELAY_STORE__ = (.*?);/;
    let scriptDataMatch = pageText.match(scriptDataRegex);

    if (scriptDataMatch) {
      let jsonData = JSON.parse(scriptDataMatch[1]);

      // extract the legacyId from the JSON data
      for (let key in jsonData) {
        if (jsonData[key].legacyId) {
          return jsonData[key].legacyId;
        }
      }

      return null;
    } else {
      throw "error extracting the window.__RELAY_STORE__  variable when trying to find profId";
    }
  }

  async getProfId(profName) {
    const regex = /\w+(, )\w+/g;
    const temp = regex.exec(profName);
    if (temp[0].trim() in subs) {
      temp[0] = subs[temp[0].trim()];
    }
    profName = encodeURIComponent(temp[0]);

    const pageText = await fetch(
      this.getUrl("search/professors/4002", [["q", profName]])
    ).then((res) => res.text());
    return this.extractProfId(pageText);
  }

  async getOverallScore(profName, schoolName = DEFAULT_SCHOOL_NAME) {
    const id = this.getProfId(profName);
    const pageText = await fetch(this.getUrl(`professor/${id}`)).then((res) =>
      res.text()
    );

    const profRatingMatch = pageText.match(
      /class=["'][A-Za-z0-9\_\- ]*\bRatingValue__Numerator[A-Za-z0-9\_\- ]*\b["']>(.*?)<\//m
    );

    return profRatingMatch && profRatingMatch[1];
  }

  getAllProfessors(schoolName) {
    throw new Error("Method not implemented.");
  }
}

const RateMyProfessorApiInterface = new Proxy(RateMyProfessorApi, {
  get(target, methodName) {
    if (methodName in target) {
      return async (...args) => {
        try {
          return await RateMyProfessorGraphql[methodName](...args);
        } catch (e) {}

        try {
          return RateMyProfessorHtmlParse[methodName](...args);
        } catch (e) {}
      };
    } else {
      throw new Error(`Method ${methodName} not found`);
    }
  },
});

export const onMessageListener = (request, sender, sendResponse) => {
  if (sender !== chrome.runtime.id) {
    throw "Invalid sender";
  }

  RateMyProfessorApiInterface[request.action](...request.args)
    .then(sendResponse)
    .catch((err) => {
      console.error(`[ERROR: ${request.action}]`, err);
      sendResponse(err);
    });
};
