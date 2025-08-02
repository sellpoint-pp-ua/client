import Header from '@/components/layout/Header'
import CategoryCard from '@/components/features/CategoryCard'
import ElectronicsProductCard from '@/components/features/ElectronicsProductCard'
import FilterSidebar from '@/components/features/FilterSidebar'

type FilterOption = {
  title: string;
  options: string[];
}

type Product = {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  isReadyToShip: boolean;
}

type Category = {
  id: string;
  name: {
    uk: string;
    [key: string]: string;
  };
  parentId?: string;
}

type Props = {
  params: Promise<{
    category: string;
  }>;
}

const getFilterOptions = (categoryId: string): FilterOption[] => {
  // Default filter options
  const defaultOptions: FilterOption[] = [
    {
      title: 'Ціновий діапазон',
      options: ['До 500 ₴', '500-1000 ₴', '1000-2000 ₴', 'Більше 2000 ₴']
    },
    {
      title: 'Наявність',
      options: ['В наявності', 'Під замовлення']
    }
  ]

  // Category-specific filter options
  const categoryFilters: Record<string, FilterOption[]> = {
    // Косметика по догляду
    '687e7fa43f410756d06e04f0': [
      {
        title: 'Бренд',
        options: ['La Roche-Posay', 'Vichy', 'CeraVe', 'The Ordinary', 'Bioderma', 'Avene', 'SVR']
      },
      {
        title: 'Тип шкіри',
        options: ['Нормальна', 'Суха', 'Жирна', 'Комбінована', 'Чутлива']
      },
      {
        title: 'Призначення',
        options: ['Зволоження', 'Очищення', 'Живлення', 'Захист', 'Антивікове']
      },
      ...defaultOptions
    ],
    // Догляд за обличчям
    '687e7fef3f410756d06e04f6': [
      {
        title: 'Бренд',
        options: ['CeraVe', 'La Roche-Posay', 'The Ordinary', 'Vichy', 'Bioderma', 'SVR']
      },
      {
        title: 'Тип засобу',
        options: ['Креми', 'Сироватки', 'Тоніки', 'Маски', 'Пінки', 'Гелі']
      },
      {
        title: 'Тип шкіри',
        options: ['Нормальна', 'Суха', 'Жирна', 'Комбінована', 'Чутлива']
      },
      {
        title: 'Призначення',
        options: ['Зволоження', 'Очищення', 'Живлення', 'Від зморшок', 'Від акне']
      },
      ...defaultOptions
    ],
    // Догляд за волоссям
    '687e80033f410756d06e04f8': [
      {
        title: 'Бренд',
        options: ['L\'Oreal', 'Schwarzkopf', 'Pantene', 'Head & Shoulders', 'Dove', 'TIGI']
      },
      {
        title: 'Тип засобу',
        options: ['Шампуні', 'Кондиціонери', 'Маски', 'Олії', 'Сироватки', 'Спреї']
      },
      {
        title: 'Тип волосся',
        options: ['Нормальне', 'Сухе', 'Жирне', 'Пошкоджене', 'Фарбоване', 'Кучеряве']
      },
      {
        title: 'Призначення',
        options: ['Зволоження', 'Відновлення', 'Захист кольору', 'Проти лупи', 'Об\'єм']
      },
      ...defaultOptions
    ],
    // Манікюр і педикюр
    '687e7fb83f410756d06e04f2': [
      {
        title: 'Категорія',
        options: ['Лаки', 'Гель-лаки', 'Інструменти', 'Пилки', 'Кусачки', 'Дизайн нігтів']
      },
      {
        title: 'Бренд',
        options: ['Kodi Professional', 'Nail Look', 'OPI', 'Essie', 'Sally Hansen']
      },
      {
        title: 'Призначення',
        options: ['Для манікюру', 'Для педикюру', 'Універсальні']
      },
      ...defaultOptions
    ],
    // Інтимні товари
    '687e7fc93f410756d06e04f4': [
      {
        title: 'Категорія',
        options: ['Засоби гігієни', 'Косметичні засоби', 'Аксесуари']
      },
      {
        title: 'Бренд',
        options: ['Durex', 'Contex', 'Kotex', 'Always', 'Libresse']
      },
      ...defaultOptions
    ]
  }

  return categoryFilters[categoryId] || defaultOptions
}

