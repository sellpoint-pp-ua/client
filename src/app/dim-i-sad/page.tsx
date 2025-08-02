import Header from '@/components/layout/Header'
import CategoryCard from '@/components/features/CategoryCard'
import ElectronicsProductCard from '@/components/features/ElectronicsProductCard'
import FilterSidebar from '@/components/features/FilterSidebar'
import { ArrowDownAZ } from 'lucide-react'
import { Metadata } from 'next'

type Category = {
  title: string;
  count: number;
  href: string;
  iconType: string;
}

const categories: Category[] = [

]

const featuredProducts = [
  {
    id: '1',
    title: 'Крісло-мішок 130х90 см',
    price: 1499,
    oldPrice: 1899,
    imageUrl: 'https://picsum.photos/id/31/400/400',
    rating: 4.7,
    reviewCount: 123,
    isAvailable: true,
    isReadyToShip: true,
  },
  {
    id: '2',
    title: 'Садовий набір інструментів Fiskars',
    price: 2499,
    imageUrl: 'https://picsum.photos/id/32/400/400',
    rating: 4.9,
    reviewCount: 89,
    isAvailable: true,
    isReadyToShip: true,
  },
  {
    id: '3',
    title: 'LED світильник настінний',
    price: 899,
    oldPrice: 1199,
    imageUrl: 'https://picsum.photos/id/33/400/400',
    rating: 4.6,
    reviewCount: 167,
    isAvailable: true,
    isReadyToShip: false,
  },
  {
    id: '4',
    title: 'Комплект постільної білизни',
    price: 1299,
    imageUrl: 'https://picsum.photos/id/34/400/400',
    rating: 4.8,
    reviewCount: 234,
    isAvailable: true,
    isReadyToShip: true,
  },
  {
    id: '5',
    title: 'Декоративні подушки 2 шт',
    price: 799,
    imageUrl: 'https://picsum.photos/id/35/400/400',
    rating: 4.7,
    reviewCount: 156,
    isAvailable: true,
    isReadyToShip: true,
  },
]

const filterOptions = [
  {
    title: 'Категорія',
    options: ['Меблі', 'Садовий інвентар', 'Освітлення', 'Текстиль', 'Декор', 'Зберігання']
  },
  {
    title: 'Ціновий діапазон',
    options: ['До 1000 ₴', '1000-3000 ₴', '3000-7000 ₴', 'Більше 7000 ₴']
  },
  {
    title: 'Матеріал',
    options: ['Дерево', 'Метал', 'Пластик', 'Скло', 'Текстиль']
  },
  {
    title: 'Колір',
    options: ['Білий', 'Чорний', 'Сірий', 'Коричневий', 'Бежевий']
  },
  {
    title: 'Наявність',
    options: ['В наявності', 'Під замовлення']
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
  title: 'Дім і сад | Sell Point',
  description: 'Широкий вибір товарів для дому та саду',
}

export default function HomeAndGardenPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="mx-auto max-w-[1500px] px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Дім і сад
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Знайдіть найкращі товари для вашого дому та саду
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