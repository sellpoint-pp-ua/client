import Header from '@/components/layout/Header'
import FilterSidebar from '@/components/features/FilterSidebar'
import ElectronicsProductCard from '@/components/features/ElectronicsProductCard'
import { ArrowDownAZ } from 'lucide-react'
import { notFound } from 'next/navigation'

// This would typically come from an API or database
const categoryData = {
  'laptops': {
    title: 'Ноутбуки',
    products: [
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
        id: '6',
        title: 'Lenovo IdeaPad 3 15.6" i5/8/512GB',
        price: 24999,
        imageUrl: 'https://picsum.photos/id/6/400/400',
        rating: 4.6,
        reviewCount: 123,
        isAvailable: true,
        isReadyToShip: true,
      },
    ],
  },
  'smartphones': {
    title: 'Смартфони',
    products: [
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
        id: '7',
        title: 'iPhone 15 Pro Max 256GB Natural Titanium',
        price: 64999,
        imageUrl: 'https://picsum.photos/id/7/400/400',
        rating: 5.0,
        reviewCount: 89,
        isAvailable: true,
        isReadyToShip: false,
      },
    ],
  },
  'headphones': {
    title: 'Навушники',
    products: [
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
    ],
  },
  // Add other categories as needed
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params
  const category = categoryData[categorySlug as keyof typeof categoryData]
  
  if (!category) {
    notFound()
  }

  const filterOptions = [
    {
      title: 'Бренд',
      options: ['Apple', 'Samsung', 'Sony', 'Lenovo', 'Asus', 'Dell']
    },
    {
      title: 'Ціновий діапазон',
      options: ['До 10000 ₴', '10000-30000 ₴', '30000-50000 ₴', 'Більше 50000 ₴']
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
          <div className="w-64 flex-shrink-0">
            <FilterSidebar 
              filterOptions={filterOptions}
              sortOptions={sortOptions}
            />
          </div>
          
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Показано {category.products.length} з {category.products.length} товарів
              </p>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Сортувати:</span>
                <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <ArrowDownAZ className="h-4 w-4" />
                  За популярністю
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {category.products.map((product) => (
                <ElectronicsProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 