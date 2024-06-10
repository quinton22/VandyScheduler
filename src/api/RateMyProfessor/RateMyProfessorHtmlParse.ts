import { RateMyProfessorApi } from './RateMyProfessorApi';
import { Teacher } from './graphql.types';

export class RateMyProfessorHtmlParse extends RateMyProfessorApi {
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
    const scriptDataRegex = /window\.__RELAY_STORE__ = (.*?);/;
    const scriptDataMatch = pageText.match(scriptDataRegex);

    if (scriptDataMatch) {
      const jsonData = JSON.parse(scriptDataMatch[1]);

      // extract the legacyId from the JSON data
      for (const key in jsonData) {
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
      /class=["'][A-Za-z0-9_\- ]*\bRatingValue__Numerator[A-Za-z0-9_\- ]*\b["']>(.*?)<\//m
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
