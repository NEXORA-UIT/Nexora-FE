type ApiErrorLike = {
  code: string;
  status: number;
  message?: string;
  details?: Array<{ field?: string; message?: string }>;
};

const VIETNAMESE_CHAR_REGEX = /[\u00C0-\u024F\u1EA0-\u1EF9]/;

const VIETNAMESE_TO_ENGLISH_MAP: Record<string, string> = {
  "Ngày bắt đầu phải trước hoặc bằng hạn chót": "Start date must be before or equal to due date.",
  "Thời điểm bắt đầu phải trước hoặc bằng thời điểm kết thúc": "Start time must be before or equal to end time.",
  "Tiêu đề không được để trống": "Title cannot be empty.",
  "Tên không được để trống": "Name cannot be empty.",
  "Phải có ít nhất một trường cần cập nhật": "At least one field must be updated.",
  "Card đã được cập nhật; hãy tải lại dữ liệu": "Card was modified by another session. Please refresh data.",
  "Card đã được cập nhật": "Card was modified by another session. Refreshing...",
  "Card không tồn tại": "Card not found.",
  "Card đã được archive": "Card is archived.",
  "Card chưa được archive": "Card is not archived.",
  "Board đã đạt giới hạn 2.000 Card": "Board has reached the maximum limit of 2,000 cards.",
  "Board đã đạt giới hạn 30 List đang hoạt động": "Board has reached the limit of 30 active lists.",
  "Card đạt giới hạn tối đa 50 Tasks": "Checklist limit reached: A card can have at most 50 tasks.",
  "Người dùng đã được phân công vào Card": "User is already assigned to this card.",
  "Label đã được gắn vào Card": "Label is already attached to this card.",
  "Dung lượng tệp đính kèm tối đa là 25MB": "File size exceeds 25MB limit.",
  "Định dạng tệp không hợp lệ": "Invalid file format.",
  "Định dạng tệp không được hỗ trợ": "File format not supported.",
  "Tệp không được để trống": "File cannot be empty.",
  "Bình luận phải có từ 1 đến 10.000 ký tự": "Comment content must be between 1 and 10,000 characters.",
  "Người được nhắc tên phải thuộc Board": "Mentioned user must be a member of this board.",
  "Không thể chuyển sang DONE do điều kiện phụ thuộc": "Cannot complete card due to unresolved dependencies.",
  "Hoàn thành các Card tiên quyết trước khi chuyển sang Done": "Complete prerequisite cards before marking as Done.",
  "Card không thể phụ thuộc vào chính nó": "A card cannot depend on itself.",
  "Quan hệ phụ thuộc đã tồn tại": "Dependency already exists.",
  "Quan hệ này sẽ tạo vòng lặp phụ thuộc": "This dependency would create a cycle.",
  "Bạn không có quyền thực hiện thao tác này": "You do not have permission to perform this action.",
  "Tài nguyên không tồn tại": "Resource not found.",
  "Tài nguyên đang được lưu trữ": "Resource is archived.",
  "Dữ liệu không hợp lệ": "Invalid input data.",
  "Dữ liệu đầu vào không hợp lệ": "Invalid input data.",
  "Tham số không hợp lệ": "Invalid parameters.",
  "Tham số truy vấn không hợp lệ": "Invalid query parameters.",
  "Email đã được sử dụng": "An account with this email already exists.",
  "Email hoặc mật khẩu không đúng": "The email or password is incorrect.",
  "Tài khoản đã bị khóa": "Your account has been locked.",
  "Lời mời đã hết hạn": "This invitation has expired.",
  "Lời mời không hợp lệ hoặc đã được sử dụng": "This invitation is invalid or has already been used.",
};

