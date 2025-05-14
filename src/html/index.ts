import modalHtml from 'bundle-text:./modal.html';
import courseHtml from 'bundle-text:./scheduleCourse.html';
import scheduleHtml from 'bundle-text:./schedule.html';
import preferencesModalHtml from 'bundle-text:./preferencesModal.html';

export enum TemplateIds {
  modal = 'modal',
  course = 'course',
  schedule = 'schedule',
  preferencesModal = 'preferencesModal',
}

export default {
  [TemplateIds.modal]: modalHtml,
  [TemplateIds.course]: courseHtml,
  [TemplateIds.schedule]: scheduleHtml,
  [TemplateIds.preferencesModal]: preferencesModalHtml,
};
