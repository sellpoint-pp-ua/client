import Header from '@/components/layout/Header'
import FilterSidebar from '@/components/features/FilterSidebar'
import CategoryNavigation from '@/components/features/CategoryNavigation'
import ProductCard from '@/components/shared/ProductCard'

const filterOptions = [
  {
    title: 'Категорія',
    options: [
      'Біжутерія',
      'Годинники',
      'Сумки',
      'Окуляри',
      'Ювелірні вироби',
      'Ремені',
      'Шарфи та хустки',
      'Гаманці'
    ]
  },
  {
    title: 'Матеріал',
    options: [
      'Золото',
      'Срібло',
      'Шкіра',
      'Текстиль',
      'Метал',
      'Пластик',
      'Дерево'
    ]
  },
  {
    title: 'Ціновий діапазон',
    options: [
      'До 1000 ₴',
      '1000-5000 ₴',
      '5000-10000 ₴',
      'Більше 10000 ₴'
    ]
  },
  {
    title: 'Стиль',
    options: [
      'Класичний',
      'Повсякденний',
      'Спортивний',
      'Вечірній',
      'Діловий'
    ]
  },
  {
    title: 'Стать',
    options: [
      'Жіночі',
      'Чоловічі',
      'Унісекс'
    ]
  }
]

const sortOptions = [
  { label: 'За популярністю', value: 'popularity' },
  { label: 'Від дешевих до дорогих', value: 'price_asc' },
  { label: 'Від дорогих до дешевих', value: 'price_desc' },
  { label: 'За рейтингом', value: 'rating' },
  { label: 'Новинки', value: 'newest' }
]

const products = [
  {
    id: '1',
    title: 'Золотий ланцюжок з підвіскою',
    price: 12999,
    imageUrl: 'https://picsum.photos/id/11/400/400',
  },
  {
    id: '2',
    title: 'Срібний браслет з камінням',
    price: 2499,
    imageUrl: 'https://picsum.photos/id/12/400/400',
  },
  {
    id: '3',
    title: 'Жіночий годинник Michael Kors',
    price: 8999,
    imageUrl: 'https://picsum.photos/id/13/400/400',
  },
  {
    id: '4',
    title: 'Шкіряна сумка через плече',
    price: 3999,
    imageUrl: 'https://picsum.photos/id/14/400/400',
  },
  {
    id: '5',
    title: 'Сонцезахисні окуляри Ray-Ban',
    price: 4599,
    imageUrl: 'https://picsum.photos/id/15/400/400',
  },
  {
    id: '6',
    title: 'Шовковий шарф',
    price: 1299,
    imageUrl: 'https://picsum.photos/id/16/400/400',
  },
  {
    id: '7',
    title: 'Шкіряний ремінь',
    price: 999,
    imageUrl: 'https://picsum.photos/id/17/400/400',
  },
  {
    id: '8',
    title: 'Срібні сережки з перлами',
    price: 1899,
    imageUrl: 'https://picsum.photos/id/18/400/400',
  },
  {
    id: '9',
    title: 'Чоловічий гаманець зі шкіри',
    price: 1499,
    imageUrl: 'https://picsum.photos/id/19/400/400',
  },
  {
    id: '10',
    title: 'Золоте кільце з діамантом',
    price: 15999,
    imageUrl: 'https://picsum.photos/id/20/400/400',
  },
]

export default function AccessoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="mx-auto max-w-[1500px] px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Аксесуари та прикраси
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {products.length} товарів
          </p>
        </div>

        <CategoryNavigation />

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
                Показано {products.length} з {products.length} товарів
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 