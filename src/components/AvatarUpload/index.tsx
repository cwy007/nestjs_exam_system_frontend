import { useState, useEffect } from "react";
import { Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import { uploadAvatar } from "../../pages/Profile/services";
import { formatImgUrl } from "@/common/utils";

interface AvatarUploadProps {
  /** 当前头像路径（相对路径，如 uploads/xxx.gif），由 Form 注入 */
  value?: string;
  /** 上传成功后将新路径回传给 Form */
  onChange?: (value: string) => void;
}

function AvatarUpload({ value, onChange }: AvatarUploadProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  // 当外部 value 变化时（如初始化加载）同步 fileList
  useEffect(() => {
    if (value) {
      setFileList([{ uid: "-1", name: "avatar", status: "done", url: formatImgUrl(value) }]);
    } else {
      setFileList([]);
    }
  }, [value]);

  return (
    <Upload
      listType="picture-card"
      fileList={fileList}
      maxCount={1}
      accept="image/*"
      showUploadList={{ showPreviewIcon: false }}
      customRequest={async ({ file, onSuccess, onError }) => {
        setUploading(true);
        try {
          const res = await uploadAvatar(file as File);
          if (res.code === 200) {
            const url = formatImgUrl(res.data);
            setFileList([{ uid: "-1", name: (file as File).name, status: "done", url }]);
            onChange?.(res.data);
            onSuccess?.(res);
          } else {
            message.error(res.message || "上传失败");
            onError?.(new Error(res.message));
          }
        } catch {
          onError?.(new Error("上传失败"));
        } finally {
          setUploading(false);
        }
      }}
      onChange={({ fileList: fl }) => setFileList(fl)}
    >
      {fileList.length === 0 && (
        <div>
          <UploadOutlined />
          <div style={{ marginTop: 8 }}>{uploading ? "上传中…" : "上传头像"}</div>
        </div>
      )}
    </Upload>
  );
}

export default AvatarUpload;
