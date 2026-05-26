import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Input,
  InputNumber,
  Radio,
  Space,
  Spin,
  Tabs,
  Tag,
} from "antd";
import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { getExamDetail, saveExam } from "./services";
import type { Question, QuestionType } from "./types";
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

/** 生成一个随机题目 ID */
function genQuestionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** 按题型构造一道默认题目 */
function createDefaultQuestion(type: QuestionType): Question {
  if (type === "input") {
    return {
      id: genQuestionId(),
      type,
      question: "",
      score: 5,
      answer: "",
      answerAnalyse: "",
    };
  }
  return {
    id: genQuestionId(),
    type,
    question: "",
    options: ["选项1", "选项2"],
    score: 5,
    answer: type === "checkbox" ? [] : "",
    answerAnalyse: "",
  };
}

/** 解析后端返回的 content 字段为题目数组，并为缺失 id 的旧数据补上 id */
function parseContent(content: string): Question[] {
  if (!content) return [];
  try {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) return [];
    return (parsed as Question[]).map((q) => (q.id ? q : { ...q, id: genQuestionId() }));
  } catch {
    return [];
  }
}

function EditExam() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const examId = Number(id);

  const [name, setName] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!examId) return;
    setLoading(true);
    getExamDetail(examId)
      .then((res) => {
        const data = res.data;
        if (data) {
          setName(data.name ?? "");
          setIsPublished(!!data.isPublished);
          const list = parseContent(data.content ?? "");
          setQuestions(list);
          setSelectedIndex(list.length > 0 ? 0 : -1);
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

  const selected = selectedIndex >= 0 ? questions[selectedIndex] : undefined;

  const updateQuestion = useCallback((index: number, patch: Partial<Question>) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch } as Question;
      return next;
    });
  }, []);

  const handleAddQuestion = (type: QuestionType) => {
    setQuestions((prev) => {
      const next = [...prev, createDefaultQuestion(type)];
      setSelectedIndex(next.length - 1);
      return next;
    });
  };

  const handleDelete = (index: number) => {
    setQuestions((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        setSelectedIndex(-1);
      } else if (selectedIndex >= next.length) {
        setSelectedIndex(next.length - 1);
      } else if (index < selectedIndex) {
        setSelectedIndex(selectedIndex - 1);
      }
      return next;
    });
  };

  const handleMove = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= questions.length) return;
    setQuestions((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    if (selectedIndex === index) setSelectedIndex(target);
    else if (selectedIndex === target) setSelectedIndex(index);
  };

  const validate = (): string | null => {
    if (questions.length === 0) return "请至少添加一道题目";
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const label = `第 ${i + 1} 题`;
      if (!q.question.trim()) return `${label}：题干不能为空`;
      if (q.type === "radio" || q.type === "checkbox") {
        const opts = q.options ?? [];
        if (opts.length < 2) return `${label}：至少需要 2 个选项`;
        if (opts.some((o) => !o.trim())) return `${label}：存在空选项`;
        if (q.type === "radio") {
          if (!q.answer || !opts.includes(q.answer as string)) {
            return `${label}：请在选项中选择正确答案`;
          }
        } else {
          const ans = Array.isArray(q.answer) ? q.answer : [];
          if (ans.length === 0) return `${label}：请至少勾选一个正确答案`;
          if (ans.some((a) => !opts.includes(a))) return `${label}：答案不在选项中`;
        }
      } else if (q.type === "input") {
        if (!(q.answer as string)?.toString().trim()) {
          return `${label}：请填写正确答案`;
        }
      }
    }
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      globalMessage.instance?.warning(err);
      return;
    }
    setSaving(true);
    try {
      await saveExam({ id: examId, content: JSON.stringify(questions) });
      globalMessage.instance?.success("保存成功");
    } catch {
      // 错误已由全局拦截器统一提示
    } finally {
      setSaving(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div className="edit-exam">
        <div className="edit-exam__header">
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              返回
            </Button>
            <span className="title">{name || "试卷编辑"}</span>
            {isPublished && <Tag color="green">已发布</Tag>}
            <span className="meta">
              共 {questions.length} 题 / 总分 {totalScore}
            </span>
          </Space>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            disabled={isPublished}
            onClick={handleSave}
          >
            保存
          </Button>
        </div>

        {isPublished && (
          <Alert
            type="warning"
            showIcon
            message="试卷已发布，需先取消发布后才能编辑"
            style={{ marginBottom: 12 }}
          />
        )}

        <div className="edit-exam__body">
          <div className="edit-exam__palette">
            <div style={{ color: "#888", fontSize: 12, marginBottom: 4 }}>添加题目</div>
            {(["radio", "checkbox", "input"] as QuestionType[]).map((t) => (
              <Button
                key={t}
                icon={<PlusOutlined />}
                disabled={isPublished}
                onClick={() => handleAddQuestion(t)}
              >
                {TYPE_LABEL[t]}
              </Button>
            ))}
          </div>

          <div className="edit-exam__list">
            {questions.length === 0 ? (
              <div className="edit-exam__empty">暂无题目，从左侧添加</div>
            ) : (
              questions.map((q, index) => (
                <div
                  key={index}
                  className={
                    "edit-exam__item" + (selectedIndex === index ? " edit-exam__item--active" : "")
                  }
                  onClick={() => setSelectedIndex(index)}
                >
                  <div className="item-header">
                    <Space>
                      <Tag color={TYPE_COLOR[q.type]}>{TYPE_LABEL[q.type]}</Tag>
                      <span className="item-title">
                        {index + 1}. {q.question || <i style={{ color: "#bbb" }}>（未填写题干）</i>}
                      </span>
                      <Tag>{q.score} 分</Tag>
                    </Space>
                    <Space onClick={(e) => e.stopPropagation()}>
                      <Button
                        type="text"
                        size="small"
                        icon={<ArrowUpOutlined />}
                        disabled={index === 0 || isPublished}
                        onClick={() => handleMove(index, -1)}
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<ArrowDownOutlined />}
                        disabled={index === questions.length - 1 || isPublished}
                        onClick={() => handleMove(index, 1)}
                      />
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        disabled={isPublished}
                        onClick={() => handleDelete(index)}
                      />
                    </Space>
                  </div>
                  {q.type !== "input" && (q.options?.length ?? 0) > 0 && (
                    <ol className="item-options">
                      {q.options!.map((opt, i) => (
                        <li key={i}>{opt || <i style={{ color: "#bbb" }}>（空）</i>}</li>
                      ))}
                    </ol>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="edit-exam__editor">
            <Tabs
              size="small"
              items={[
                {
                  key: "edit",
                  label: "编辑",
                  children: selected ? (
                    <QuestionEditor
                      key={selectedIndex}
                      question={selected}
                      disabled={isPublished}
                      onChange={(patch) => updateQuestion(selectedIndex, patch)}
                    />
                  ) : (
                    <div className="edit-exam__empty">从中间列表选择一道题目进行编辑</div>
                  ),
                },
                {
                  key: "json-current",
                  label: "当前题 JSON",
                  children: selected ? (
                    <pre className="edit-exam__json">{JSON.stringify(selected, null, 2)}</pre>
                  ) : (
                    <div className="edit-exam__empty">未选中题目</div>
                  ),
                },
                {
                  key: "json-all",
                  label: "全部 JSON",
                  children: (
                    <pre className="edit-exam__json">{JSON.stringify(questions, null, 2)}</pre>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>
    </Spin>
  );
}

interface QuestionEditorProps {
  question: Question;
  disabled?: boolean;
  onChange: (patch: Partial<Question>) => void;
}

function QuestionEditor({ question, disabled, onChange }: QuestionEditorProps) {
  const { type, options = [] } = question;

  const handleOptionChange = (i: number, value: string) => {
    const next = [...options];
    next[i] = value;
    onChange({ options: next });
  };

  const handleOptionAdd = () => {
    onChange({ options: [...options, `选项${options.length + 1}`] });
  };

  const handleOptionRemove = (i: number) => {
    const removed = options[i];
    const next = options.filter((_, idx) => idx !== i);
    if (type === "radio" && question.answer === removed) {
      onChange({ options: next, answer: "" });
    } else if (type === "checkbox") {
      const ans = Array.isArray(question.answer) ? question.answer : [];
      onChange({ options: next, answer: ans.filter((a) => a !== removed) });
    } else {
      onChange({ options: next });
    }
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Card size="small" title="题型">
        <Tag color={TYPE_COLOR[type]}>{TYPE_LABEL[type]}</Tag>
      </Card>

      <Card size="small" title="题干">
        <Input.TextArea
          rows={3}
          value={question.question}
          disabled={disabled}
          onChange={(e) => onChange({ question: e.target.value })}
          placeholder="请输入题干"
        />
      </Card>

      <Card size="small" title="分值">
        <InputNumber
          min={1}
          max={100}
          value={question.score}
          disabled={disabled}
          onChange={(v) => onChange({ score: Number(v) || 0 })}
        />
      </Card>

      {(type === "radio" || type === "checkbox") && (
        <Card
          size="small"
          title="选项"
          extra={
            <Button
              type="link"
              size="small"
              icon={<PlusOutlined />}
              disabled={disabled}
              onClick={handleOptionAdd}
            >
              添加选项
            </Button>
          }
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            {options.map((opt, i) => (
              <Space key={i} style={{ width: "100%" }}>
                <Input
                  value={opt}
                  disabled={disabled}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                  style={{ width: 220 }}
                />
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={disabled || options.length <= 2}
                  onClick={() => handleOptionRemove(i)}
                />
              </Space>
            ))}
          </Space>
        </Card>
      )}

      <Card size="small" title="正确答案">
        {type === "radio" && (
          <Radio.Group
            value={question.answer as string}
            disabled={disabled}
            onChange={(e) => onChange({ answer: e.target.value })}
          >
            <Space direction="vertical">
              {options.map((opt, i) => (
                <Radio key={i} value={opt} disabled={!opt}>
                  {opt || <i style={{ color: "#bbb" }}>（空选项）</i>}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        )}
        {type === "checkbox" && (
          <Checkbox.Group
            value={Array.isArray(question.answer) ? question.answer : []}
            disabled={disabled}
            onChange={(vals) => onChange({ answer: vals as string[] })}
          >
            <Space direction="vertical">
              {options.map((opt, i) => (
                <Checkbox key={i} value={opt} disabled={!opt}>
                  {opt || <i style={{ color: "#bbb" }}>（空选项）</i>}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        )}
        {type === "input" && (
          <Input
            value={question.answer as string}
            disabled={disabled}
            onChange={(e) => onChange({ answer: e.target.value })}
            placeholder="请输入参考答案"
          />
        )}
      </Card>

      <Card size="small" title="答案解析">
        <Input.TextArea
          rows={3}
          value={question.answerAnalyse}
          disabled={disabled}
          onChange={(e) => onChange({ answerAnalyse: e.target.value })}
          placeholder="选填"
        />
      </Card>
    </Space>
  );
}

export default EditExam;
