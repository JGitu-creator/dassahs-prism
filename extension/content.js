// Injected only after the user presses "Refract Noise" in the popup.
// No automatic page scan, word count, or alert runs on page load.
const isCanvasPage = () => /instructure\.com$/i.test(window.location.hostname) || Boolean(document.querySelector('#wiki_page_show, .show-content.user_content, #assignment_show'));
const extractReadableContent = () => {
  if (isCanvasPage()) {
    const titleEl = document.querySelector('.page-title, #wiki_page_show h1, #assignment_show h1, h1.title') || document.querySelector('h1');
    const bodyEl = document.querySelector('.show-content.user_content') || document.querySelector('#wiki_page_show') || document.querySelector('#assignment_show .description') || document.querySelector('#content');
    return { source: 'canvas', title: (titleEl?.innerText || document.title || 'Canvas Reading').trim(), text: (bodyEl?.innerText || document.body.innerText || '').trim().slice(0, 25000), url: window.location.href };
  }
  return { source: 'web', title: document.title || 'Web Reading', text: (document.body.innerText || '').trim().slice(0, 8000), url: window.location.href };
};
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => { sendResponse(request.action === 'extractText' ? extractReadableContent() : {}); return false; });
