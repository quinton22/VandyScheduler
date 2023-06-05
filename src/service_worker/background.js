import {
  onMessageListener,
  rateMyProfessorApi,
  rateMyProfessorCache,
} from "../api/RateMyProfessor";

chrome.runtime.onMessage.addListener(onMessageListener);
