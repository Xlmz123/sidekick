// Sidekick: opens the side panel and adds the right-click menu.

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: 'sk-explain', title: 'Explain “%s” with Sidekick', contexts: ['selection'] });
    chrome.contextMenus.create({ id: 'sk-summary', title: 'Summarize this page with Sidekick', contexts: ['page'] });
  });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  // open first: Brave only allows it straight after the click
  if (tab && tab.windowId !== undefined) chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => {});
  let prompt = null;
  if (info.menuItemId === 'sk-explain' && info.selectionText) {
    prompt = 'Explain this simply, using the page for context: "' + info.selectionText.slice(0, 2000) + '"';
  } else if (info.menuItemId === 'sk-summary') {
    prompt = 'Summarize this page.';
  }
  if (prompt) chrome.storage.session.set({ pending: { prompt, ts: Date.now() } });
});
