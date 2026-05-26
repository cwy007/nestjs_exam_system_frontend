import type { ApiResponse } from "../../common/types";
import request from "../../common/utils/request";
import type { Exam } from "../ExamList/types";
import type { AddAnswerDto, AddAnswerVo } from "./types";

/** 获取试卷详情（与编辑页共用同一接口） */
export function getExamDetail(id: number) {
  return request.get<never, ApiResponse<Exam>>(`/exam/${id}`);
}

/** 提交答卷 */
export function addAnswer(data: AddAnswerDto) {
  return request.post<never, ApiResponse<AddAnswerVo>>("/answer/add", data);
}
