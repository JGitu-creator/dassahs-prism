// Dassah's Prism Engine: Smart Bridge — background service worker (v2.0.0)
// Smartly routes captured pages & highlighted text to Focus (/), Play (/canvas), Forge (/forge), or Word (/scripture)
// using private sessionStorage handoff (zero URL param leaks).

const PRISM_APP_URL = "https://dassahs-prism.vercel.app";
const MAX_DOCUMENT_CHARS = 25000;

const ROUTE_CONFIG = {
  focus: {
    path: "/",
    storageKey: "prism_pending_document",
    eventName: "prism:pending-document",
  },
  play: {
    path: "/canvas",
    storageKey: "prism_canvas_handoff",
    eventName: "prism:canvas-handoff",
  },
  forge: {
    path: "/forge",
    storageKey: "prism_forge_handoff",
    eventName: "prism:forge-handoff",
  },
  word: {
    path: "/scripture",
    storageKey: "prism_word_handoff",
    eventName: "prism:word-handoff",
  },
};

const BIBLE_REF_REGEX =
  /\b(?:(?:1|2|3|I|II|III)\s*)?(?:Genesis|Gen|Exodus|Exod|Leviticus|Lev|Numbers|Num|Deuteronomy|Deut|Joshua|Josh|Judges|Ruth|Samuel|Sam|Kings|Kgs|Chronicles|Chr|Ezra|Nehemiah|Neh|Esther|Job|Psalms?|Ps|Proverbs|Prov|Ecclesiastes|Eccl|Isaiah|Isa|Jeremiah|Jer|Lamentations|Ezekiel|Ezek|Daniel|Dan|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Matt|Mark|Luke|John|Acts|Romans|Rom|Corinthians|Cor|Galatians|Gal|Ephesians|Eph|Philippians|Phil|Colossians|Col|Thessalonians|Thess|Timothy|Tim|Titus|Philemon|Hebrews|Heb|James|Jas|Peter|Pet|Jude|Revelation|Rev)\.?\s+\d{1,3}(?::\d{1,3}(?:-\d{1,3})?)?/i;

