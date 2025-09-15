# Процес відновлення пароля

## Огляд

Система відновлення пароля дозволяє користувачам скинути свій пароль через email підтвердження. Процес складається з трьох етапів:

1. **Запит на відновлення** - користувач вводить email/логін
2. **Підтвердження коду** - користувач вводить код з email
3. **Встановлення нового пароля** - користувач встановлює новий пароль

## Сторінки

### 1. `/auth/forgot-password`
- **Файл**: `client/src/app/auth/forgot-password/page.tsx`
- **Функція**: Користувач вводить email або логін
- **API**: `POST /api/auth/send-password-reset-code`
- **Серверний ендпоінт**: `POST https://api.sellpoint.pp.ua/api/Auth/send-password-reset-code`

### 2. `/auth/reset-password`
- **Файл**: `client/src/app/auth/reset-password/page.tsx`
- **Функція**: Користувач вводить код підтвердження з email
- **Параметри URL**: `?token={resetToken}`
- **API**: `GET /api/auth/verify-password-reset-code`
- **Серверний ендпоінт**: `GET https://api.sellpoint.pp.ua/api/Auth/verify-password-reset-code`

### 3. `/auth/new-password`
- **Файл**: `client/src/app/auth/new-password/page.tsx`
- **Функція**: Користувач встановлює новий пароль
- **Параметри URL**: `?token={resetToken}&code={code}`
- **API**: `POST /api/auth/reset-password`
- **Серверний ендпоінт**: `POST https://api.sellpoint.pp.ua/api/Auth/reset-password`

## API Роути

### 1. `POST /api/auth/send-password-reset-code`
- **Файл**: `client/src/app/api/auth/send-password-reset-code/route.ts`
- **Body**: `{ login: string }`
- **Відповідь**: `{ success: boolean, message?: string }`

### 2. `GET /api/auth/verify-password-reset-code`
- **Файл**: `client/src/app/api/auth/verify-password-reset-code/route.ts`
- **Query параметри**: `resetToken`, `code`
- **Відповідь**: `{ success: boolean, message?: string }`

### 3. `POST /api/auth/reset-password`
- **Файл**: `client/src/app/api/auth/reset-password/route.ts`
- **Query параметри**: `password`, `accessCode`
- **Відповідь**: `{ success: boolean, message?: string }`

## Хуки та сервіси

### `usePasswordReset` хук
- **Файл**: `client/src/hooks/usePasswordReset.ts`
- **Функції**:
  - `sendResetCode(login)` - надсилає код відновлення
  - `verifyResetCode({ resetToken, code })` - підтверджує код
  - `resetPassword({ password, accessCode })` - встановлює новий пароль

### `AuthService` розширення
- **Файл**: `client/src/services/authService.ts`
- **Нові методи**:
  - `sendPasswordResetCode(request)`
  - `verifyPasswordResetCode(request)`
  - `resetPassword(request)`

## Типи

### Нові типи в `client/src/types/auth.ts`:
```typescript
interface ForgotPasswordRequest {
  login: string;
}

interface VerifyResetCodeRequest {
  resetToken: string;
  code: string;
}

interface ResetPasswordRequest {
  password: string;
  accessCode: string;
}

interface PasswordResetResponse {
  success: boolean;
  message?: string;
  resetToken?: string;
}
```

## Потік виконання

1. **Користувач натискає "Забули пароль?"** на сторінці логіну
2. **Перехід на `/auth/forgot-password`** - введення email/логіну
3. **Надсилання запиту** - `POST /api/auth/send-password-reset-code`
4. **Сервер повертає `resetToken`** у відповіді
5. **Автоматичне перенаправлення** на `/auth/reset-password?token={resetToken}`
6. **Отримання email** з кодом підтвердження
7. **Введення коду** на сторінці `/auth/reset-password`
8. **Підтвердження коду** - `GET /api/auth/verify-password-reset-code`
9. **Сервер повертає `accessCode`** у відповіді
10. **Автоматичне перенаправлення** на `/auth/new-password?token={resetToken}&accessCode={accessCode}`
11. **Встановлення нового пароля** - `POST /api/auth/reset-password`
12. **Перенаправлення на сторінку логіну** - успішне завершення

## Виправлення помилок

### Проблема 400 Bad Request
- **Причина**: Неправильна обробка відповідей сервера
- **Рішення**: Додано детальне логування та правильну обробку помилок

### Проблема з resetToken та accessCode
- **Причина**: Неправильна передача токенів між сторінками
- **Рішення**: 
  - `resetToken` зберігається в стані хука та передається через URL
  - `accessCode` зберігається в localStorage та передається через URL
  - Додана підтримка обох параметрів у всіх сторінках

### Проблема з API роутами
- **Причина**: Неправильне налаштування проксі до сервера
- **Рішення**: API роути правильно проксують запити до `https://api.sellpoint.pp.ua`

## Валідація

- **Email/логін**: обов'язкове поле, базова валідація email
- **Код підтвердження**: обов'язкове поле, мінімум 4 символи
- **Новий пароль**: обов'язкове поле, мінімум 6 символів
- **Підтвердження пароля**: повинно співпадати з новим паролем

## Обробка помилок

- Валідація форм на клієнті
- Переклад помилок сервера українською мовою
- Візуальні індикатори помилок та успіху
- Автоматичне очищення помилок при введенні

## Безпека

- Коди підтвердження мають обмежений час життя
- Токени відновлення унікальні та одноразові
- Валідація на сервері та клієнті
- HTTPS для всіх API запитів
