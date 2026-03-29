/**
 * Formats an ISO date string to 'dd/MM HH:mm'.
 * @param {string} isoDate
 * @returns {string}
 */
export const formatShortDate = (isoDate) => {
  if (!isoDate) return '-';
  try {
    const d = new Date(isoDate);
    const dd = String(d.getDate()).padStart(2, '0');
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const HH = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${MM} ${HH}:${mm}`;
  } catch {
    return '-';
  }
};

/**
 * Formats an ISO date string to 'dd/MM/YYYY'.
 */
export const formatDate = (isoDate) => {
  if (!isoDate) return '-';
  try {
    const d = new Date(isoDate);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  } catch {
    return '-';
  }
};

/**
 * Formats an ISO datetime-local string value.
 */
export const formatIsoDate = (isoDate) => {
  if (!isoDate) return '';
  try {
    return new Date(isoDate).toISOString().slice(0, 16);
  } catch {
    return '';
  }
};
