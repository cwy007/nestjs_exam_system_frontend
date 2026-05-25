export interface UpdateUserPasswordDto {
  /** 新密码 */
  password: string;
  /** 邮箱地址 */
  email: string;
  /** 验证码 */
  captcha: string;
}
