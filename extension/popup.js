async function sendToPrism(overrideTarget) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const statusEl = document.getElementById("status");
  const smartBtn = document.getElementById("smartBtn");

  statusEl.innerText = "Capturing page cleanly...";
  smartBtn.disabled = true;

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: "extractText" });
    if (!response || !response.text) throw new Error("No readable text found on this page.");

    const finalTarget = overrideTarget || response.target || "focus";
    statusEl.innerText = `Opening Prism ${finalTarget.toUpperCase()}...`;

    await chrome.runtime.sendMessage({
      action: "openPrismWithDocument",
      text: response.text,
      target: finalTarget,
      source: response.source,
      reference: response.reference,
      title: response.title,
      url: response.url,
    });
    window.close();
  } catch (err) {
    if (err.message && err.message.includes("Could not establish connection")) {
      statusEl.innerText = "Refresh this tab once to sync the Prism Bridge.";
    } else {
      statusEl.innerText = "Error: " + (err.message || "Could not capture tab.");
    }
    smartBtn.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const statusEl = document.getElementById("status");
  const smartBtn = document.getElementById("smartBtn");
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const ctx = await chrome.tabs.sendMessage(tab.id, { action: "detectContext" });
    if (ctx?.label) {
      statusEl.innerText = `Auto-Detected: ${ctx.label}`;
      smartBtn.innerText = `Open in ${ctx.label.split(" (")[0]}`;
    } else {
      statusEl.innerText = "Ready — Auto-routes to Focus, Play, Forge, or Word";
    }
  } catch {
    statusEl.innerText = "Ready — Pick any Prism below or refresh tab";
  }
});

document.getElementById("smartBtn").addEventListener("click", () => sendToPrism(null));
document.querySelectorAll(".pick-btn").forEach((btn) => {
  btn.addEventListener("click", () => sendToPrism(btn.getAttribute("data-target")));
});
