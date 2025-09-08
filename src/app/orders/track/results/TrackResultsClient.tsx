"use client"
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/layout/SiteFooter'
import AccountSidebar from '@/components/account/AccountSidebar'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

type Item = { name: string; qty: number; price: number; imageUrl: string }
type Tracked = {
  id: string
  date: string
  status: 'В дорозі' | 'Очікує оплату' | 'Доставлено'
  items: Item[]
  total: number
  fromCity: string
  fromAddress: string
  toCity: string
  toAddress: string
  sentDate: string
  arrivalDate: string
}

const demo: Tracked[] = [
  {
    id: '№194436245',
    date: '24.05.2025',
    status: 'В дорозі',
    items: [
      { name: 'Автомобільний диск 20" BMW X3 M X4 M X4 M X5 X6', qty: 1, price: 48270, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/rukzaki.webp' },
    ],
    total: 48270,
    fromCity: 'м. Одеса, Україна',
    fromAddress: 'Магазин WheelStore, вул. І. Мазепи 6',
    toCity: 'м. Рівне, Україна',
    toAddress: 'Нова пошта, відділ №1',
    sentDate: '01.05.2025',
    arrivalDate: '03.05.2025',
  },
  {
    id: '№19447765',
    date: '18.05.2025',
    status: 'В дорозі',
    items: [
      { name: 'Нові диски 763 M Style R19', qty: 1, price: 8819, imageUrl: 'https://cloud.sellpoint.pp.ua/media/products-images/rukzaki.webp' },
    ],
    total: 8819,
    fromCity: 'м. Львів, Україна',
    fromAddress: 'Магазин Obert, вул. Т. Шевченка 13',
    toCity: 'м. Рівне, Україна',
    toAddress: 'Нова пошта, відділ №1',
    sentDate: '29.04.2025',
    arrivalDate: '01.05.2025',
  },
]

export default function TrackResultsClient() {
  const params = useSearchParams()
  const phone = params.get('phone')

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-100">
        <div className="mx-auto w-full max-w-[1510px] px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-[270px] lg:flex-shrink-0">
              <AccountSidebar />
            </div>
            <div className="flex-1 -ml-2">
              <div className="rounded-xl bg-white p-3 sm:p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <h1 className="text-lg font-bold text-gray-900">Результати відстеження{phone ? ` для +380 (${phone.slice(0,2)}) ${phone.slice(2,5)}-${phone.slice(5,7)}-${phone.slice(7,9)}` : ''}</h1>
                </div>
              </div>

              {/* Table */}
              <div className="mt-4 rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-gray-500">
                  <div className="col-span-12 md:col-span-4">Замовлення</div>
                  <div className="hidden md:block md:col-span-2">Статус</div>
                  <div className="hidden md:block md:col-span-2">Ціна</div>
                  <div className="hidden md:block md:col-span-2">Місце відправлення</div>
                  <div className="hidden md:block md:col-span-2">Місце прибуття</div>
                </div>
                {demo.map((o, index) => (
                  <div key={o.id} className={`grid grid-cols-12 gap-4 px-4 py-4 items-start ${index!==0 ? 'border-top border-gray-200' : ''}`}>
                    <div className="col-span-12 md:col-span-4">
                      <div className="flex items-start gap-4">
                        <div className="relative h-28 w-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image src={o.items[0].imageUrl} alt={o.items[0].name} fill className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Замовлення</p>
                          <p className="text-sm font-medium text-gray-900">{o.id}</p>
                          <p className="mt-1 text-xs text-gray-500">{o.date}</p>
                          <p className="mt-3 text-xs text-gray-500">1 шт.</p>
                          <p className="mt-1 text-sm text-[#3046b4] hover:underline cursor-pointer truncate">{o.items[0].name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <p className="text-sm text-gray-800">Нове</p>
                      <p className="text-sm text-blue-600">{o.status}</p>
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <p className="text-sm font-semibold text-gray-900">{o.total.toLocaleString('uk-UA')} грн</p>
                      <p className="text-sm text-green-600">Оплачено</p>
                    </div>
                    <div className="col-span-12 md:col-span-2">
                      <p className="text-sm font-medium text-gray-900">{o.fromCity}</p>
                      <p className="text-sm text-gray-700">{o.fromAddress}</p>
                      <p className="text-xs text-gray-500 mt-2">Дата відправлення: <span className="text-red-500">{o.sentDate}</span></p>
                    </div>
                    <div className="col-span-12 md:col-span-2">
                      <p className="text-sm font-medium text-gray-900">{o.toCity}</p>
                      <p className="text-sm text-gray-700">{o.toAddress}</p>
                      <p className="text-xs text-gray-500 mt-2">Дата прибуття: <span className="text-green-600">{o.arrivalDate}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
