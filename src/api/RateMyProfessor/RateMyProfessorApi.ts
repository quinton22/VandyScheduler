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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withCache<Method extends (...args: any[]) => Promise<any>>(
  originalMethod: Method,
  _context: ClassMethodDecoratorContext
) {
  async function replacementMethod(
    this: RateMyProfessorApi,
    ...args: Parameters<Method>
  ) {
    const key = args.join('');

    if (key in this.cache) {
      console.log('found in cache', key, this.cache[key]);
      return this.cache[key];
    }
    const result = await originalMethod.call(this, ...args);

    console.log('not found in cache', key, result);

    this.cache[key] = result;
    return result;
  }

  return replacementMethod;
}

export abstract class RateMyProfessorApi implements IRateMyProfessor {
  protected cache: Record<string, Teacher[]> = {};

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
