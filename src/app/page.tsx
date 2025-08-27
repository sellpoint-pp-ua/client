import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import Carousel from '@/components/features/Carousel'
import ApiProductCard from '@/components/features/ApiProductCard'
import SiteFooter from '@/components/layout/SiteFooter'
import Image from 'next/image'

const homepageProducts = [
  { id: '1001', name: 'Смартфон Samsung Galaxy A54 6/128GB', price: 13999, hasDiscount: true, finalPrice: 12499, discountPercentage: 11, quantityStatus: 'В наявності', quantity: 7, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-photos/smartfony.png' },
  { id: '1002', name: 'Навушники JBL Tune 510BT', price: 1999, hasDiscount: true, finalPrice: 1599, discountPercentage: 20, quantityStatus: 'В наявності', quantity: 15, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-photos/avtozap.png' },
  { id: '1003', name: 'Ноутбук ASUS VivoBook 15', price: 25999, hasDiscount: false, quantityStatus: 'Закінчується', quantity: 2, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-photos/dim_i_sad.png' },
  { id: '1004', name: 'Електросамокат Xiaomi Mi Scooter 3', price: 16999, hasDiscount: true, finalPrice: 14999, discountPercentage: 12, quantityStatus: 'В наявності', quantity: 9, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-photos/kuhna.png' },
  { id: '1005', name: 'Робот-пилосос Roborock S7', price: 22999, hasDiscount: true, finalPrice: 19999, discountPercentage: 13, quantityStatus: 'В наявності', quantity: 4, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-photos/odyag.png' },
  { id: '1006', name: 'Смарт-годинник Apple Watch SE 44mm', price: 11999, hasDiscount: false, quantityStatus: 'В наявності', quantity: 6, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-photos/ribalka.png' },
  { id: '1007', name: 'Монітор LG 27" 27GN800-B', price: 11999, hasDiscount: true, finalPrice: 10499, discountPercentage: 13, quantityStatus: 'В наявності', quantity: 10, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-photos/rukzaki.png' },
  { id: '1008', name: 'Ігрова миша Logitech G502 Hero', price: 1799, hasDiscount: false, quantityStatus: 'В наявності', quantity: 12, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-photos/shkola.png' },
  { id: '1009', name: 'Портативна колонка Marshall Emberton II', price: 7499, hasDiscount: true, finalPrice: 6799, discountPercentage: 9, quantityStatus: 'Закінчується', quantity: 3, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-photos/computeri.png' },
  { id: '1010', name: 'Кавомашина DeLonghi Magnifica S', price: 16999, hasDiscount: true, finalPrice: 14999, discountPercentage: 12, quantityStatus: 'В наявності', quantity: 5, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-photos/zdorovia.png' },
]

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-100 ">
        {/* Full-bleed top container */}
        <div className="w-full bg-white">
          <div className="mx-auto w-full max-w-[1700px] px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <div className="flex flex-col lg:flex-row gap-6 py-4 sm:py-6 lg:py-5">
              <div className="hidden lg:block lg:w-[300px] lg:flex-shrink-0">
                <Sidebar />
              </div>
              <div className="flex-1">
                <div className="flex gap-6 items-stretch">
                  <div className="flex-1">
                    <Carousel />
                  </div>
                  <div className="hidden md:block w-[360px]">
                    <div className="h-full rounded-xl bg-white  flex flex-col items-center justify-between p-4 overflow-hidden">
                      <div className="w-full flex items-center justify-center">
                        <Image
                          src="https://cloud.sellpoint.pp.ua/media/adds-photos/ad_1.png"
                          alt="Почніть бізнес на SellPoint уже сьогодні"
                          width={250}
                          height={250}
                          className="max-w-[250px] h-auto object-contain"
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <h3 className="text-[20px] font-semibold text-gray-900 leading-tight">
                          Почніть бізнес на SellPoint
                          <br /> уже сьогодні
                        </h3>
                        <p className="mt-3 text-[14px] leading-snug text-green-600">
                          Отримайте доступ до <span className="font-semibold">найбільшої бази</span>
                          <br /> надійних покупців
                        </p>
                      </div>
                      <button
                        className="mt-4 mb-1 w-70 rounded-xl bg-[#3A63F1] py-2 text-[18px]  text-white hover:bg-[#3358d8] transition-colors"
                        type="button"
                      >
                        Зареєструватись
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content section with standard page padding */}
        <div className="mx-auto w-full max-w-[1700px] mt-0 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-10 py-6 px-4 sm:px-6 lg:px-8 xl:px-0 2xl:px-20">
            <section>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Найкращі категорії</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                {[
                  { title: 'Смартфони', img: 'https://cloud.sellpoint.pp.ua/media/products-photos/smartfony.png' },
                  { title: 'Одяг', img: 'https://cloud.sellpoint.pp.ua/media/products-photos/odyag.png' },
                  { title: 'Здоров\'я', img: 'https://cloud.sellpoint.pp.ua/media/products-photos/zdorovia.png' },
                  { title: 'Рюкзаки', img: 'https://cloud.sellpoint.pp.ua/media/products-photos/rukzaki.png' },
                  { title: 'Комп\'ютери', img: 'https://cloud.sellpoint.pp.ua/media/products-photos/computeri.png' },
                  { title: 'Дім і сад', img: 'https://cloud.sellpoint.pp.ua/media/products-photos/dim_i_sad.png' },
                  { title: 'Кухня', img: 'https://cloud.sellpoint.pp.ua/media/products-photos/kuhna.png' },
                  { title: 'Автозапчастини', img: 'https://cloud.sellpoint.pp.ua/media/products-photos/avtozap.png' },
                  { title: 'Рибалка', img: 'https://cloud.sellpoint.pp.ua/media/products-photos/ribalka.png' },
                  { title: 'Для школи', img: 'https://cloud.sellpoint.pp.ua/media/products-photos/shkola.png' },
                ].map((c, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="w-full rounded-lg border border-gray-300 bg-white p-1 hover:shadow-md transition-shadow">
                      <div className="aspect-square flex items-center justify-center rounded-lg bg-gray-50">
                        <Image 
                          src={c.img} 
                          alt={c.title} 
                          width={100}
                          height={100}
                          className="w-full h-full object-contain" 
                        />
                      </div>
                    </div>
                    <p className="mt-2 text-center text-[12px] sm:text-xs text-gray-900 ">{c.title}</p>
                  </div>
                ))}
              </div>
            </section>
            
            {/* Hardcoded products grid */}
            <section className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {homepageProducts.map((p) => (
                  <ApiProductCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    price={p.price}
                    hasDiscount={p.hasDiscount}
                    finalPrice={p.finalPrice}
                    discountPercentage={p.discountPercentage}
                    quantityStatus={p.quantityStatus}
                    quantity={p.quantity}
                    imageUrl={p.imageUrl}
                    
                  />
                ))}
              </div>
              <div className="mt-6 flex justify-center">
                <button className="rounded-xl border-2 border-[#6282f5] px-6 py-1.5 text-[#4563d1] font-semibold hover:bg-[#4563d1]/10 transition-colors w-full mx-auto">
                  Показати ще
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
