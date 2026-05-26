import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input, Modal, Popconfirm, Space, Switch, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { addExam, deleteExam, getExamList, publishExam, unpublishExam } from "./services";
import type { Exam } from "./types";
import globalMessage from "../../common/utils/globalMessage";
import "./index.scss";
import dayjs from "dayjs";
import { compact } from "lodash";

function ExamList() {
  const navigate = useNavigate();

  const [list, setList] = useState<Exam[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [bin, setBin] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<{ name: string }>();

  const fetchList = useCallback(async (binFlag: boolean, pageNum: number, size: number) => {
    setLoading(true);
    try {
      const res = await getExamList({
        bin: binFlag || undefined,
        page: pageNum,
        pageSize: size,
      });
      setList(res.data?.list ?? []);
      setTotal(res.data?.total ?? 0);
    } catch {
      // 错误已由全局拦截器统一提示
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList(bin, page, pageSize);
  }, [bin, page, pageSize, fetchList]);

  // 切换回收站时回到第一页
  const handleBinChange = (checked: boolean) => {
    setBin(checked);
    setPage(1);
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await addExam({ name: values.name });
      globalMessage.instance?.success("新建试卷成功");
      setModalOpen(false);
      form.resetFields();
      // 新建后回到第一页以便看到新数据
      if (page === 1) {
        fetchList(bin, 1, pageSize);
      } else {
        setPage(1);
      }
    } catch (err) {
      if ((err as { errorFields?: unknown }).errorFields) return;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteExam(id);
      globalMessage.instance?.success("删除成功");
      // 删除最后一页的最后一条时回退到上一页
      const isLastItemOnPage = list.length === 1 && page > 1;
      if (isLastItemOnPage) {
        setPage(page - 1);
      } else {
        fetchList(bin, page, pageSize);
      }
    } catch {
      // 错误已由全局拦截器统一提示
    }
  };

  const handleTogglePublish = async (record: Exam) => {
    try {
      if (record.isPublished) {
        await unpublishExam(record.id);
        globalMessage.instance?.success("已取消发布");
      } else {
        await publishExam(record.id);
        globalMessage.instance?.success("发布成功");
      }
      fetchList(bin, page, pageSize);
    } catch {
      // 错误已由全局拦截器统一提示
    }
  };

  const columns: ColumnsType<Exam> = compact([
    { title: "ID", dataIndex: "id", width: 80 },
    { title: "试卷名称", dataIndex: "name" },
    {
      title: "发布状态",
      dataIndex: "isPublished",
      width: 120,
      render: (v: boolean) => (v ? <Tag color="green">已发布</Tag> : <Tag>未发布</Tag>),
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      width: 200,
      render: (v: string) => (v ? dayjs(v).format("YYYY-MM-DD HH:mm:ss") : "-"),
    },
    {
      title: "更新时间",
      dataIndex: "updateTime",
      width: 200,
      render: (v: string) => (v ? dayjs(v).format("YYYY-MM-DD HH:mm:ss") : "-"),
    },
    !bin && {
      title: "操作",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space>
          {!record.isPublished && (
            <Button type="link" size="small" onClick={() => navigate(`/edit-exam/${record.id}`)}>
              编辑
            </Button>
          )}
          <Popconfirm
            title={record.isPublished ? "确认取消发布？" : "确认发布该试卷？"}
            okText={record.isPublished ? "取消发布" : "发布"}
            okButtonProps={{ danger: record.isPublished }}
            cancelText="取消"
            onConfirm={() => handleTogglePublish(record)}
          >
            <Button type="link" size="small">
              {record.isPublished ? "取消发布" : "发布"}
            </Button>
          </Popconfirm>
          {!record.isPublished && (
            <Popconfirm
              title="确认删除该试卷？"
              description="删除后可在回收站查看"
              okText="删除"
              okButtonProps={{ danger: true }}
              cancelText="取消"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
          {record.isPublished && (
            <Button type="link" size="small" onClick={() => navigate(`/test-detail/${record.id}`)}>
              答题
            </Button>
          )}
        </Space>
      ),
    },
  ]);

  return (
    <div className="exam-list">
      <div className="exam-list__toolbar">
        <Space>
          <span>回收站</span>
          <Switch checked={bin} onChange={handleBinChange} />
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => fetchList(bin, page, pageSize)}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            新建试卷
          </Button>
        </Space>
      </div>

      <Table<Exam>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={list}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (nextPage, nextSize) => {
            setPage(nextPage);
            setPageSize(nextSize);
          },
        }}
      />

      <Modal
        title="新建试卷"
        open={modalOpen}
        confirmLoading={submitting}
        onOk={handleAdd}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            label="试卷名称"
            name="name"
            rules={[{ required: true, message: "请输入试卷名称" }]}
          >
            <Input placeholder="请输入试卷名称" maxLength={50} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ExamList;
