import { describe, expect, it } from "vitest";
import { ApiError } from "@/apis/client";
import { getUserFacingApiError } from "@/utils/api-error-message";

describe("getUserFacingApiError", () => {
  it("maps known error codes to English copy", () => {
    expect(
      getUserFacingApiError(
        new ApiError("Thông tin đăng nhập không hợp lệ", "INVALID_CREDENTIALS", 401),
        "Please try again."
      )
    ).toBe("The email or password is incorrect.");
  });

  it("maps common HTTP statuses when the error code is unknown", () => {
    expect(
      getUserFacingApiError(
        new ApiError("Không có quyền truy cập", "UNKNOWN_CODE", 403),
        "Please try again."
      )
    ).toBe("You do not have permission to perform this action.");
  });

  it("uses the English fallback instead of unknown server messages or details", () => {
    expect(
      getUserFacingApiError(
        new ApiError("Không thể thực hiện thao tác", "UNKNOWN_CODE", 400, [
          { field: "name", message: "Tên không được để trống" },
        ]),
        "We could not complete this action."
      )
    ).toBe("We could not complete this action.");
  });

  it("does not expose messages from ordinary errors", () => {
    expect(
      getUserFacingApiError(new Error("Có lỗi xảy ra"), "Something went wrong.")
    ).toBe("Something went wrong.");
  });
});
