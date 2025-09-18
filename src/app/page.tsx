import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import Carousel from '@/components/features/Carousel'
import ApiProductCard from '@/components/features/ApiProductCard'
import RandomProductsGrid from '@/components/features/RandomProductsGrid'
import SiteFooter from '@/components/layout/SiteFooter'
import Image from 'next/image'
import Link from 'next/link'

type BestCategoryConfig = {
  id?: string
  title?: string
  img: string
}

// Configure up to 10 real category IDs here and provide custom images.
// If id is provided, the name will be fetched from API and the card will link to /category/{id}.
// If id is omitted, the static title is shown and the card is not clickable.
const BEST_CATEGORY_CONFIG: BestCategoryConfig[] = [
  { title: "Краса та здоров'я", img: 'https://cloud.sellpoint.pp.ua/media/category-photos/krasa-ta-zdorovya.webp', id: '68b076a78b56ead269c2ed6d' },
  { title: 'Одяг та взуття', img: 'https://cloud.sellpoint.pp.ua/media/category-photos/odyag-ta-vzuttya.webp', id: '68b076a78b56ead269c2ed6f' },
  { title: "Техніка та електроніка", img: 'https://cloud.sellpoint.pp.ua/media/category-photos/tehnika-ta-elektronika.webp', id: '68b076a78b56ead269c2ed70' },
  { title: 'Авто-, мото', img: 'https://cloud.sellpoint.pp.ua/media/category-photos/avto-moto.webp', id: '68b076a78b56ead269c2ed72' },
  { title: 'Аксесуари та прикраси', img: 'https://cloud.sellpoint.pp.ua/media/category-photos/aksesuari-ta-prikrasi.webp', id: '68b076a78b56ead269c2ed74' },
  { title: 'Дім і сад', img: 'https://cloud.sellpoint.pp.ua/media/category-photos/dim-i-sad.webp', id: '68b076a78b56ead269c2ed6e' },
  { title: 'Медикаменти та медичні товари', img: 'https://cloud.sellpoint.pp.ua/media/category-photos/medikamenti-ta-medichni.webp', id: '68b076a78b56ead269c2ed77' },
  { title: 'Товари для дітей', img: 'https://cloud.sellpoint.pp.ua/media/category-photos/tovari-dlya-ditej.webp', id: '68b076a78b56ead269c2ed71' },
  { title: 'Спорт і відпочинок', img: 'https://cloud.sellpoint.pp.ua/media/category-photos/sport-i-vidpochinok.webp', id: '68b076a78b56ead269c2ed76' },
  { title: 'Подарунки, хобі, книги', img: 'https://cloud.sellpoint.pp.ua/media/category-photos/podarunki-hobi-knigi.webp', id: '68b076a78b56ead269c2ed73' },
]

const homepageProducts = [
  { id: '1001', name: 'Смартфон Samsung Galaxy A54 6/128GB', price: 13999, hasDiscount: true, finalPrice: 12499, discountPercentage: 11, quantityStatus: 'В наявності', quantity: 7, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/smartfony.webp' },
  { id: '1002', name: 'Навушники JBL Tune 510BT', price: 1999, hasDiscount: true, finalPrice: 1599, discountPercentage: 20, quantityStatus: 'В наявності', quantity: 15, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/avtozap.webp' },
  { id: '1003', name: 'Ноутбук ASUS VivoBook 15', price: 25999, hasDiscount: false, quantityStatus: 'Закінчується', quantity: 2, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/dim_i_sad.webp' },
  { id: '1004', name: 'Електросамокат Xiaomi Mi Scooter 3', price: 16999, hasDiscount: true, finalPrice: 14999, discountPercentage: 12, quantityStatus: 'В наявності', quantity: 9, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/kuhna.webp' },
  { id: '1005', name: 'Робот-пилосос Roborock S7', price: 22999, hasDiscount: true, finalPrice: 19999, discountPercentage: 13, quantityStatus: 'В наявності', quantity: 4, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/odyag.webp' },
  { id: '1006', name: 'Смарт-годинник Apple Watch SE 44mm', price: 11999, hasDiscount: false, quantityStatus: 'В наявності', quantity: 6, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/ribalka.webp' },
  { id: '1007', name: 'Монітор LG 27" 27GN800-B', price: 11999, hasDiscount: true, finalPrice: 10499, discountPercentage: 13, quantityStatus: 'В наявності', quantity: 10, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/rukzaki.webp' },
  { id: '1008', name: 'Ігрова миша Logitech G502 Hero', price: 1799, hasDiscount: false, quantityStatus: 'В наявності', quantity: 12, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/shkola.webp' },
  { id: '1009', name: 'Портативна колонка Marshall Emberton II', price: 7499, hasDiscount: true, finalPrice: 6799, discountPercentage: 9, quantityStatus: 'Закінчується', quantity: 3, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/computeri.webp' },
  { id: '1010', name: 'Кавомашина DeLonghi Magnifica S', price: 16999, hasDiscount: true, finalPrice: 14999, discountPercentage: 12, quantityStatus: 'В наявності', quantity: 5, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/zdorovia.webp' },
]

export default async function Home() {
  // Fetch names for configured category IDs (if provided)
  const configuredWithIds = BEST_CATEGORY_CONFIG.filter(c => c.id && c.id.trim().length > 0)
  const idToName = new Map<string, string>()
  if (configuredWithIds.length > 0) {
    try {
      const results = await Promise.all(
        configuredWithIds.map(async (c) => {
          try {
            const res = await fetch(`https://api.sellpoint.pp.ua/api/Category/${c.id}`, { cache: 'no-store' })
            if (!res.ok) return { id: c.id as string, name: c.title || '' }
            const data = await res.json()
            const name: string = typeof data?.name === 'string' ? data.name : (data?.name?.uk || c.title || 'Категорія')
            return { id: c.id as string, name }
          } catch {
            return { id: c.id as string, name: c.title || '' }
          }
        })
      )
      for (const r of results) {
        if (r.id && r.name) idToName.set(r.id, r.name)
      }
    } catch {
      // ignore fetch errors, fall back to titles
    }
  }
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
                      <Link
                        href="/seller/register"
                        className="mt-4 mb-1 w-70 text-center hover:cursor-pointer rounded-xl bg-[#3A63F1] py-2 text-[18px]  text-white hover:bg-[#3358d8] transition-colors"
                      >
                        Зареєструватись
                      </Link>
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
                {BEST_CATEGORY_CONFIG.map((c, idx) => {
                  const name = c.id ? (idToName.get(c.id) || c.title || 'Категорія') : (c.title || 'Категорія')
                  const card = (
                    <>
                      <div className="w-full rounded-lg border border-gray-300 bg-white p-1 hover:shadow-md transition-shadow">
                        <div className="aspect-square flex items-center justify-center rounded-lg bg-gray-50">
                          <Image 
                            src={c.img}
                            alt={name}
                            width={100}
                            height={100}
                            className="w-full h-full object-contain" 
                          />
                        </div>
                      </div>
                      <p className="mt-2 text-center text-[12px] sm:text-xs text-gray-900 ">{name}</p>
                    </>
                  )
                  return (
                    <div key={c.id || idx} className="flex flex-col items-center">
                      {c.id && c.id.trim().length > 0 ? (
                        <Link href={`/category/${c.id}`} className="w-full">
                          {card}
                        </Link>
                      ) : (
                        card
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
            
            {/* API-powered random products grid */}
            <RandomProductsGrid />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