function detectSmartTargetFromText(text, url = "") {
  const sample = String(text || "");
  const host = String(url || "").toLowerCase();

  // 1. Biblical references or Bible sites -> Prism Word
  if (
    /biblegateway\.com|bible\.com|blueletterbible\.org|biblehub\.com|esv\.org|gotquestions\.org/i.test(host) ||
    (sample.length < 400 && BIBLE_REF_REGEX.test(sample))
  ) {
    const match = sample.match(BIBLE_REF_REGEX);
    return { target: "word", reference: match ? match[0].trim() : "" };
  }

  // 2. Classrooms & Courses -> Prism Play
  if (
    /instructure\.com|classroom\.google\.com|blackboard\.com|moodle|coursera\.org|edx\.org|khanacademy\.org|schoology\.com|brightspace/i.test(host)
  ) {
    return { target: "play" };
  }

  // 3. Excel / Sheets / Code / Errors / Terminal -> Prism Forge
  if (
    /docs\.google\.com\/spreadsheets|excel\.office\.com|onedrive\.live\.com.*excel|github\.com|gitlab\.com|stackoverflow\.com|codepen\.io|replit\.com|vscode\.dev|developer\.mozilla\.org|kaggle\.com/i.test(host) ||
    /^=\s*[A-Z]{2,}\(|VLOOKUP|XLOOKUP|SUMIFS|#REF!|#N\/A|#VALUE!|TypeError:|ReferenceError:|SyntaxError:|Traceback \(most recent call last\)|RuntimeError:|^\s*(?:docker|git|npm|npx|kubectl|curl|grep)\s+/im.test(sample)
  ) {
    let forgeMode = "stack_trace";
    if (/^\s*(?:docker|git|npm|npx|kubectl|curl|grep|ssh|chmod|rm)\s+/im.test(sample)) {
      forgeMode = "terminal_cli";
    } else if (/function\s+\w+|const\s+\w+\s*=|def\s+\w+\(|for\s*\(|SELECT\s+.+FROM/i.test(sample) && !/Error:|Exception|Traceback|#REF!|#VALUE!/i.test(sample)) {
      forgeMode = "code_lego";
    }
    return { target: "forge", forgeMode };
  }

  // 4. Default: Dense articles, PDFs, emails, docs -> Prism Focus
  return { target: "focus" };
}

function writePendingDocument(storageKey, documentContent, eventName) {
  try {
    sessionStorage.setItem(storageKey, documentContent);
    window.dispatchEvent(new CustomEvent(eventName, { detail: { length: documentContent.length } }));
  } catch (e) {
    console.warn("Dassah's Prism: sessionStorage handoff failed", e);
  }
}

function openPrismWithDocument(documentContent, options = {}) {
  const autoDetected = detectSmartTargetFromText(documentContent, options.url);
  const rawTarget = options.target || (options.source === "canvas" ? "play" : autoDetected.target);
  const target = ROUTE_CONFIG[rawTarget] ? rawTarget : "focus";
  const cfg = ROUTE_CONFIG[target];

  let content;
  if (target === "play") {
    content = JSON.stringify({
      title: String(options.title || "Class Reading"),
      text: String(documentContent || "").slice(0, MAX_DOCUMENT_CHARS),
      url: String(options.url || ""),
    });
  } else if (target === "forge") {
    content = JSON.stringify({
      text: String(documentContent || "").slice(0, 12000),
      mode: options.forgeMode || autoDetected.forgeMode || "stack_trace",
      url: String(options.url || ""),
    });
  } else if (target === "word") {
    const refMatch = String(documentContent || "").match(BIBLE_REF_REGEX);
    content = JSON.stringify({
      reference: options.reference || (refMatch ? refMatch[0].trim() : ""),
      text: String(documentContent || "").slice(0, 4000),
    });
  } else {
    content = String(documentContent || "").slice(0, 12000);
  }

  chrome.tabs.create({ url: `${PRISM_APP_URL}${cfg.path}` }, (tab) => {
    if (!tab || tab.id === undefined) return;
    const tabId = tab.id;
    let injected = false;

    const inject = () => {
      if (injected) return;
      injected = true;
      chrome.tabs.onUpdated.removeListener(onUpdated);
      chrome.scripting
        .executeScript({
          target: { tabId },
          func: writePendingDocument,
          args: [cfg.storageKey, content, cfg.eventName],
          injectImmediately: true,
        })
        .catch((err) => console.warn("Dassah's Prism: injection failed", err));
    };

    function onUpdated(updatedTabId, changeInfo, updatedTab) {
      if (updatedTabId !== tabId) return;
      const url = updatedTab.url || changeInfo.url || "";
      if (!url.startsWith(PRISM_APP_URL)) return;
      if (changeInfo.status === "loading" || changeInfo.status === "complete") inject();
    }
    chrome.tabs.onUpdated.addListener(onUpdated);
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "smartRefractSelection",
      title: "Smart Send to Dassah's Prism (Auto-Detect)",
      contexts: ["selection"],
    });
    chrome.contextMenus.create({
      id: "sendToFocus",
      title: "Send to Prism Focus (Documents & Articles)",
      contexts: ["selection"],
    });
    chrome.contextMenus.create({
      id: "sendToPlay",
      title: "Send to Prism Play (Study Cards)",
      contexts: ["selection"],
    });
    chrome.contextMenus.create({
      id: "sendToForge",
      title: "Send to Prism Forge (Excel, Code & Errors)",
      contexts: ["selection"],
    });
    chrome.contextMenus.create({
      id: "sendToWord",
      title: "Open in Prism Word (Scripture)",
      contexts: ["selection"],
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!info.selectionText) return;
  const url = tab?.url || "";
  const title = tab?.title || "";
  if (info.menuItemId === "smartRefractSelection") {
    openPrismWithDocument(info.selectionText, { url, title });
  } else if (info.menuItemId === "sendToFocus") {
    openPrismWithDocument(info.selectionText, { target: "focus", url, title });
  } else if (info.menuItemId === "sendToPlay") {
    openPrismWithDocument(info.selectionText, { target: "play", url, title });
  } else if (info.menuItemId === "sendToForge") {
    openPrismWithDocument(info.selectionText, { target: "forge", url, title });
  } else if (info.menuItemId === "sendToWord") {
    openPrismWithDocument(info.selectionText, { target: "word", url, title });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showNoiseAlert") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "logo.png",
      title: "High Noise Detected",
      message: `This page has ~${request.wordCount} words. Consider refracting with Dassah's Prism Engine.`,
      priority: 1,
    });
  }
  if (request.action === "openPrismWithDocument") {
    openPrismWithDocument(request.text, {
      target: request.target,
      source: request.source,
      forgeMode: request.forgeMode,
      reference: request.reference,
      title: request.title,
      url: request.url,
    });
    sendResponse({ ok: true });
  }
});