const ERROR_MESSAGES_BY_CODE: Record<string, string> = {
  INVALID_CREDENTIALS: "The email or password is incorrect.",
  ACCOUNT_LOCKED: "Your account has been locked. Please contact support.",
  RATE_LIMITED: "Too many attempts. Please wait a moment and try again.",
  MAIL_NOT_CONFIGURED: "Email verification is temporarily unavailable. Please try again later.",
  EMAIL_ALREADY_EXISTS: "An account with this email already exists.",
  EMAIL_TAKEN: "An account with this email already exists.",
  VERIFIED_EMAIL_REQUIRED: "Verify your email before continuing.",
  ACCOUNT_LINK_REQUIRED: "Sign in to the existing account to link this provider.",
  INVALID_DATE_RANGE: "Start date must be before or equal to due date.",
  CARD_CONFLICT: "Card was modified by another session. Refreshing...",
  CARD_LIMIT_REACHED: "Board has reached the maximum limit of 2,000 cards.",
  TASK_LIMIT_REACHED: "Checklist limit reached: A card can have at most 50 tasks.",
  CARD_LABEL_EXISTS: "This label is already attached to this card.",
  ATTACHMENT_TYPE_INVALID: "Invalid file format. Allowed formats: PDF, DOCX, TXT, PNG, JPG.",
  PAYLOAD_TOO_LARGE: "File size exceeds 25MB limit.",
  ATTACHMENT_EMPTY: "Attachment file cannot be empty.",
  COMMENT_INVALID: "Comment content must be between 1 and 10,000 characters.",
  MENTION_INVALID: "Mentioned user must be a member of this board.",
  DEPENDENCY_ALREADY_EXISTS: "Dependency already exists.",
  DEPENDENCY_CYCLE: "This dependency would create a cycle.",
  RESOURCE_ARCHIVED: "This resource is archived and cannot be modified.",
  WORKSPACE_FROZEN: "This workspace is frozen and cannot be modified.",
  ALREADY_MEMBER: "User is already a member.",
  INVITATION_EXISTS: "An invitation is already pending.",
  INVITATION_EXPIRED: "This invitation has expired.",
  INVALID_INVITATION_TOKEN: "This invitation is invalid or has already been used.",
};

const ERROR_MESSAGES_BY_STATUS: Record<number, string> = {
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested item could not be found.",
  409: "This action conflicts with the current state. Refresh and try again.",
  429: "Too many requests. Please wait a moment and try again.",
};

const isApiErrorLike = (error: unknown): error is ApiErrorLike => {
  if (typeof error !== "object" || error === null) return false;

  const candidate = error as Partial<ApiErrorLike>;
  return typeof candidate.code === "string" && typeof candidate.status === "number";
};

const translateVietnameseString = (text: string): string | null => {
  const trimmed = text.trim();
  if (VIETNAMESE_TO_ENGLISH_MAP[trimmed]) {
    return VIETNAMESE_TO_ENGLISH_MAP[trimmed];
  }
  for (const [vietnameseKey, englishVal] of Object.entries(VIETNAMESE_TO_ENGLISH_MAP)) {
    if (trimmed.includes(vietnameseKey)) {
      return englishVal;
    }
  }
  return null;
};

export const getUserFacingApiError = (
  error: unknown,
  fallback: string
): string => {
  if (!isApiErrorLike(error)) return fallback;

  // 1. Check known error codes
  const knownMessage = ERROR_MESSAGES_BY_CODE[error.code];
  if (knownMessage) return knownMessage;

  // 2. If it's a validation error, inspect details first for specific field-level validation issues
  if (error.code === "VALIDATION_ERROR") {
    if (Array.isArray(error.details) && error.details.length > 0) {
      for (const d of error.details) {
        if (d && typeof d.message === "string") {
          const translated = translateVietnameseString(d.message);
          if (translated) return translated;
          if (!VIETNAMESE_CHAR_REGEX.test(d.message)) {
            return d.message.trim();
          }
        }
      }
    }

    if (typeof error.message === "string" && error.message.trim()) {
      const translated = translateVietnameseString(error.message);
      if (translated) return translated;
      if (!VIETNAMESE_CHAR_REGEX.test(error.message)) {
        const msg = error.message.trim();
        if (msg !== "VALIDATION_ERROR" && msg !== "Bad Request") {
          return msg;
        }
      }
    }

    return fallback;
  }

  // 3. For any other error, if the raw message explicitly matches date/conflict Vietnamese strings, translate it
  if (typeof error.message === "string" && error.message.trim()) {
    const directTranslation = translateVietnameseString(error.message);
    if (directTranslation) {
      return directTranslation;
    }
  }

  // 4. Map HTTP status codes (401, 403, 404, 409, 429, 500+)
  const statusMessage = ERROR_MESSAGES_BY_STATUS[error.status];
  if (statusMessage) return statusMessage;
  if (error.status >= 500) return "Something went wrong on our end. Please try again.";

  return fallback;
};
