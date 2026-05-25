import type { ApiResponse } from "../../common/types";
import request from "../../common/utils/request";
import type { RegisterUserDto } from "./types";

export function register(data: RegisterUserDto) {
  return request.post<never, ApiResponse<string>>("/user/register", data);
}

export function getCaptcha(email: string) {
  return request.get<never, ApiResponse<string>>("/user/register-captcha", {
    params: { email },
  });
}
