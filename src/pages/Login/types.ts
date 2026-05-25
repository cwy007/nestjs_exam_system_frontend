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
  /** 邮箱 */
  email: string;
  /** 创建时间 */
  createTime: number;
}

export interface LoginUserVo {
  /** 用户信息 */
  user: UserInfo;
  /** 鉴权token */
  token: string;
}
