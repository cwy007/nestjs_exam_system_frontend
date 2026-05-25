export interface LoginUserDto {
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
}

export interface UserInfo {
  /** 用户ID */
  id: number;
  /** 用户名 */
  username: string;
  /** 昵称 */
  nickName: string;
  /** 邮箱 */
  email: string;
  /** 头像 */
  headPic: string;
  /** 手机号 */
  phoneNumber: string;
  /** 是否被冻结 */
  isFrozen: boolean;
  /** 是否是管理员 */
  isAdmin: boolean;
  /** 创建时间 */
  createTime: number;
  /** 角色列表 */
  roles: string[];
  /** 权限列表 */
  permissions: string[];
}

export interface LoginUserVo {
  /** 用户信息 */
  userInfo: UserInfo;
  /** 鉴权token */
  accessToken: string;
  /** 刷新token */
  refreshToken: string;
}
