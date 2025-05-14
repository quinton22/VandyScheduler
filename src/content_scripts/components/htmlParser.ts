const parser = new DOMParser();
export const HtmlParser = {
  /**
   *
   * @param str string to parse to html
   * @param withBody whether to wrap with a body tag, otherwise will return the first child
   * @returns `str` parsed as html, either wrapped in a `<body>` tag or the first child depending on `withBody`
   */
  parse: (str: string, withBody = false): HTMLElement => {
    const body = parser.parseFromString(str, 'text/html').body;
    return withBody ? body : (body.children[0] as HTMLElement);
  },
  stringify: (html: Element) => html.outerHTML,
};
