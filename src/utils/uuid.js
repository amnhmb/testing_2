export const generateUUID = () => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    try {
      return window.crypto.randomUUID();
    } catch (e) {
      // Fallback if randomUUID fails or is undefined
    }
  }
  // Fallback for non-secure contexts (e.g., http://192.168.x.x)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
