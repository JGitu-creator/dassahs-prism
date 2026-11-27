// Dassah's Prism Engine: Smart Bridge — content script (v2.0.0)
// Detects whether the current page or highlighted text belongs in Focus, Play, Forge, or Word.

const BIBLE_REF_RE =
  /\b(?:(?:1|2|3|I|II|III)\s*)?(?:Genesis|Gen|Exodus|Exod|Leviticus|Lev|Numbers|Num|Deuteronomy|Deut|Joshua|Josh|Judges|Ruth|Samuel|Sam|Kings|Kgs|Chronicles|Chr|Ezra|Nehemiah|Neh|Esther|Job|Psalms?|Ps|Proverbs|Prov|Ecclesiastes|Eccl|Isaiah|Isa|Jeremiah|Jer|Lamentations|Ezekiel|Ezek|Daniel|Dan|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Matt|Mark|Luke|John|Acts|Romans|Rom|Corinthians|Cor|Galatians|Gal|Ephesians|Eph|Philippians|Phil|Colossians|Col|Thessalonians|Thess|Timothy|Tim|Titus|Philemon|Hebrews|Heb|James|Jas|Peter|Pet|Jude|Revelation|Rev)\.?\s+\d{1,3}(?::\d{1,3}(?:-\d{1,3})?)?/i;

const isClassroomPage = () => {
  const host = window.location.hostname.toLowerCase();
  return (
    /instructure\.com$|classroom\.google\.com$|blackboard\.com$|coursera\.org$|edx\.org$|khanacademy\.org$|schoology\.com$/i.test(host) ||
    host.includes("moodle") ||
    host.includes("brightspace") ||
    Boolean(document.querySelector("#wiki_page_show, .show-content.user_content, #assignment_show"))
  );
};

const isForgeTechPage = () => {
  const href = window.location.href.toLowerCase();
  return (
    /docs\.google\.com\/spreadsheets|excel\.office\.com|onedrive\.live\.com.*excel|github\.com|gitlab\.com|stackoverflow\.com|codepen\.io|replit\.com|vscode\.dev|developer\.mozilla\.org|kaggle\.com/i.test(href)
  );
};

const isScripturePage = () => {
  const host = window.location.hostname.toLowerCase();
  return /biblegateway\.com$|bible\.com$|blueletterbible\.org$|biblehub\.com$|esv\.org$/i.test(host);
};

const detectPageContext = () => {
  const selection = (window.getSelection?.()?.toString() || "").trim();
  const bodyText = (document.body?.innerText || "").trim();
  const sample = selection || bodyText.slice(0, 3000);

  if (isScripturePage() || (selection && BIBLE_REF_RE.test(selection))) {
    const match = (selection || document.title || bodyText).match(BIBLE_REF_RE);
    return {
      target: "word",
      label: "Prism Word (Scripture)",
      reference: match ? match[0].trim() : "",
    };
  }

  if (isClassroomPage()) {
    return { target: "play", label: "Prism Play (Class Study Cards)" };
  }

  if (
    isForgeTechPage() ||
    /^=\s*[A-Z]{2,}\(|VLOOKUP|XLOOKUP|SUMIFS|#REF!|#N\/A|#VALUE!|TypeError:|ReferenceError:|Traceback \(most recent call last\)|RuntimeError:/im.test(sample)
  ) {
    return { target: "forge", label: "Prism Forge (Excel, Code & Errors)" };
  }

  return { target: "focus", label: "Prism Focus (Calm Reading)" };
};

const extractReadableContent = () => {
  const ctx = detectPageContext();
  const selection = (window.getSelection?.()?.toString() || "").trim();

  if (ctx.target === "play") {
    const titleEl =
      document.querySelector(".page-title, #wiki_page_show h1, #assignment_show h1, h1.title, h1") || null;
    const bodyEl =
      document.querySelector(".show-content.user_content") ||
      document.querySelector("#wiki_page_show") ||
      document.querySelector("#assignment_show .description") ||
      document.querySelector("main") ||
      document.querySelector("#content");
    return {
      target: "play",
      source: "canvas",
      label: ctx.label,
      title: (titleEl?.innerText || document.title || "Class Reading").trim(),
      text: (selection || bodyEl?.innerText || document.body.innerText || "").trim().slice(0, 25000),
      url: window.location.href,
    };
  }

  if (ctx.target === "forge") {
    const codeEl = document.querySelector("pre, code, .formula-bar, [aria-label*='Formula'], .s-prose");
    return {
      target: "forge",
      source: "forge",
      label: ctx.label,
      title: document.title || "Tech Snippet",
      text: (selection || codeEl?.innerText || document.body.innerText || "").trim().slice(0, 12000),
      url: window.location.href,
    };
  }

  if (ctx.target === "word") {
    return {
      target: "word",
      source: "word",
      label: ctx.label,
      reference: ctx.reference || "",
      title: document.title || "Scripture Passage",
      text: (selection || ctx.reference || document.title || "").trim().slice(0, 4000),
      url: window.location.href,
    };
  }

  return {
    target: "focus",
    source: "web",
    label: ctx.label,
    title: document.title || "Web Reading",
    text: (selection || document.body.innerText || "").trim().slice(0, 12000),
    url: window.location.href,
  };
};

// Gentle floating bridge chip when a dense page is detected
const checkNoiseLevel = () => {
  const text = document.body?.innerText || "";
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount > 800) {
    const ctx = detectPageContext();
    injectPrismAlert(wordCount, ctx);
  }
};

