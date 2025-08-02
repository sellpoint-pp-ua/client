import Header from '@/components/layout/Header'
import CategoryCard from '@/components/features/CategoryCard'
import ElectronicsProductCard from '@/components/features/ElectronicsProductCard'
import FilterSidebar from '@/components/features/FilterSidebar'
import { ArrowDownAZ } from 'lucide-react'
import { Metadata } from 'next'

const categories = [
  {
    title: "Смартфони та планшети",
    href: "/tehnika-ta-elektronika/smartphones-tablets",
    count: 2345,
    iconType: "smartphone"
  },
  {
    title: "Ноутбуки та комп'ютери",
    href: "/tehnika-ta-elektronika/laptops-computers",
    count: 1876,
    iconType: "laptop"
  },
  {
    title: "Телевізори та аудіо",
    href: "/tehnika-ta-elektronika/tv-audio",
    count: 1234,
    iconType: "tv"
  },
  {
    title: "Фото та відео",
    href: "/tehnika-ta-elektronika/photo-video",
    count: 876,
    iconType: "camera"
  },
  {
    title: "Ігрові консолі",
    href: "/tehnika-ta-elektronika/gaming",
    count: 543,
    iconType: "gamepad"
  },
  {
    title: "Побутова техніка",
    href: "/tehnika-ta-elektronika/appliances",
    count: 1654,
    iconType: "plug"
  }
]

const featuredProducts = [
  {
    id: '1',
    title: 'Apple MacBook Air 13" M1 8/256GB Space Gray',
    price: 39999,
    oldPrice: 42999,
    imageUrl: 'https://picsum.photos/id/1/400/400',
    rating: 4.8,
    reviewCount: 245,
    isAvailable: true,
    isReadyToShip: true,
  },
  {
    id: '2',
    title: 'Samsung Galaxy S23 Ultra 12/512GB Black',
    price: 54999,
    imageUrl: 'https://picsum.photos/id/2/400/400',
    rating: 4.9,
    reviewCount: 178,
    isAvailable: true,
    isReadyToShip: true,
  },
  {
    id: '3',
    title: 'Sony WH-1000XM4 Wireless Noise Cancelling Headphones',
    price: 9999,
    oldPrice: 12999,
    imageUrl: 'https://picsum.photos/id/3/400/400',
    rating: 4.7,
    reviewCount: 342,
    isAvailable: true,
    isReadyToShip: false,
  },
  {
    id: '4',
    title: 'LG OLED65C1 65" 4K Smart TV',
    price: 69999,
    imageUrl: 'https://picsum.photos/id/4/400/400',
    rating: 4.9,
    reviewCount: 89,
    isAvailable: false,
    isReadyToShip: false,
  },
  {
    id: '5',
    title: 'PlayStation 5 Digital Edition',
    price: 19999,
    imageUrl: 'https://picsum.photos/id/5/400/400',
    rating: 4.8,
    reviewCount: 567,
    isAvailable: true,
    isReadyToShip: true,
  },
]

const filterOptions = [
  {
    title: 'Бренд',
    options: ['Apple', 'Samsung', 'Xiaomi', 'Lenovo', 'HP', 'Asus', 'Acer']
  },
  {
    title: 'Ціновий діапазон',
    options: ['До 5000 ₴', '5000-15000 ₴', '15000-30000 ₴', 'Більше 30000 ₴']
  },
  {
    title: 'Наявність',
    options: ['В наявності', 'Під замовлення']
  },
  {
    title: 'Стан',
    options: ['Новий', 'Б/в', 'Реставрований']
  },
  {
    title: 'Гарантія',
    options: ['12 місяців', '24 місяці', '36 місяців']
  }
]

const sortOptions = [
  { label: 'За популярністю', value: 'popularity' },
  { label: 'Від дешевих до дорогих', value: 'price_asc' },
  { label: 'Від дорогих до дешевих', value: 'price_desc' },
  { label: 'За рейтингом', value: 'rating' },
  { label: 'Новинки', value: 'newest' }
]

export const metadata: Metadata = {
  title: 'Техніка та електроніка | Sell Point',
  description: 'Широкий вибір техніки та електроніки',
}

export default function ElectronicsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="mx-auto max-w-[1500px] px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Техніка та електроніка
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Знайдіть найкращі пропозиції техніки та електроніки
          </p>
        </div>

        {/* Categories Grid */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Категорії
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
            {categories.map((category) => (
              <CategoryCard
                key={category.href}
                title={category.title}
                count={category.count}
                href={category.href}
                iconType={category.iconType}
              />
            ))}
          </div>
        </section>

        {/* Products Section */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Популярні товари
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Сортувати:</span>
              <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <ArrowDownAZ className="h-4 w-4" />
                За популярністю
              </button>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="w-64 flex-shrink-0">
              <FilterSidebar 
                filterOptions={filterOptions}
                sortOptions={sortOptions}
              />
            </div>
            
            <div className="flex-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {featuredProducts.map((product) => (
                  <ElectronicsProductCard key={product.id} {...product} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
} 