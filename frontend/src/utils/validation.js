export const USERNAME_REGEX = /^[\w.@+-]{3,}$/
export const EMAIL_REGEX    = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}(?:\.[A-Za-z]{2,})?$/
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/

export const defaultValidators = {
  username: v =>
    USERNAME_REGEX.test(v)
      ? ''
      : 'Username must be at least 3 characters and may include letters, numbers, and @ . + - _',
  email: v =>
    EMAIL_REGEX.test(v)
      ? ''
      : 'Enter a valid email address.',
  password: v =>
    PASSWORD_REGEX.test(v)
      ? ''
      : 'Password must be at least 8 chars, include a letter, number & special char',
  confirmPassword: (v, password) =>
    v === password
      ? ''
      : 'Passwords do not match.',
}