const injectPrismAlert = (wordCount, ctx) => {
  if (document.getElementById("dassahs-prism-alert")) return;
  const colorMap = {
    focus: "linear-gradient(135deg, #2563eb, #6366f1)",
    play: "linear-gradient(135deg, #059669, #10b981)",
    forge: "linear-gradient(135deg, #d97706, #ea580c)",
    word: "linear-gradient(135deg, #7c3aed, #a855f7)",
  };
  const bg = colorMap[ctx.target] || colorMap.focus;

  const alertDiv = document.createElement("div");
  alertDiv.id = "dassahs-prism-alert";
  alertDiv.innerHTML = `
    <div class="prism-alert-icon" style="background:${bg}">DP</div>
    <div class="prism-alert-tooltip">Open in ${ctx.label} (${wordCount} words)</div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    #dassahs-prism-alert {
      position: fixed; bottom: 26px; right: 26px; z-index: 2147483647;
      cursor: pointer; display: flex; align-items: center; font-family: Inter, system-ui, sans-serif;
    }
    .prism-alert-icon {
      width: 48px; height: 48px; border-radius: 14px; color: white; font-weight: 900;
      font-style: italic; font-size: 16px; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 10px 28px rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.25); transition: transform 0.2s;
    }
    .prism-alert-tooltip {
      position: absolute; right: 58px; background: rgba(15,23,42,0.92); color: white;
      padding: 8px 14px; border-radius: 12px; font-size: 12px; font-weight: 700; white-space: nowrap;
      opacity: 0; transform: translateX(8px); transition: all 0.25s ease; pointer-events: none;
    }
    #dassahs-prism-alert:hover .prism-alert-tooltip { opacity: 1; transform: translateX(0); }
    #dassahs-prism-alert:hover .prism-alert-icon { transform: scale(1.08); }
  `;

  document.head.appendChild(style);
  document.body.appendChild(alertDiv);

  alertDiv.addEventListener("click", () => {
    const payload = extractReadableContent();
    chrome.runtime.sendMessage({
      action: "openPrismWithDocument",
      ...payload,
    });
    alertDiv.style.opacity = "0";
    setTimeout(() => alertDiv.remove(), 400);
  });
};

setTimeout(checkNoiseLevel, 2000);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractText") {
    sendResponse(extractReadableContent());
    return false;
  }
  if (request.action === "detectContext") {
    sendResponse(detectPageContext());
    return false;
  }
  sendResponse({});
  return false;
});
