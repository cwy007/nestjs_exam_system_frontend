import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Space, Spin, Tag } from "antd";
import { ArrowLeftOutlined, CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import dayjs from "dayjs";
import { getAnswerDetail } from "./services";
import type { AnswerDetail, UserAnswerItem } from "./types";
import type { Question, QuestionType } from "../EditExam/types";
import "./index.scss";

const TYPE_LABEL: Record<QuestionType, string> = {
  radio: "单选题",
  checkbox: "多选题",
  input: "填空题",
};
const TYPE_COLOR: Record<QuestionType, string> = {
  radio: "blue",
  checkbox: "purple",
  input: "orange",
};

function safeParse<T>(content: string, fallback: T): T {
  if (!content) return fallback;
  try {
    const v = JSON.parse(content);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

/** 将答案标准化为字符串数组，便于比较和展示 */
function normalize(ans: string | string[] | undefined | null): string[] {
  if (ans == null) return [];
  if (Array.isArray(ans)) return [...ans].sort();
  const s = String(ans).trim();
  return s ? [s] : [];
}

/** 比较用户答案与标准答案是否一致 */
function isCorrect(user: string | string[], correct: string | string[]): boolean {
  const a = normalize(user);
  const b = normalize(correct);
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

function displayAnswer(ans: string | string[] | undefined): string {
  if (ans == null) return "（未作答）";
  if (Array.isArray(ans)) return ans.length ? ans.join("、") : "（未作答）";
  return ans.toString().trim() || "（未作答）";
}

function ExamResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const answerId = Number(id);

  const [detail, setDetail] = useState<AnswerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!answerId) return;
    setLoading(true);
    getAnswerDetail(answerId)
      .then((res) => {
        if (res.data) setDetail(res.data);
      })
      .catch(() => {
        // 全局拦截器已提示
      })
      .finally(() => setLoading(false));
  }, [answerId]);

  const questions = useMemo<Question[]>(
    () => safeParse<Question[]>(detail?.exam?.content ?? "", []),
    [detail],
  );

  const userAnswers = useMemo<UserAnswerItem[]>(
    () => safeParse<UserAnswerItem[]>(detail?.content ?? "", []),
    [detail],
  );

  /** 通过题目 id 查找用户答案 */
  const answerMap = useMemo(() => {
    const map = new Map<string, string | string[]>();
    userAnswers.forEach((a) => map.set(a.id, a.answer));
    return map;
  }, [userAnswers]);

  const totalScore = useMemo(
    () => questions.reduce((s, q) => s + (Number(q.score) || 0), 0),
    [questions],
  );

  return (
    <Spin spinning={loading}>
      <div className="exam-result">
        <div style={{ marginBottom: 12 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/test-list")}>
            返回试卷列表
          </Button>
        </div>

        {!loading && !detail && <Alert type="error" showIcon message="未找到答卷数据" />}

        {detail && (
          <>
            <div className="exam-result__header">
              <div className="left">
                <div className="title">{detail.exam?.name || "试卷结果"}</div>
                <div className="meta">
                  答题人：{detail.answerer?.username} · 提交时间：
                  {detail.createTime ? dayjs(detail.createTime).format("YYYY-MM-DD HH:mm:ss") : "-"}
                </div>
                <div className="meta">
                  共 {questions.length} 题 / 总分 {totalScore}
                </div>
              </div>
              <div className="score">
                <div className="num">{detail.score}</div>
                <div className="label">得分</div>
              </div>
            </div>

            {questions.map((q, index) => {
              const user = answerMap.get(q.id);
              const correct = isCorrect(user ?? "", q.answer);
              return (
                <div key={q.id || index} className="exam-result__question">
                  <Space>
                    <Tag color={TYPE_COLOR[q.type]}>{TYPE_LABEL[q.type]}</Tag>
                    <Tag>{q.score} 分</Tag>
                    {correct ? (
                      <span className="right">
                        <CheckCircleFilled /> 正确
                      </span>
                    ) : (
                      <span className="wrong">
                        <CloseCircleFilled /> 错误
                      </span>
                    )}
                  </Space>
                  <div className="q-title">
                    {index + 1}. {q.question}
                  </div>

                  {q.type !== "input" && (q.options?.length ?? 0) > 0 && (
                    <div className="row">
                      <span className="label">选项：</span>
                      {q.options!.join(" / ")}
                    </div>
                  )}

                  <div className="row">
                    <span className="label">你的答案：</span>
                    <span className={correct ? "right" : "wrong"}>{displayAnswer(user)}</span>
                  </div>
                  <div className="row">
                    <span className="label">正确答案：</span>
                    <span className="right">{displayAnswer(q.answer)}</span>
                  </div>
                  {q.answerAnalyse && (
                    <div className="row">
                      <span className="label">解析：</span>
                      {q.answerAnalyse}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </Spin>
  );
}

export default ExamResult;