const getFeaturedProducts = (categoryId: string): Product[] => {
  // Default products to show when no category-specific products are found
  const defaultProducts: Product[] = [
    {
      id: '1',
      title: 'La Roche-Posay Effaclar Mat Moisturizer',
      price: 899,
      oldPrice: 999,
      imageUrl: 'data:image/jpeg;base64,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',
      rating: 4.8,
      reviewCount: 156,
      isAvailable: true,
      isReadyToShip: true,
    },
    {
      id: '2',
      title: 'Vichy Mineral 89 Hyaluronic Acid Face Serum',
      price: 1299,
      imageUrl: 'https://picsum.photos/id/22/400/400',
      rating: 4.9,
      reviewCount: 234,
      isAvailable: true,
      isReadyToShip: true,
    },
    {
      id: '3',
      title: 'CeraVe Moisturizing Cream',
      price: 699,
      oldPrice: 799,
      imageUrl: 'https://picsum.photos/id/23/400/400',
      rating: 4.7,
      reviewCount: 189,
      isAvailable: true,
      isReadyToShip: false,
    },
    {
      id: '4',
      title: 'The Ordinary Niacinamide 10% + Zinc 1%',
      price: 499,
      imageUrl: 'https://picsum.photos/id/24/400/400',
      rating: 4.6,
      reviewCount: 312,
      isAvailable: true,
      isReadyToShip: true,
    }
  ];

  // Category-specific featured products
  const categoryProducts: Record<string, Product[]> = {
    // Догляд за обличчям
    '687e7fef3f410756d06e04f6': [
      {
        id: '1',
        title: 'CeraVe Зволожуючий крем для обличчя',
        price: 459,
        oldPrice: 599,
        imageUrl: 'https://picsum.photos/id/51/400/400',
        rating: 4.8,
        reviewCount: 345,
        isAvailable: true,
        isReadyToShip: true
      },
      {
        id: '2',
        title: 'La Roche-Posay Effaclar Duo+ Крем',
        price: 699,
        imageUrl: 'https://picsum.photos/id/52/400/400',
        rating: 4.9,
        reviewCount: 428,
        isAvailable: true,
        isReadyToShip: true
      },
      {
        id: '3',
        title: 'The Ordinary Niacinamide 10% + Zinc 1%',
        price: 419,
        oldPrice: 529,
        imageUrl: 'https://picsum.photos/id/53/400/400',
        rating: 4.7,
        reviewCount: 542,
        isAvailable: true,
        isReadyToShip: false
      },
      {
        id: '4',
        title: 'Bioderma Sensibio H2O Міцелярна вода',
        price: 529,
        imageUrl: 'https://picsum.photos/id/54/400/400',
        rating: 4.6,
        reviewCount: 289,
        isAvailable: false,
        isReadyToShip: false
      }
    ],
    // Догляд за волоссям
    '687e80033f410756d06e04f8': [
      {
        id: '1',
        title: 'L\'Oreal Elseve Повне Відновлення 5 Шампунь',
        price: 229,
        oldPrice: 299,
        imageUrl: 'https://picsum.photos/id/61/400/400',
        rating: 4.7,
        reviewCount: 312,
        isAvailable: true,
        isReadyToShip: true
      },
      {
        id: '2',
        title: 'Schwarzkopf Professional Bonacure Маска',
        price: 599,
        imageUrl: 'https://picsum.photos/id/62/400/400',
        rating: 4.9,
        reviewCount: 178,
        isAvailable: true,
        isReadyToShip: true
      },
      {
        id: '3',
        title: 'TIGI Bed Head Відновлююча сироватка',
        price: 449,
        oldPrice: 549,
        imageUrl: 'https://picsum.photos/id/63/400/400',
        rating: 4.6,
        reviewCount: 245,
        isAvailable: true,
        isReadyToShip: false
      },
      {
        id: '4',
        title: 'Dove Інтенсивне відновлення Кондиціонер',
        price: 189,
        imageUrl: 'https://picsum.photos/id/64/400/400',
        rating: 4.5,
        reviewCount: 423,
        isAvailable: true,
        isReadyToShip: true
      }
    ],
    // Манікюр і педикюр
    '687e7fb83f410756d06e04f2': [
      {
        id: '1',
        title: 'Набір для манікюру Kodi Professional',
        price: 1299,
        oldPrice: 1499,
        imageUrl: 'https://picsum.photos/id/31/400/400',
        rating: 4.8,
        reviewCount: 156,
        isAvailable: true,
        isReadyToShip: true,
      },
      {
        id: '2',
        title: 'Гель-лак OPI Infinite Shine',
        price: 399,
        imageUrl: 'https://picsum.photos/id/32/400/400',
        rating: 4.9,
        reviewCount: 234,
        isAvailable: true,
        isReadyToShip: true,
      },
      {
        id: '3',
        title: 'Пилка для нігтів Essie',
        price: 199,
        oldPrice: 249,
        imageUrl: 'https://picsum.photos/id/33/400/400',
        rating: 4.7,
        reviewCount: 189,
        isAvailable: true,
        isReadyToShip: false,
      },
      {
        id: '4',
        title: 'Кусачки для кутикули Sally Hansen',
        price: 299,
        imageUrl: 'https://picsum.photos/id/34/400/400',
        rating: 4.6,
        reviewCount: 312,
        isAvailable: true,
        isReadyToShip: true,
      }
    ],
    // Інтимні товари
    '687e7fc93f410756d06e04f4': [
      {
        id: '1',
        title: 'Durex',
        price: 129,
        oldPrice: 149,
        imageUrl: 'https://picsum.photos/id/71/400/400',
        rating: 4.8,
        reviewCount: 156,
        isAvailable: true,
        isReadyToShip: true,
      },
      {
        id: '2',
        title: 'Contex',
        price: 199,
        imageUrl: 'https://picsum.photos/id/72/400/400',
        rating: 4.9,
        reviewCount: 234,
        isAvailable: true,
        isReadyToShip: true,
      },
      {
        id: '3',
        title: 'Kotex',
        price: 99,
        oldPrice: 119,
        imageUrl: 'https://picsum.photos/id/73/400/400',
        rating: 4.7,
        reviewCount: 189,
        isAvailable: true,
        isReadyToShip: false,
      },
      {
        id: '4',
        title: 'Always',
        price: 149,
        imageUrl: 'https://picsum.photos/id/74/400/400',
        rating: 4.6,
        reviewCount: 312,
        isAvailable: true,
        isReadyToShip: true,
      }
    ]
  }

  return categoryProducts[categoryId] || defaultProducts;
}

