const apiOrigin = import.meta.env.VITE_PREFILLO_API_ORIGIN || 'http://127.0.0.1:3000';

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id) return false;
  if (message?.type !== 'PREFILLO_LICENSE_STATUS' && message?.type !== 'PREFILLO_LICENSE_CONSUME') return false;
  void (async () => {
    const { prefilloLicenseKey, prefilloFirebaseToken } = await chrome.storage.local.get(['prefilloLicenseKey', 'prefilloFirebaseToken']);
    const credential = prefilloLicenseKey || prefilloFirebaseToken;
    if (!credential) return { ok: false, error: 'Add your Prefillo license key or Firebase token in the panel.' };
    const consume = message.type === 'PREFILLO_LICENSE_CONSUME';
    const response = await fetch(`${apiOrigin}/api/license/${consume ? 'consume' : 'status'}`, {
      method: consume ? 'POST' : 'GET',
      headers: { 'Authorization': `Bearer ${credential}`, 'Content-Type': 'application/json' },
      body: consume ? JSON.stringify({ url: message.url, company: message.company, role: message.role }) : undefined,
    });
    const data = await response.json();
    return response.ok ? { ok: true, ...data } : { ok: false, error: data.error || 'License check failed.' };
  })().then(sendResponse).catch(() => sendResponse({ ok: false, error: 'Could not reach Prefillo. Check your connection and API configuration.' }));
  return true;
});
