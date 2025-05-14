import templates, { TemplateIds } from '../../../html';

export type TemplateVariables = {
  [TemplateIds.course]: {
    courseText: string;
  };
  [TemplateIds.modal]: undefined;
  [TemplateIds.preferencesModal]: undefined;
  [TemplateIds.schedule]: {
    scheduleNumber: string;
  };
};

export class Templates {
  private constructor() {}

  private static _instance: Templates = new Templates();

  static get instance() {
    return this._instance;
  }

  private headsAdded = new Set<string>();

  getTemplate(
    id: TemplateIds,
    variables: TemplateVariables[TemplateIds]
  ): HTMLElement {
    const t = document.createElement('template');
    const templateStr = templates[id];
    t.innerHTML = variables
      ? this.findAndReplaceVariablesInString(templateStr, variables)
      : templateStr;

    const head = t.getElementsByTagName('head')[0];
    if (head && !this.headsAdded.has(id)) {
      document.head.append(...head.children);
      head.remove();
      this.headsAdded.add(id);
    }

    return t.content.cloneNode(true).firstChild as HTMLElement;
  }

  advancedTemplateEvaluation(
    templateString: string,
    variables: Record<string, unknown>
  ) {
    const regex = /\$\{([^}]+)\}/g;
    const matches = templateString.matchAll(regex);
    const variablesEvaluated = Object.entries(variables).reduce(
      (acc, [key, value]) => {
        acc += `let ${key} = JSON.parse(${JSON.stringify(value)}; `;
        return acc;
      },
      ''
    );
    let newTemplateString = templateString;
    for (const match of matches) {
      const result = eval(`${variablesEvaluated}${match[1]}`);

      newTemplateString = newTemplateString.replace(
        new RegExp(`\\$\\{${match[1]}\\}`, 'g'),
        JSON.stringify(result)
      );
    }
  }

  findAndReplaceVariablesInString(
    str: string,
    variables: Record<string, string>
  ) {
    let newStr = str;
    for (const [key, value] of Object.entries(variables)) {
      newStr = newStr.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
    }
    return newStr;
  }

  createHtmlFromString(str: string): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = str.trim();
    return template.content.cloneNode(true).firstChild as HTMLElement;
  }
}
