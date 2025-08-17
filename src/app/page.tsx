import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import Carousel from '@/components/features/Carousel'
import ProductCard from '@/components/shared/ProductCard'

const featuredProducts = [
  {
    id: '1',
    title: 'Смартфон Apple iPhone 13 128GB',
    price: 29999,
    imageUrl: 'https://picsum.photos/id/1/400/400',
  },
  {
    id: '2',
    title: 'Ноутбук Lenovo IdeaPad 3',
    price: 19999,
    imageUrl: 'https://picsum.photos/id/2/400/400',
  },
  {
    id: '3',
    title: 'Навушники Sony WH-1000XM4',
    price: 9999,
    imageUrl: 'https://picsum.photos/id/3/400/400',
  },
  {
    id: '4',
    title: 'Планшет Samsung Galaxy Tab S7',
    price: 24999,
    imageUrl: 'https://picsum.photos/id/4/400/400',
  },
  {
    id: '5',
    title: 'Смарт-годинник Apple Watch Series 7',
    price: 14999,
    imageUrl: 'https://picsum.photos/id/5/400/400',
  },
  {
    id: '6',
    title: 'Смарт-годинник Apple Watch Series 7',
    price: 14999,
    imageUrl: 'https://picsum.photos/id/5/400/400',
  },
]

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-[1500px] mt-3 ">
          <div className="flex gap-6 p-4">
            <Sidebar />
            
            <div className="flex-1 space-y-6">
              <Carousel />

            </div>
            
          </div>

          <div className=" flex flex-col gap-10 p-10">
            <section>
                <h2 className="mb-2 text-lg font-semibold text-gray-800">
                  Тебе зацікавить
                </h2>
                <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {featuredProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              </section>

              <section className="rounded-lg bg-[#4563d1] p-8 text-center text-white">
                <h2 className="mb-4 text-3xl font-bold">
                  Почніть продавати на Sell Point
                </h2>
                <p className="mb-6 text-lg">
                  Понад 31,5 млн українців шукають ваші товари та послуги на Sell Point
                </p>
                <button className="rounded-lg bg-[#FFD700] px-8 py-3 font-semibold text-gray-900 hover:bg-[#ffd900]/90">
                  Зареєструватись
                </button>
              </section>
          </div>
        </div>
      </main>
    </div>
  )
}