const sortOptions = [
  { label: 'За популярністю', value: 'popularity' },
  { label: 'Від дешевих до дорогих', value: 'price_asc' },
  { label: 'Від дорогих до дешевих', value: 'price_desc' },
  { label: 'За рейтингом', value: 'rating' },
  { label: 'Новинки', value: 'newest' }
]

// Add a mapping for subcategory URLs
const SUBCATEGORY_URLS: Record<string, string> = {
  // Косметика по догляду subcategories
  '687e7fef3f410756d06e04f6': '/krasa-ta-zdorovya/kosmetyka-po-doglyadu/doglyad-za-oblychchyam',
  '687e80033f410756d06e04f8': '/krasa-ta-zdorovya/kosmetyka-po-doglyadu/doglyad-za-volosyam',
};

// Helper function to get the correct URL for a subcategory
function getSubcategoryUrl(parentId: string, subcategory: Category): string {
  // Check if we have a static URL mapping for this subcategory
  if (SUBCATEGORY_URLS[subcategory.id]) {
    return SUBCATEGORY_URLS[subcategory.id];
  }

  // If no static mapping exists, use the dynamic route
  return `/krasa-ta-zdorovya/${parentId}/${subcategory.id}`;
}

export default async function CategoryContent({ params }: Props) {
  const { category: categorySlug } = await params
  
  // Get category-specific filter options and featured products
  const filterOptions = getFilterOptions(categorySlug)
  const featuredProducts = getFeaturedProducts(categorySlug)

  // Mock data for now to avoid build issues
  const category: Category = {
    id: categorySlug,
    name: { uk: 'Категорія товарів' },
    parentId: undefined
  }
  const subcategories: Category[] = []
  const error: string | null = null

  // Always render the base layout
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="mx-auto max-w-[1500px] px-4 py-6">
        {error ? (
          // Error state
          <div className="text-center py-12">
            <p className="text-red-500 text-lg mb-2">
              {error}
            </p>
            <p className="text-gray-600 mb-4">
              Виникла помилка при завантаженні даних. Будь ласка, спробуйте ще раз.
            </p>
          </div>
        ) : category ? (
          // Content when loaded
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                {category.name.uk}
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Знайдіть найкращі товари в категорії {category.name.uk.toLowerCase()}
              </p>
            </div>

            {/* Products Section - Always show this section */}
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Популярні товари
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Сортувати:</span>
                  <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    За популярністю
                  </button>
                </div>
              </div>

              {/* Subcategories Grid - Show only if there are subcategories */}
              {subcategories.length > 0 && (
                <section className="mb-12">
                  <h2 className="mb-6 text-xl font-semibold text-gray-900">
                    Підкатегорії
                  </h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
                    {subcategories.map((subcategory) => (
                      <CategoryCard
                        key={subcategory.id}
                        title={subcategory.name.uk}
                        count={0}
                        href={getSubcategoryUrl(categorySlug, subcategory)}
                        iconType="sparkles"
                      />
                    ))}
                  </div>
                </section>
              )}

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
          </>
        ) : (
          // Not found state
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              Категорію не знайдено
            </p>
          </div>
        )}
      </main>
    </div>
  )
} 