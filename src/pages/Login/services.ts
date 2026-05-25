import type { ApiResponse } from "../../common/types";
import request from "../../common/utils/request";
import type { LoginUserDto, LoginUserVo } from "./types";

export function login(data: LoginUserDto) {
  return request.post<never, ApiResponse<LoginUserVo>>("/user/login", data);
}
