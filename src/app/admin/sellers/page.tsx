'use client'

import { UserIcon } from '@heroicons/react/24/outline'

export default function SellersPage() {
  const testConnection = async () => {
    try {
      console.log('Testing connection to server API...')
      // Тестуємо з'єднання з серверним API для перевірки доступності
      const response = await fetch('/api/test-connection')
      const result = await response.json()
      console.log('Connection test result:', result)
      
      if (result.success) {
        alert(`✅ З'єднання з сервером успішне!\nСтатус: ${result.status}\nПовідомлення: ${result.message}`)
      } else {
        alert(`❌ Помилка з'єднання з сервером!\nСтатус: ${result.status}\nПовідомлення: ${result.message}`)
      }
    } catch (err) {
      console.error('Error testing connection:', err)
      alert('❌ Помилка при тестуванні з\'єднання')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Продавці</h1>
          <p className="text-gray-600">Управління продавцями системи</p>
          
          {/* Кнопка тестування з'єднання */}
          <div className="mt-4">
            <button
              onClick={testConnection}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              🧪 Тестувати з'єднання з сервером
            </button>
          </div>
        </div>

        {/* Повідомлення про майбутню логіку */}
        <div className="bg-white rounded-lg shadow border p-12">
          <div className="text-center">
            <UserIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Логіка для продавців буде додана після завершення бекенду
            </h3>
            <p className="text-gray-500">
              Наразі ця сторінка знаходиться в розробці. 
              <br />
              Після завершення налаштування серверного API тут з'явиться повна функціональність для управління продавцями.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


