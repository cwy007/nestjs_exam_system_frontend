import type { ApiResponse } from "../../common/types";
import request from "../../common/utils/request";
import type { Exam } from "../ExamList/types";
import type { SaveExamDto } from "./types";

/** 获取试卷详情 */
export function getExamDetail(id: number) {
  return request.get<never, ApiResponse<Exam>>(`/exam/${id}`);
}

/** 保存试卷内容 */
export function saveExam(data: SaveExamDto) {
  return request.post<never, ApiResponse<string>>("/exam/save", data);
}
