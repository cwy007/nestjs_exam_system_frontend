import type { ApiResponse } from "../../common/types";
import request from "../../common/utils/request";
import type { AnswerDetail } from "./types";

/** 获取答卷详情（含关联试卷与答题人） */
export function getAnswerDetail(id: number) {
  return request.get<never, ApiResponse<AnswerDetail>>(`/answer/${id}`);
}
