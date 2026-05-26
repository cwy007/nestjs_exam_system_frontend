import type { Exam } from "../ExamList/types";

/** 答卷详情（GET /answer/:id 返回的 data） */
export interface AnswerDetail {
  /** 答卷 ID */
  id: number;
  /** 答卷内容（答案数组的 JSON 字符串） */
  content: string;
  /** 得分 */
  score: number;
  createTime: string;
  updateTime: string;
  /** 答题人 ID */
  answererId: number;
  /** 试卷 ID */
  examId: number;
  /** 关联的试卷 */
  exam: Exam;
  /** 答题人信息 */
  answerer: {
    id: number;
    username: string;
    email: string;
  };
}

/** 用户作答（解析 content 后的单项） */
export interface UserAnswerItem {
  id: string;
  answer: string | string[];
}
