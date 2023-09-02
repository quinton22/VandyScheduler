import {
  DEFAULT_SCHOOL_ID,
  DEFAULT_SCHOOL_NAME,
  PROFESSOR_NAME_REGEX,
} from '../../constants';
import {
  School,
  SchoolQueryResponse,
  Teacher,
  TeacherQueryResponse,
  TeacherQueryVariables,
} from './graphql.types';
import {
  MessageRequest,
  OnMessageListener,
  IRateMyProfessor,
  ActionReturnType,
} from './types';

// TODO: fuzzy search
const getNameVariations = (profName: string) => {
  const matches = PROFESSOR_NAME_REGEX.exec(profName);

  if (!matches) {
    throw new Error(`Could not convert name: ${profName}`);
  }

  matches.shift();

  let alternate: string | undefined;
  if (matches.length === 3) {
    alternate = matches.pop()!;
  }

  return [
    matches.reverse().join(' '),
    alternate && matches.splice(0, 1, alternate) && matches.join(' '),
  ].filter(Boolean);
};

const getResult = async <T>(
  profName: string,
  query: (n?: string) => Promise<T[] | undefined>
): Promise<T[]> => {
  const nameVariations = getNameVariations(profName);

  const result = await Promise.all(nameVariations.map(query));

  return result.filter((r) => r && r.length > 0).reverse()[0] ?? [];
};

abstract class RateMyProfessorApi implements IRateMyProfessor {
  protected apiEndpoint = 'https://www.ratemyprofessors.com/';

  protected getUrl(
    path = '',
    searchParams: Array<[name: string, value: string]> = []
  ) {
    const url = new URL(path, this.apiEndpoint);
    for (const param of searchParams) {
      url.searchParams.append(...param);
    }
    return url;
  }

  abstract getProfId(
    profName: string,
    schoolName: string
  ): Promise<string | undefined>;
  abstract getOverallScore(profName: string): Promise<number | undefined>;
  abstract getOverallScore(
    profName: string,
    schoolId?: string
  ): Promise<number | undefined>;
  abstract getAllProfessors(schoolName?: string): Promise<Teacher[]>;
}

class RateMyProfessorGraphql extends RateMyProfessorApi {
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

  async getProfId(
    profName: string,
    schoolId = DEFAULT_SCHOOL_ID
  ): Promise<string | undefined> {
    const queryResult = await getResult(profName, (n) =>
      this.queryTeachers({
        teacherName: n,
        schoolId,
        number: 1,
      }).then(this.getTeachersFromQuery)
    );

    return queryResult[0]?.id;
  }

  async getOverallScore(
    profName: string,
    schoolId = DEFAULT_SCHOOL_ID
  ): Promise<number | undefined> {
    const queryResult = await getResult(profName, (n) =>
      this.queryTeachers({
        teacherName: n,
        schoolId,
        number: 1,
      }).then(this.getTeachersFromQuery)
    );

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

class RateMyProfessorHtmlParse extends RateMyProfessorApi {
  private readonly substitutions: Record<string, string> = {
    'Crooke, Philip S.': 'Crooke',
    'Davis, Victoria J.': 'Davis, Vicki',
    'Hardin, Douglas P.': 'Hardin, Doug',
    'Johnsen, Arthur': 'Johnsen, Art',
    'Leguizamon J S.': 'Leguizamon, Sebastian',
    'Link, Stanley': 'Link, Stan',
    'Rizzo, Carmelo J.': 'Rizzo, M',
    'Roth, Gerald H.': 'Roth, Jerry',
    'Savelyev, Petr A.': 'Savelyev, Peter',
    'Schmidt, Douglas C.': 'Schmidt, Doug',
    'Stahl, Sandra': 'Stahl, Sandy',
    'Tairas, Robert A.': 'Tairas, Rob',
    'Van Schaack, Andrew J.': 'Van Schaack, Andy',
    'White, Christopher J.': 'White, Jules',
  };
  private extractProfId(pageText: string) {
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
      throw 'error extracting the window.__RELAY_STORE__  variable when trying to find profId';
    }
  }

  async getProfId(profName: string): Promise<string | undefined> {
    const regex = /\w+(, )\w+/g;
    const temp = regex.exec(profName);
    if (temp) {
      profName = encodeURIComponent(
        temp[0].trim() in this.substitutions
          ? this.substitutions[temp[0].trim()]
          : temp[0]
      );
    }

    const pageText = await fetch(
      this.getUrl('search/professors/4002', [['q', profName]])
    ).then((res) => res.text());
    return this.extractProfId(pageText);
  }

  async getOverallScore(profName: string): Promise<number | undefined> {
    const id = this.getProfId(profName);
    const pageText = await fetch(this.getUrl(`professor/${id}`)).then((res) =>
      res.text()
    );

    const profRatingMatch = pageText.match(
      /class=["'][A-Za-z0-9\_\- ]*\bRatingValue__Numerator[A-Za-z0-9\_\- ]*\b["']>(.*?)<\//m
    );

    if (!profRatingMatch || !profRatingMatch[1]) {
      return undefined;
    }

    return parseFloat(profRatingMatch[1]);
  }

  getAllProfessors(): Promise<Teacher[]> {
    // throw new Error('Method not implemented.');
    return Promise.resolve([]);
  }
}

const rmpGraphql = new RateMyProfessorGraphql();
const rmpHtmlParse = new RateMyProfessorHtmlParse();

const excecuteAction = async <T extends keyof IRateMyProfessor>(
  { action, args }: MessageRequest<T>,
  mode: 'graphql' | 'htmlParse' = 'graphql',
  fallback = true
): Promise<ActionReturnType<T>> => {
  let rmp: RateMyProfessorApi = rmpGraphql,
    fallbackRmp: RateMyProfessorApi = rmpHtmlParse;

  if (mode !== 'graphql') {
    rmp = rmpHtmlParse;
    fallbackRmp = rmpGraphql;
  }

  if (action in rmp) {
    try {
      return (await rmp[action](
        ...(args as [any, any])
      )) as ActionReturnType<T>;
    } catch (e) {
      console.error(e);
    }
  }

  if (fallback && action in fallbackRmp) {
    try {
      return (await fallbackRmp[action](
        ...(args as [any, any])
      )) as ActionReturnType<T>;
    } catch (e) {
      console.error(e);
    }
  }

  throw new Error(`Method ${action.toString()} not found.`);
};

export const onMessageListener: OnMessageListener = (
  request: MessageRequest<any>,
  sender,
  sendResponse
) => {
  if (sender.id !== chrome.runtime.id) {
    console.error('Invalid sender at onMessageListener');
    return false;
  }

  if (!(request.action in rmpGraphql)) {
    return false;
  }

  excecuteAction(request as MessageRequest<keyof IRateMyProfessor>)
    .then(sendResponse)
    .catch((err) => {
      console.error(`[ERROR: ${request.action}]`, err);
      sendResponse(undefined);
    });

  return true;
};
