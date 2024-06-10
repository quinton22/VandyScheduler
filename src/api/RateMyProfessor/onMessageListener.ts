import { RateMyProfessorApi } from './RateMyProfessorApi';
import { RateMyProfessorGraphql } from './RateMyProfessorGraphql';
import { RateMyProfessorHtmlParse } from './RateMyProfessorHtmlParse';
import {
  ActionReturnType,
  IRateMyProfessor,
  MessageRequest,
  OnMessageListener,
} from './types';

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
      return (await (rmp[action] as IRateMyProfessor[T])(
        ...((args ?? []) as [string, string | undefined])
      )) as ActionReturnType<T>;
    } catch (e) {
      console.error(e);
    }
  }

  if (fallback && action in fallbackRmp) {
    try {
      return (await (fallbackRmp[action] as IRateMyProfessor[T])(
        ...((args ?? []) as [string, string | undefined])
      )) as ActionReturnType<T>;
    } catch (e) {
      console.error(e);
    }
  }

  throw new Error(`Method ${action.toString()} not found.`);
};

export const onMessageListener: OnMessageListener = (
  request: MessageRequest<keyof IRateMyProfessor>,
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
