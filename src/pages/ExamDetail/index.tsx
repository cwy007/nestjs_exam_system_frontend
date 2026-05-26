import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Checkbox, Input, Popconfirm, Radio, Space, Spin, Tag } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { addAnswer, getExamDetail } from "./services";
import type { AnswerItem } from "./types";
import type { Question, QuestionType } from "../EditExam/types";
import globalMessage from "../../common/utils/globalMessage";
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

function parseContent(content: string): Question[] {
  if (!content) return [];
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? (parsed as Question[]) : [];
  } catch {
    return [];
  }
}

/** 按题目类型构造空答案 */
function emptyAnswer(type: QuestionType): string | string[] {
  return type === "checkbox" ? [] : "";
}

function ExamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const examId = Number(id);

  const [name, setName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<AnswerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!examId) return;
    setLoading(true);
    getExamDetail(examId)
      .then((res) => {
        const data = res.data;
        if (data) {
          setName(data.name ?? "");
          const list = parseContent(data.content ?? "");
          setQuestions(list);
          setAnswers(list.map((q) => ({ id: q.id, answer: emptyAnswer(q.type) })));
        }
      })
      .catch(() => {
        // 错误已由全局拦截器统一提示
      })
      .finally(() => setLoading(false));
  }, [examId]);

  const totalScore = useMemo(
    () => questions.reduce((sum, q) => sum + (Number(q.score) || 0), 0),
    [questions],
  );

  const answeredCount = useMemo(() => {
    return answers.reduce((cnt, a) => {
      if (Array.isArray(a.answer)) return cnt + (a.answer.length > 0 ? 1 : 0);
      return cnt + (a.answer && a.answer.toString().trim() ? 1 : 0);
    }, 0);
  }, [answers]);

  const updateAnswer = (index: number, value: string | string[]) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], answer: value };
      return next;
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await addAnswer({
        examId,
        content: JSON.stringify(answers),
      });
      globalMessage.instance?.success("提交成功");
      const answerId = res.data?.id;
      if (answerId) {
        navigate(`/test-result/${answerId}`, { replace: true });
      } else {
        navigate(-1);
      }
    } catch {
      // 全局拦截器已提示
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div className="exam-detail">
        <div className="exam-detail__header">
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              返回
            </Button>
            <span className="title">{name || "试卷答题"}</span>
            <span className="meta">
              共 {questions.length} 题 / 总分 {totalScore} / 已答 {answeredCount}
            </span>
          </Space>
        </div>

        {!loading && questions.length === 0 && (
          <Alert type="info" showIcon message="该试卷暂无题目" style={{ marginBottom: 12 }} />
        )}

        {questions.map((q, index) => (
          <div key={index} className="exam-detail__question">
            <div className="q-title">
              <Space>
                <Tag color={TYPE_COLOR[q.type]}>{TYPE_LABEL[q.type]}</Tag>
                <Tag>{q.score} 分</Tag>
              </Space>
              <div style={{ marginTop: 8 }}>
                {index + 1}. {q.question}
              </div>
            </div>

            {q.type === "radio" && (
              <Radio.Group
                value={answers[index]?.answer as string}
                onChange={(e) => updateAnswer(index, e.target.value)}
              >
                <Space direction="vertical">
                  {(q.options ?? []).map((opt, i) => (
                    <Radio key={i} value={opt}>
                      {opt}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            )}

            {q.type === "checkbox" && (
              <Checkbox.Group
                value={
                  Array.isArray(answers[index]?.answer) ? (answers[index].answer as string[]) : []
                }
                onChange={(vals) => updateAnswer(index, vals as string[])}
              >
                <Space direction="vertical">
                  {(q.options ?? []).map((opt, i) => (
                    <Checkbox key={i} value={opt}>
                      {opt}
                    </Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            )}

            {q.type === "input" && (
              <Input.TextArea
                rows={3}
                value={answers[index]?.answer as string}
                onChange={(e) => updateAnswer(index, e.target.value)}
                placeholder="请输入你的答案"
              />
            )}
          </div>
        ))}

        {questions.length > 0 && (
          <div className="exam-detail__footer">
            <Popconfirm
              title="确认提交答卷？"
              description={
                answeredCount < questions.length
                  ? `还有 ${questions.length - answeredCount} 道题未作答`
                  : "提交后将无法修改"
              }
              okText="提交"
              cancelText="取消"
              onConfirm={handleSubmit}
            >
              <Button type="primary" loading={submitting}>
                提交答卷
              </Button>
            </Popconfirm>
          </div>
        )}
      </div>
    </Spin>
  );
}

export default ExamDetail;
