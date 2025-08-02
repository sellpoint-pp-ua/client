import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import FilterSidebar from '@/components/features/FilterSidebar'
import ClothingProductCard from '@/components/features/ClothingProductCard'

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

// This would typically come from an API or database
const categoryData = {
  'womens-clothing': {
    title: 'Жіночий одяг',
    products: [
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
  },
  'mens-clothing': {
    title: 'Чоловічий одяг',
    products: [
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
      }
    ]
  },
  'womens-shoes': {
    title: 'Жіноче взуття',
    products: [
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
      }
    ]
  },
  'mens-shoes': {
    title: 'Чоловіче взуття',
    products: [
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
      }
    ]
  },
  'sportswear': {
    title: 'Спортивний одяг',
    products: [
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
      }
    ]
  }
}

interface Props {
  params: Promise<{
    category: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug } = await params
  const category = categoryData[categorySlug as keyof typeof categoryData]
  if (!category) {
    return {
      title: 'Категорію не знайдено | Sell Point'
    }
  }
  return {
    title: `${category.title} | Sell Point`,
    description: `Широкий вибір товарів категорії ${category.title.toLowerCase()}`
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category: categorySlug } = await params
  const category = categoryData[categorySlug as keyof typeof categoryData]
  
  if (!category) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="mx-auto max-w-[1500px] px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {category.title}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {category.products.length} товарів
          </p>
        </div>

        <div className="flex gap-6">
          <aside className="w-64 flex-shrink-0">
            <FilterSidebar 
              filterOptions={filterOptions}
              sortOptions={sortOptions}
            />
          </aside>
          
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Показано {category.products.length} з {category.products.length} товарів
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.products.map((product, index) => (
                <ClothingProductCard
                  key={index}
                  {...product}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 