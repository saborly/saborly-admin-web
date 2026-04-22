/**
 * Default Mongo ids for Barcelona + Sabadell when NEXT_PUBLIC_* is missing at build (e.g. Vercel env not set).
 * Override with NEXT_PUBLIC_DEFAULT_BRANCH_ID / NEXT_PUBLIC_SABADELL_BRANCH_ID in .env
 */
export const BRANCH_ID_FALLBACK = {
  BARCELONA: '68dbd4267fe1403440fb5d88',
  SABADELL: '69e70e2f3a6b3f6814c6e8e3',
};

function trimEnv(key) {
  const v = envId(key);
  if (v == null || v === undefined) return '';
  return String(v).trim();
}

/**
 * Resolves branch for authenticated API calls.
 * Uses only explicit localStorage (trimmed) or NEXT_PUBLIC_DEFAULT_BRANCH_ID — no hardcoded
 * Barcelona→Sabadell chain, which caused Sabadell selection to still send Barcelona when storage was empty or env pointed at Barcelona only.
 */
export function getClientBranchId() {
  if (typeof window === 'undefined') {
    return trimEnv('NEXT_PUBLIC_DEFAULT_BRANCH_ID') || null;
  }
  try {
    const raw = localStorage.getItem('branchId');
    const fromStorage = raw != null ? String(raw).trim() : '';
    if (fromStorage) return fromStorage;
  } catch {
    // ignore
  }
  return trimEnv('NEXT_PUBLIC_DEFAULT_BRANCH_ID') || null;
}

/**
 * Clears auth + branch context on logout so the next session does not reuse another branch.
 * Call this from every logout path (including offers shell and AdminShell default).
 */
export function clearAdminAuthStorage() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('branchId');
    sessionStorage.clear();
  } catch {
    // ignore
  }
}

/**
 * Pick a default branch from GET /branches/public: Barcelona first, then Sabadell, else first.
 */
export function pickDefaultBranchFromList(branches) {
  if (!Array.isArray(branches) || !branches.length) return null;
  const lower = (v) => String(v ?? '').toLowerCase();
  const barcelona = branches.find(
    (b) => lower(b.name).includes('barcelona') || lower(b.location).includes('barcelona')
  );
  if (barcelona) return barcelona._id;
  const sabadell = branches.find(
    (b) => lower(b.name).includes('sabadell') || lower(b.location).includes('sabadell')
  );
  if (sabadell) return sabadell._id;
  return branches[0]._id;
}

/** Login screen default: Sabadell if listed, else Barcelona / first (see pickDefaultBranchFromList). */
export function pickPreferredLoginBranch(branches) {
  if (!Array.isArray(branches) || !branches.length) return null;
  const lower = (v) => String(v ?? '').toLowerCase();
  const sabadell = branches.find(
    (b) => lower(b.name).includes('sabadell') || lower(b.location).includes('sabadell')
  );
  if (sabadell) return sabadell._id;
  return pickDefaultBranchFromList(branches);
}

const lower = (v) => String(v ?? '').toLowerCase();

/** All searchable text for a branch (name, location, legacy address). */
export function branchSearchText(b) {
  if (!b) return '';
  return lower([b.name, b.location, b.address].filter(Boolean).join(' '));
}

/** Short label for login dropdowns (avoids “Name — Sabadell — Sabadell, Spain”). */
export function formatBranchMenuLabel(b) {
  if (!b) return '';
  const name = String(b.name || '').trim();
  const loc = String(b.location || '').trim();
  if (!name) return loc || 'Store';
  if (!loc) return name;
  const city = loc.split(',')[0].trim().toLowerCase();
  if (city && name.toLowerCase().includes(city)) return name;
  return `${name} · ${loc}`;
}

export function findBranchByKeyword(branches, keyword) {
  if (!Array.isArray(branches) || !keyword) return null;
  const k = keyword.toLowerCase();
  return branches.find((b) => branchSearchText(b).includes(k)) || null;
}

function envId(key) {
  return typeof process !== 'undefined' ? process.env[key] : null;
}

function otherBranch(branches, excludeId) {
  if (!excludeId) return null;
  return branches.find((x) => String(x._id) !== String(excludeId)) || null;
}

/**
 * Single source of truth for the dual login cards (keywords, env ids, then sorted order when exactly two API rows).
 */
export function getLoginBranchPair(branches) {
  const list = Array.isArray(branches) ? branches.filter(Boolean) : [];
  if (list.length === 0) {
    return { barcelona: null, sabadell: null, showDual: false };
  }

  const sorted = [...list].sort((a, b) =>
    String(a.name || '').localeCompare(String(b.name || ''))
  );

  const defEnv = envId('NEXT_PUBLIC_DEFAULT_BRANCH_ID');
  const sabEnv = envId('NEXT_PUBLIC_SABADELL_BRANCH_ID');

  let barcelona =
    findBranchByKeyword(sorted, 'barcelona') ||
    (defEnv ? sorted.find((b) => String(b._id) === String(defEnv)) : null);

  let sabadell =
    findBranchByKeyword(sorted, 'sabadell') ||
    (sabEnv ? sorted.find((b) => String(b._id) === String(sabEnv)) : null);

  if (barcelona && sabadell && String(barcelona._id) === String(sabadell._id)) {
    sabadell = otherBranch(sorted, barcelona._id);
  }

  if (sabadell && !barcelona) {
    barcelona = otherBranch(sorted, sabadell._id);
  }
  if (barcelona && !sabadell) {
    sabadell = otherBranch(sorted, barcelona._id);
  }

  if (
    sorted.length === 2 &&
    (!barcelona || !sabadell || String(barcelona._id) === String(sabadell._id))
  ) {
    barcelona = sorted[0];
    sabadell = sorted[1];
  }

  const showDual =
    !!barcelona &&
    !!sabadell &&
    String(barcelona._id) !== String(sabadell._id) &&
    sorted.length >= 2;

  return { barcelona, sabadell, showDual };
}

export function resolveBarcelonaBranch(branches) {
  return getLoginBranchPair(branches).barcelona;
}

export function resolveSabadellBranch(branches) {
  return getLoginBranchPair(branches).sabadell;
}

/**
 * Merge API row by id, or use a minimal row so login can still send X-Branch-Id.
 */
export function coerceBranchRow(id, displayName, branches) {
  if (!id) return null;
  const list = Array.isArray(branches) ? branches : [];
  const hit = list.find((b) => String(b._id) === String(id));
  if (hit) return hit;
  return { _id: id, name: displayName, location: '' };
}

/**
 * Login UI: always offer Barcelona + Sabadell using env ids, then BRANCH_ID_FALLBACK, merged with /branches/public rows.
 * (API may return only one active branch — still show both stores for X-Branch-Id.)
 */
export function getStoreLoginOptions(branches) {
  const list = Array.isArray(branches) ? branches.filter(Boolean) : [];
  const def = trimEnv('NEXT_PUBLIC_DEFAULT_BRANCH_ID') || BRANCH_ID_FALLBACK.BARCELONA;
  const sab = trimEnv('NEXT_PUBLIC_SABADELL_BRANCH_ID') || BRANCH_ID_FALLBACK.SABADELL;

  if (def && sab && String(def) !== String(sab)) {
    return {
      barcelona: coerceBranchRow(def, 'Barcelona', list),
      sabadell: coerceBranchRow(sab, 'Sabadell', list),
      showDual: true,
    };
  }

  const p = getLoginBranchPair(list);
  return {
    barcelona: p.barcelona,
    sabadell: p.sabadell,
    showDual: p.showDual,
  };
}
