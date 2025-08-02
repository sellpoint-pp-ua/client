import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import CategoryCard from '@/components/features/CategoryCard'
import FilterSidebar from '@/components/features/FilterSidebar'
import ClothingProductCard from '@/components/features/ClothingProductCard'

const categories = [
  {
    title: "Жіночий одяг",
    href: "/odyag-ta-vzuttya/womens-clothing",
    count: 2345,
    iconType: "dress"
  },
  {
    title: "Чоловічий одяг",
    href: "/odyag-ta-vzuttya/mens-clothing",
    count: 1876,
    iconType: "shirt"
  },
  {
    title: "Жіноче взуття",
    href: "/odyag-ta-vzuttya/womens-shoes",
    count: 1543,
    iconType: "boot"
  },
  {
    title: "Чоловіче взуття",
    href: "/odyag-ta-vzuttya/mens-shoes",
    count: 1234,
    iconType: "footprints"
  },
  {
    title: "Спортивний одяг",
    href: "/odyag-ta-vzuttya/sportswear",
    count: 987,
    iconType: "dumbbell"
  },
  {
    title: "Аксесуари",
    href: "/odyag-ta-vzuttya/accessories",
    count: 1654,
    iconType: "watch"
  },
  {
    title: "Дитячий одяг",
    href: "/odyag-ta-vzuttya/kids-clothing",
    count: 1432,
    iconType: "baby"
  },
  {
    title: "Нижня білизна",
    href: "/odyag-ta-vzuttya/underwear",
    count: 876,
    iconType: "heart"
  },
  {
    title: "Верхній одяг",
    href: "/odyag-ta-vzuttya/outerwear",
    count: 654,
    iconType: "jacket"
  },
  {
    title: "Домашній одяг",
    href: "/odyag-ta-vzuttya/home-wear",
    count: 543,
    iconType: "home"
  }
]

const filterOptions = [
  {
    title: 'Розмір',
    options: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  },
  {
    title: 'Колір',
    options: ['Чорний', 'Білий', 'Синій', 'Червоний', 'Зелений', 'Сірий']
  },
  {
    title: 'Матеріал',
    options: ['Бавовна', 'Шкіра', 'Деним', 'Поліестер', 'Льон', 'Шовк']
  },
  {
    title: 'Сезон',
    options: ['Весна/Літо', 'Осінь/Зима', 'Всі сезони']
  },
  {
    title: 'Ціновий діапазон',
    options: ['До 500 ₴', '500-1000 ₴', '1000-2000 ₴', 'Більше 2000 ₴']
  }
]

const sortOptions = [
  { label: 'За популярністю', value: 'popularity' },
  { label: 'Від дешевих до дорогих', value: 'price_asc' },
  { label: 'Від дорогих до дешевих', value: 'price_desc' },
  { label: 'За рейтингом', value: 'rating' },
  { label: 'Новинки', value: 'newest' }
]

const featuredProducts = [
  {
    title: 'Чоловіча куртка зимова',
    brand: 'North Face',
    price: 4999,
    oldPrice: 5999,
    image: 'https://picsum.photos/id/1015/400/400',
    rating: 4.8,
    reviewCount: 156,
    size: 'M',
    color: 'Чорний',
    material: 'Поліестер',
    isReadyToShip: true,
    href: '/odyag-ta-vzuttya/mens-clothing/1'
  },
  {
    title: 'Жіноча сукня вечірня',
    brand: 'Zara',
    price: 2499,
    image: 'https://picsum.photos/id/1016/400/400',
    rating: 4.6,
    reviewCount: 89,
    size: 'S',
    color: 'Червоний',
    material: 'Шовк',
    isReadyToShip: true,
    href: '/odyag-ta-vzuttya/womens-clothing/2'
  },
  {
    title: 'Чоловічі кросівки спортивні',
    brand: 'Nike',
    price: 3299,
    oldPrice: 3999,
    image: 'https://picsum.photos/id/1017/400/400',
    rating: 4.9,
    reviewCount: 234,
    size: '42',
    color: 'Білий',
    material: 'Текстиль',
    isReadyToShip: false,
    href: '/odyag-ta-vzuttya/mens-shoes/3'
  },
  {
    title: 'Жіночі черевики осінні',
    brand: 'Timberland',
    price: 4599,
    image: 'https://picsum.photos/id/1018/400/400',
    rating: 4.7,
    reviewCount: 167,
    size: '38',
    color: 'Коричневий',
    material: 'Шкіра',
    isReadyToShip: true,
    href: '/odyag-ta-vzuttya/womens-shoes/4'
  },
  {
    title: 'Спортивний костюм унісекс',
    brand: 'Adidas',
    price: 2999,
    oldPrice: 3499,
    image: 'https://picsum.photos/id/1019/400/400',
    rating: 4.5,
    reviewCount: 98,
    size: 'L',
    color: 'Синій',
    material: 'Бавовна',
    isReadyToShip: true,
    href: '/odyag-ta-vzuttya/sportswear/5'
  },
  {
    title: 'Жіночі джинси класичні',
    brand: 'Levis',
    price: 1999,
    image: 'https://picsum.photos/id/1020/400/400',
    rating: 4.6,
    reviewCount: 145,
    size: 'M',
    color: 'Синій',
    material: 'Деним',
    isReadyToShip: true,
    href: '/odyag-ta-vzuttya/womens-clothing/6'
  }
]

export const metadata: Metadata = {
  title: 'Одяг та взуття | Sell Point',
  description: 'Широкий вибір одягу та взуття для всієї родини',
}

export default function ClothingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="mx-auto max-w-[1500px] px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Одяг та взуття
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Знайдіть свій ідеальний стиль
          </p>
        </div>

        {/* Categories Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Категорії
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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

        {/* Featured Products Section */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Популярні товари
            </h2>
          </div>

          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <FilterSidebar 
                filterOptions={filterOptions}
                sortOptions={sortOptions}
              />
            </aside>
            
            <div className="flex-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featuredProducts.map((product, index) => (
                  <ClothingProductCard 
                    key={index}
                    {...product}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
} 