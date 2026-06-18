export const FREEMIUM_DOCUMENT_LIMIT = 5;

export const DOCUMENT_LIMIT_MESSAGE =
  `Bạn đã đạt giới hạn ${FREEMIUM_DOCUMENT_LIMIT} tài liệu đang hoạt động của gói miễn phí. ` +
  'Vui lòng xóa bớt tài liệu trong Thư viện hoặc nâng cấp Premium để tiếp tục tải lên.';

function collectErrorText(error) {
  const parts = [error?.message];

  if (error?.data) {
    if (typeof error.data === 'string') {
      parts.push(error.data);
    } else {
      parts.push(error.data.message, error.data.title, error.data.error);
      try {
        parts.push(JSON.stringify(error.data));
      } catch {
        // Ignore non-serializable error payloads.
      }
    }
  }

  return parts.filter(Boolean).join(' ').toLowerCase();
}

export function isDocumentLimitError(error) {
  const text = collectErrorText(error);

  return (
    text.includes('reached the limit') ||
    text.includes('active documents for the freemium') ||
    (text.includes('giới hạn') && text.includes('tài liệu')) ||
    (text.includes('gioi han') && text.includes('tai lieu'))
  );
}

export function getDocumentUploadErrorMessage(error, fallback = 'Tải lên thất bại. Vui lòng thử lại.') {
  if (isDocumentLimitError(error)) {
    return DOCUMENT_LIMIT_MESSAGE;
  }

  return error?.message || fallback;
}
