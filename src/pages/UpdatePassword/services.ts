import type { ApiResponse } from "../../common/types";
import request from "../../common/utils/request";
import type { UpdateUserPasswordDto } from "./types";

export function updatePassword(data: UpdateUserPasswordDto) {
  return request.post<never, ApiResponse<string>>("/user/update_password", data);
}

export function getUpdatePasswordCaptcha(email: string) {
  return request.get<never, ApiResponse<string>>("/user/update_password/captcha", {
    params: { email },
  });
}
