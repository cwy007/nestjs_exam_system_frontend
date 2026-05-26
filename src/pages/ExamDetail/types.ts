/** 单题作答（提交时序列化为 JSON 字符串） */
export interface AnswerItem {
  /** 对应的题目 ID */
  id: string;
  /** 用户作答内容：单选/填空 -> string；多选 -> string[] */
  answer: string | string[];
}

/** 提交答卷 DTO */
export interface AddAnswerDto {
  /** 试卷 ID */
  examId: number;
  /** 答卷内容（答案数组的 JSON 字符串） */
  content: string;
}

/** 提交答卷接口返回 */
export interface AddAnswerVo {
  /** 答卷 ID（后续跳转结果页使用） */
  id: number;
  content: string;
  score: number;
  createTime: string;
  updateTime: string;
  answererId: number;
  examId: number;
}
