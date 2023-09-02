import { onMessageListener } from '../api/RateMyProfessor';

chrome.runtime.onMessage.addListener(onMessageListener);
