import html from 'bundle-text:./button.html';
import { HtmlParser } from '../htmlParser';

type CreateButtonParams = { text: string; onClick: () => void };

export const createButton = ({ text, onClick }: CreateButtonParams) => {
  const button = HtmlParser.parse(html);
  button.innerText = text;
  button.onclick = onClick;
  return button as HTMLButtonElement;
};
