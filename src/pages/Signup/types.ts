export interface RegisterUserDto {
  /** 用户名 */
  username: string;
  /** 昵称（可选） */
  nickName?: string;
  /** 密码（最短6位） */
  password: string;
  /** 邮箱 */
  email: string;
  /** 验证码 */
  captcha: string;
}
