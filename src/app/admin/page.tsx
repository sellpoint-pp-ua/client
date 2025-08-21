import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <div className="p-6 rounded-lg bg-white shadow border">
      <h1 className="text-2xl font-semibold mb-4">Адмін панель</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link className="rounded-lg bg-white p-4 shadow border hover:shadow-md" href="/admin/categories">
          <div className="text-lg font-medium">Категорії</div>
          <div className="text-sm text-gray-500">Перегляд та редагування</div>
        </Link>
        <Link className="rounded-lg bg-white p-4 shadow border hover:shadow-md" href="/admin/products">
          <div className="text-lg font-medium">Продукти</div>
          <div className="text-sm text-gray-500">Лише перегляд</div>
        </Link>
        <Link className="rounded-lg bg-white p-4 shadow border hover:shadow-md" href="/admin/users">
          <div className="text-lg font-medium">Користувачі</div>
          <div className="text-sm text-gray-500">Керування користувачами</div>
        </Link>
        <Link className="rounded-lg bg-white p-4 shadow border hover:shadow-md" href="/admin/sellers">
          <div className="text-lg font-medium">Продавці</div>
          <div className="text-sm text-gray-500">Перегляд продавців</div>
        </Link>
      </div>
    </div>
  )
}


