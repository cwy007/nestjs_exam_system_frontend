export interface Exam {
  /** 试卷ID */
  id: number;
  /** 试卷名称 */
  name: string;
  /** 是否已发布 */
  isPublished: boolean;
  /** 是否已删除 */
  isDeleted: boolean;
  /** 试卷内容（JSON 字符串） */
  content: string;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime: string;
  /** 创建人ID */
  createUserId: number;
}

export interface ExamListVo {
  /** 试卷列表 */
  list: Exam[];
  /** 总数 */
  total: number;
}

export interface ExamListQuery {
  /** 是否查询回收站 */
  bin?: boolean;
  /** 页码，从 1 开始 */
  page?: number;
  /** 每页条数 */
  pageSize?: number;
}

export interface AddExamDto {
  /** 试卷名称 */
  name: string;
}

/** 排行榜单项（answer + answerer + exam 关联） */
export interface RankingItem {
  id: number;
  content: string;
  score: number;
  createTime: string;
  updateTime: string;
  answererId: number;
  examId: number;
  answerer: {
    id: number;
    username: string;
    email: string;
  };
  exam: Exam;
}
