import { greenhouseAdapter } from '../content/adapters/greenhouse';
import { leverAdapter } from '../content/adapters/lever';
import { ashbyAdapter } from '../content/adapters/ashby';
import { workdayAdapter } from '../content/adapters/workday';
import type { SiteAdapter } from '../content/adapters/types';
import { fillContactFields, handoffBlocker, plannedFields } from './fill';
import { emptyProfile, type FillResult, type PageInfo, type Profile } from './types';

const adapters: SiteAdapter[] = [greenhouseAdapter, leverAdapter, ashbyAdapter, workdayAdapter];
const adapter = adapters.find(item => item.matches(new URL(location.href)));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id || !adapter) return false;
  if (message?.type === 'PREFILLO_PAGE_INFO') {
    chrome.storage.local.get('prefilloProfile').then(({ prefilloProfile }) => {
      const profile = { ...emptyProfile, ...(typeof prefilloProfile === 'object' && prefilloProfile ? prefilloProfile : {}) } as Profile;
      sendResponse({
        site: adapter.id,
        ...adapter.getPageInfo(),
        url: location.href,
        copyOnly: adapter.id === 'workday',
        fillable: adapter.id === 'workday' ? 0 : plannedFields(profile).length,
        blocker: handoffBlocker(),
      } satisfies PageInfo);
    });
    return true;
  }
  if (message?.type === 'PREFILLO_FILL') {
    void (async (): Promise<FillResult> => {
      if (adapter.id === 'workday') return { filled: [], skipped: 0, message: 'Workday is copy-assist only. Copy details from the panel and enter them yourself.' };
      const blocker = handoffBlocker();
      if (blocker) return { filled: [], skipped: 0, message: blocker, blocker };
      const { prefilloProfile } = await chrome.storage.local.get('prefilloProfile');
      const profile = { ...emptyProfile, ...(typeof prefilloProfile === 'object' && prefilloProfile ? prefilloProfile : {}) } as Profile;
      const planned = plannedFields(profile);
      if (!planned.length) return { filled: [], skipped: 0, message: 'No empty contact fields were found. Review the form yourself.' };
      const license = await chrome.runtime.sendMessage({ type: 'PREFILLO_LICENSE_CONSUME', url: location.href, ...adapter.getPageInfo() });
      if (!license?.ok) return { filled: [], skipped: planned.length, message: license?.error || 'License check failed.' };
      const filled = fillContactFields(profile);
      return { filled, skipped: Math.max(0, planned.length - filled.length), balance: license.remaining, message: 'Contact fields filled. Review every answer and click Submit yourself on the employer site.' };
    })().then(sendResponse).catch(error => sendResponse({ filled: [], skipped: 0, message: error instanceof Error ? error.message : 'Could not fill this page.' } satisfies FillResult));
    return true;
  }
  return false;
});
