import type { ApiResponse } from "../../common/types";
import request from "../../common/utils/request";
import type { AddExamDto, Exam, ExamListQuery, ExamListVo } from "./types";

/** 获取试卷列表 */
export function getExamList(params: ExamListQuery = {}) {
  return request.get<never, ApiResponse<ExamListVo>>("/exam/list", { params });
}

/** 新建试卷 */
export function addExam(data: AddExamDto) {
  return request.post<never, ApiResponse<Exam>>("/exam/add", data);
}

/** 删除试卷（软删除，移入回收站） */
export function deleteExam(id: number) {
  return request.delete<never, ApiResponse<string>>(`/exam/delete/${id}`);
}

/** 发布试卷 */
export function publishExam(id: number) {
  return request.get<never, ApiResponse<string>>(`/exam/publish/${id}`);
}

/** 取消发布试卷 */
export function unpublishExam(id: number) {
  return request.get<never, ApiResponse<string>>(`/exam/unpublish/${id}`);
}
