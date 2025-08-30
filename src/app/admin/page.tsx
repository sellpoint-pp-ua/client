import { Users, Package, ShoppingBag, Search } from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Адмін панель
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Categories Management */}
            <Link href="/admin/categories/" className="group">
              <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Категорії</h3>
                    <p className="text-sm text-gray-600">Управління категоріями товарів</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Products Management */}
            <Link href="/admin/products/" className="group">
              <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Товари</h3>
                    <p className="text-sm text-gray-600">Управління товарами</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <ShoppingBag className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Search */}
            <Link href="/admin/search/" className="group">
              <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Пошук</h3>
                    <p className="text-sm text-gray-600">Швидкий пошук категорій та товарів</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                    <Search className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Users Management */}
            <Link href="/admin/users/" className="group">
              <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Користувачі</h3>
                    <p className="text-sm text-gray-600">Управління користувачами</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


