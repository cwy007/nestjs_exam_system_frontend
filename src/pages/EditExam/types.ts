/** 题目类型：单选 / 多选 / 填空 */
export type QuestionType = "radio" | "checkbox" | "input";

/** 单道题目结构（最终序列化到试卷 content 字段） */
export interface Question {
  /** 题目唯一 ID（前端生成，随题目一起保存） */
  id: string;
  /** 题目类型 */
  type: QuestionType;
  /** 题干 */
  question: string;
  /** 选项列表，仅单选/多选用 */
  options?: string[];
  /** 分值 */
  score: number;
  /**
   * 正确答案：
   * - radio / input -> string
   * - checkbox      -> string[]
   */
  answer: string | string[];
  /** 答案解析 */
  answerAnalyse: string;
}

export interface SaveExamDto {
  /** 试卷ID */
  id: number;
  /** 试卷内容（题目数组的 JSON 字符串） */
  content: string;
}
