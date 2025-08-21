# Налаштування авторизації

## Опис

Цей проект використовує систему авторизації з бекендом на C# .NET та фронтендом на Next.js.

## Структура файлів

### Типи (Types)
- `src/types/auth.ts` - типи для авторизації

### Сервіси (Services)
- `src/services/authService.ts` - сервіс для роботи з API авторизації

### Хуки (Hooks)
- `src/hooks/useAuth.ts` - хук для управління станом авторизації

### Компоненти (Components)
- `src/components/auth/ProtectedRoute.tsx` - компонент для захисту маршрутів
- `src/components/shared/LoadingSpinner.tsx` - компонент завантаження

## Налаштування

### 1. Змінні середовища

Створіть файл `.env.local` в папці `client` з наступним вмістом:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 2. Запуск бекенду

Переконайтеся, що бекенд запущений на порту 5000:

```bash
cd server
dotnet run
```

### 3. Запуск фронтенду

```bash
cd client
npm run dev
```

## API Endpoints

### Реєстрація
- **URL**: `POST /api/auth/register`
- **Body**: FormData
  - `fullName`: string
  - `email`: string
  - `password`: string

### Вхід
- **URL**: `POST /api/auth/login`
- **Body**: FormData
  - `login`: string (email або username)
  - `password`: string

### Перевірка авторизації
- **URL**: `GET /api/auth/check-login`
- **Headers**: `Authorization: Bearer {token}`

## Використання

### Захист маршрутів

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <div>Цей контент доступний тільки авторизованим користувачам</div>
    </ProtectedRoute>
  );
}
```

### Використання хука useAuth

```tsx
import { useAuth } from '@/hooks/useAuth';

export default function MyComponent() {
  const { login, register, logout, isAuthenticated, isLoading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ login: 'user@example.com', password: 'password' });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <button onClick={logout}>Вийти</button>
      ) : (
        <button onClick={handleLogin} disabled={isLoading}>
          {isLoading ? 'Завантаження...' : 'Увійти'}
        </button>
      )}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

## Особливості

1. **FormData**: API очікує дані у форматі FormData, а не JSON
2. **JWT Token**: Токен зберігається в localStorage
3. **Автоматичний редирект**: Після успішної авторизації користувач перенаправляється на головну сторінку
4. **Валідація**: Форми мають вбудовану валідацію на клієнті
5. **Обробка помилок**: Помилки API відображаються користувачу

## Безпека

- Токени зберігаються в localStorage (для продакшену рекомендується використовувати httpOnly cookies)
- Паролі не зберігаються на клієнті
- Використовується HTTPS для комунікації з API
- Валідація на клієнті та сервері 