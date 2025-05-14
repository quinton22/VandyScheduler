import { HtmlParser } from '../htmlParser';

describe('htmlParser', () => {
  it('should parse html and return first child', () => {
    expect(HtmlParser.parse('<div id="x"></div>')).toEqual(
      expect.any(HTMLElement)
    );
    expect(HtmlParser.parse('<div id="x"></div>')).toMatchInlineSnapshot(`
<div
  id="x"
/>
`);
    expect(HtmlParser.parse('<body><div id="x"></div></body>'))
      .toMatchInlineSnapshot(`
<div
  id="x"
/>
`);
    expect(HtmlParser.parse('<div id="x"></div><div id="y"></div>'))
      .toMatchInlineSnapshot(`
<div
  id="x"
/>
`);
  });

  it('should parse html and return elements wrapped in body tag', () => {
    expect(HtmlParser.parse('<div id="x"></div>')).toEqual(expect.any(Element));
    expect(HtmlParser.parse('<div id="x"></div>', true)).toMatchInlineSnapshot(`
<body>
  <div
    id="x"
  />
</body>
`);
    expect(HtmlParser.parse('<body><div id="x"></div></body>', true))
      .toMatchInlineSnapshot(`
<body>
  <div
    id="x"
  />
</body>
`);
    expect(HtmlParser.parse('<div id="x"></div><div id="y"></div>', true))
      .toMatchInlineSnapshot(`
<body>
  <div
    id="x"
  />
  <div
    id="y"
  />
</body>
`);
  });

  it('should stringify html', () => {
    expect(HtmlParser.stringify(HtmlParser.parse('<div />'))).toEqual(
      '<div></div>'
    );

    expect(HtmlParser.stringify(HtmlParser.parse('<div />', true))).toEqual(
      '<body><div></div></body>'
    );
  });
});
