import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { emptyProfile, type FillResult, type PageInfo, type Profile } from '../types';
import './panel.css';
const appOrigin = import.meta.env.VITE_PREFILLO_API_ORIGIN || 'http://127.0.0.1:3000';

const fields: Array<{ key: keyof Profile; label: string; type?: string }> = [
  { key: 'firstName', label: 'First name' }, { key: 'lastName', label: 'Last name' },
  { key: 'email', label: 'Email', type: 'email' }, { key: 'phone', label: 'Phone', type: 'tel' },
  { key: 'linkedin', label: 'LinkedIn profile URL', type: 'url' },
  { key: 'portfolio', label: 'Portfolio URL', type: 'url' }, { key: 'github', label: 'GitHub URL', type: 'url' },
];

function Panel() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [licenseKey, setLicenseKey] = useState('');
  const [firebaseToken, setFirebaseToken] = useState('');
  const [page, setPage] = useState<PageInfo | null>(null);
  const [result, setResult] = useState<FillResult | null>(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [tabId, setTabId] = useState<number | null>(null);
  useEffect(() => {
    chrome.storage.local.get(['prefilloProfile', 'prefilloLicenseKey', 'prefilloFirebaseToken']).then(data => {
      setProfile({ ...emptyProfile, ...(typeof data.prefilloProfile === 'object' && data.prefilloProfile ? data.prefilloProfile : {}) });
      setLicenseKey(typeof data.prefilloLicenseKey === 'string' ? data.prefilloLicenseKey : '');
      setFirebaseToken(typeof data.prefilloFirebaseToken === 'string' ? data.prefilloFirebaseToken : '');
    });
    chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      const id = tabs[0]?.id;
      if (!id) return;
      setTabId(id);
      chrome.tabs.sendMessage(id, { type: 'PREFILLO_PAGE_INFO' }).then(setPage).catch(() => setStatus('Open a Greenhouse, Lever, Ashby, or Workday application.'));
    });
  }, []);
  async function save() {
    await chrome.storage.local.set({ prefilloProfile: profile, prefilloLicenseKey: licenseKey.trim(), prefilloFirebaseToken: firebaseToken.trim() });
    setStatus('Saved on this device. Passwords are never requested or stored.');
    if (tabId) chrome.tabs.sendMessage(tabId, { type: 'PREFILLO_PAGE_INFO' }).then(setPage).catch(() => {});
  }
  async function fill() {
    if (!tabId || !page || page.copyOnly) return;
    setBusy(true); setResult(null); setStatus('Checking your allowance…');
    try {
      await save();
      const response = await chrome.tabs.sendMessage(tabId, { type: 'PREFILLO_FILL' }) as FillResult;
      setResult(response);
      setStatus(response.message);
    } catch { setStatus('This page is unavailable. Reload it and try again.'); }
    finally { setBusy(false); }
  }
  async function copy(value: string) { await navigator.clipboard.writeText(value); setStatus('Copied. Paste it into the Workday form yourself.'); }
  return <main>
    <header><div className="mark">P</div><div><strong>Prefillo</strong><span>Fill, review, then you submit.</span></div></header>
    <section className="page-card"><span className="eyebrow">CURRENT PAGE</span>{page ? <><h1>{page.role || 'Job application'}</h1><p>{page.company || page.site} · {page.site}</p><span className="pill">{page.copyOnly ? 'Copy assist only' : `${page.fillable} contact fields ready`}</span>{page.blocker && <p className="warning">{page.blocker}</p>}</> : <p>Open a supported application page to begin.</p>}</section>
    <section><h2>Your details</h2><p className="muted">Only contact fields are filled. Review them on the employer site.</p><div className="fields">{fields.map(field => <label key={field.key}>{field.label}<div className="input-row"><input type={field.type || 'text'} value={profile[field.key]} onChange={event => setProfile(p => ({ ...p, [field.key]: event.target.value }))}/>{page?.copyOnly && profile[field.key] && <button type="button" onClick={() => void copy(profile[field.key])}>Copy</button>}</div></label>)}</div></section>
    <section><h2>License</h2><p className="muted">Get a license key from your Prefillo account. It stays in Chrome storage on this device.</p><label>License key<input type="password" autoComplete="off" value={licenseKey} onChange={event => setLicenseKey(event.target.value)} placeholder="prefillo_…"/></label><details><summary>Use Firebase token instead</summary><label>Firebase ID token<input type="password" autoComplete="off" value={firebaseToken} onChange={event => setFirebaseToken(event.target.value)}/></label><small>Tokens expire; a license key is easier for everyday use.</small></details><button className="secondary" onClick={() => void save()}>Save details and license</button></section>
    {page && !page.copyOnly && <button className="primary" disabled={busy || Boolean(page.blocker)} onClick={() => void fill()}>{busy ? 'Checking…' : 'Fill contact fields for review'}</button>}
    {result && <section className="review"><h2>Review every field</h2>{result.filled.map((field, i) => <p key={i}><strong>{field.label}</strong><span>{field.value}</span></p>)}{typeof result.balance === 'number' && <small>{result.balance} assisted applications remaining</small>}<p>Complete unanswered questions yourself. Prefillo cannot submit this form.</p></section>}
    {status && <p role="status" className="status">{status}</p>}
    <footer><a href={`${appOrigin}/workspace`} target="_blank" rel="noreferrer">Open Prefillo workspace ↗</a><p>Login, CAPTCHA, and 2FA stay with you. No LinkedIn automation.</p></footer>
  </main>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><Panel/></React.StrictMode>);
