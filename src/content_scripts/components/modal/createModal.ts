import html from 'bundle-text:./modal.html';
import { HtmlParser } from '../htmlParser';
import { closePrefModal, createPreferencesModal } from '../preferencesModal';

const closeModal = () => {
  const modal = document.getElementById('scheduleView');
  if (!modal) return;

  modal.style.display = 'none';
  modal.getElementsByClassName('modal-body')[0].innerHTML = '';
};

export const createModal = async () => {
  const modal = HtmlParser.parse(html);
  document.body.append(modal);

  let prefModal = await createPreferencesModal();

  // exit if clicked not on modal
  window.onclick = (event) => {
    if (event.target === modal) {
      closeModal();
    } else if (event.target === prefModal) {
      closePrefModal();
    }
  };

  return modal;
};
