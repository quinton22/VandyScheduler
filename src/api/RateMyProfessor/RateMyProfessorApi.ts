import { PROFESSOR_NAME_REGEX } from '../../constants';
import { Teacher } from './graphql.types';
import { IRateMyProfessor } from './types';

// TODO: fuzzy search
export const getNameVariations = (profName: string) => {
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

export const getResult = async <T>(
  profName: string,
  query: (n?: string) => Promise<T[] | undefined>
): Promise<T[]> => {
  const nameVariations = getNameVariations(profName);

  const result = await Promise.all(nameVariations.map(query));

  return result.filter((r) => r && r.length > 0).reverse()[0] ?? [];
};

export abstract class RateMyProfessorApi implements IRateMyProfessor {
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
