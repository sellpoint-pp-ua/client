"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import AnimatedLogo from "@/components/shared/AnimatedLogo"
import { Settings } from 'lucide-react';
import { HardDrive } from 'lucide-react';
import { File, Laptop, Smartphone, Notebook, Waypoints, Package2, CreditCard, BaggageClaim, Wallet } from 'lucide-react';
export default function SellerRegisterBannerPage() {
  const [isContactOpen, setIsContactOpen] = useState(false)

  const SCALE = 0.85
  const COLS = [183, 111, 183].map((n) => Math.round(n * SCALE))
  const ROWS = [183, 129, 183].map((n) => Math.round(n * SCALE))
  const GRID_W = COLS.reduce((a, b) => a + b, 0)
  const GRID_H = ROWS.reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen flex flex-col bg-white ">
      
      <header className="w-full border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto w-full max-w-[1700px] px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between ">
          <Link href="/" className="group ml-26 -mb-2 mt-8" aria-label="Sell Point">
            <AnimatedLogo className="w-[198px] h-[51px]" />
          </Link>

          <div className="relative flex items-center gap-3 sm:gap-4 -mb-10.5 mr-22.5">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsContactOpen((v) => !v)}
                className="rounded-xl  px-3 sm:px-4 py-2 text-[14px] sm:text-[17px] font-medium text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <span>Зв’язатися з нами</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-6 w-6 transition-transform ${isContactOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {isContactOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-lg p-3 z-10">
                  <p className="text-[13px] text-gray-600">Телефон підтримки</p>
                  <a href="tel:+380961234567" className="mt-1 block text-[16px] font-semibold text-gray-900">
                    +380 96 123 45 67
                  </a>
                  <p className="mt-2 text-[12px] text-gray-500">Пн-Нд, 9:00–20:00</p>
                </div>
              )}
            </div>

            <Link
              href="/auth/register"
              className="rounded-xl bg-[#3A63F1] px-3 sm:px-4 py-2 ml-5.5 text-white text-[17px] sm:text-[17px] font-medium hover:bg-[#3358d8] transition-colors"
            >
              Зареєструватись
            </Link>
          </div>
        </div>
      </header>

      <section className="w-full bg-[#E4E5F5] shadow-sm">
        <div className="mx-auto w-full max-w-[1700px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-14 pt-10 lg:pt-8 pb-8.5">
            <div className="max-w-[600px] lg:max-w-[620px] ml-57.5 mt-4">
              <h1 className="text-[28px] sm:text-[35px] lg:text-[44px] xl:text-[54px]  leading-[1.2] font-bold text-gray-900 tracking-[0px]">
                Як створити
                <br /> інтернет-магазин
                <br /> на Sell Point?
              </h1>
              <p className="mt-5 text-[14px] sm:text-[17px] font-medium text-gray-800 max-w-[560px] leading-[1.45]">
                Реєструйтеся, обирайте тариф, сплачуйте комісію за <br /> виконані замовлення
              </p>
              <div className="mt-6">
                <Link
                  href="/auth/register"
                  className="inline-block rounded-xl bg-[#3A63F1] px-3 sm:px-16 py-2 text-white text-[14px] sm:text-[15px] font-medium hover:bg-[#3358d8] transition-colors"
                >
                  Зареєструватись
                </Link>
              </div>
            </div>

            
            <div className="relative mr-58">
              <div
                className="relative grid select-none"
                style={{
                  gridTemplateColumns: `${COLS[0]}px ${COLS[1]}px ${COLS[2]}px`,
                  gridTemplateRows: `${ROWS[0]}px ${ROWS[1]}px ${ROWS[2]}px`,
                  gap: 0,
                  width: GRID_W,
                  height: GRID_H,
                }}
                aria-hidden
              >
                <div className="relative col-span-2 row-span-1 overflow-hidden">
                  <Image
                    src="/photo-banner-1/banner1_part1.png"
                    alt=""
                    fill
                    priority
                    className="object-contain"
                    sizes={`${GRID_W}px`}
                    draggable={false}
                  />
                </div>
                
                <div className="relative overflow-hidden">
                  <Image
                    src="/photo-banner-1/banner1_part2.png"
                    alt=""
                    fill
                    priority
                    className="object-contain"
                    sizes={`${COLS[2]}px`}
                    draggable={false}
                  />
                </div>

                <div className="relative col-span-2 overflow-hidden">
                  <Image
                    src="/photo-banner-1/banner1_part3.png"
                    alt=""
                    fill
                    className="object-contain"
                    sizes={`${COLS[0] + COLS[1]}px`}
                    draggable={false}
                  />
                </div>
                <div className="relative overflow-hidden">
                  <Image
                    src="/photo-banner-1/banner1_part4.png"
                    alt=""
                    fill
                    className="object-contain"
                    sizes={`${COLS[2]}px`}
                    draggable={false}
                  />
                </div>

                <div className="relative overflow-hidden">
                  <Image
                    src="/photo-banner-1/banner1_part5.png"
                    alt=""
                    fill
                    className="object-contain"
                    sizes={`${COLS[0]}px`}
                    draggable={false}
                  />
                </div>

                <div className="relative col-span-2 overflow-hidden">
                  <Image
                    src="/photo-banner-1/banner1_part6.png"
                    alt=""
                    fill
                    className="object-contain"
                    sizes={`${COLS[1] + COLS[2]}px`}
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      
      <section className="w-full bg-[#fffde5]">
        <div className="mx-auto w-full max-w-[1700px] px-4 sm:px-6 lg:px-60 py-12 lg:py-16">
          
          <h2 className="text-gray-900 font-bold leading-tight tracking-normal  -mt-1 mb-8 max-w-none text-[26px] sm:text-[36px] lg:text-[41px]">
            Більше <span className="text-[#4563d1]">60 тисяч</span> підприємців із різних куточків України продають свої товари на Sell Point.
          </h2>

          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start mt-17">
            
            <div className="lg:col-span-5 xl:col-span-5">
              <div className="relative">
                <Image
                  src="/photo-banner-1/banner2.png"
                  alt="Sell Point sellers composition"
                  width={400}
                  height={820}
                  priority
                  className="w-full h-auto max-w-[400px]"
                />
              </div>
            </div>

            
            <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-6 pt-1">
              <p className="text-[20px] sm:text-[24px] lg:text-[28px] font-bold text-gray-900 leading-snug">
                Для них ми створили зручний інструмент <br /> — маркетплейс, який включає:
              </p>

              
              <div className="rounded-2xl bg-white p-6">
                <div className="flex items-start flex-col">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0e4fc] text-[#4563d1]">
                    
                    <Settings className="h-5 w-5" />
                  </div>
                  <div className="flex-1"> <br />
                    <h3 className="text-[18px] sm:text-[17px] font-bold text-gray-900">CMS-системи</h3>
                    <p className="text-[17px] text-gray-400 -mt-0.5">Управління товарами</p>
                    <p className="mt-4 mx-auto w-62 text-[17px] text-gray-900 leading-[1.2]">
                      На Промі понад 100 мільйонів товарів. Тут можна легко управляти великою кількістю контенту.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white  p-6">
                <div className="flex items-start flex-col">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0e4fc] text-[#4563d1]">
                    
                    <HardDrive className="h-5 w-5" />
                  </div>
                  <div className="flex-1"> <br />
                    <h3 className="text-[18px]  sm:text-[17px] font-bold  text-gray-900">
                      Інтеграції з провідними поштовими та фінансовими сервісами
                    </h3>
                    <p className="text-[17px] text-gray-400 -mt-0.5">Логістика, фінансові технології</p>

                    <div className="mt-4 space-y-2 text-[17px] text-gray-900 leading-[1.2]">
                      <div className="flex items-center gap-2">
                        <span>Доставка товарів:</span>
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#ff4d4f]" aria-hidden></span>
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#f5a524]" aria-hidden></span>
                      </div>
                      <div className="flex items-center gap-2">
                        
                        <span>Сервіси для оплати: <a className="text-[#4563d1] hover:underline font-bold" href="#">sell point</a> <span className="font-bold">Оплата</span> </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          
          <div className="mt-16">
            <h3 className="text-center text-gray-900 font-bold leading-tight text-[22px] sm:text-[28px] lg:text-[30px]">
              У підприємців на Sell Point є 3 канали продажів
            </h3>

            <div className="mt-11 grid grid-cols-1 md:grid-cols-3 gap-8 mx-16">
              
              <div className="rounded-2xl bg-white p-4 border border-gray-100">
                <div className="flex flex-col items-start gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0e4fc] text-[#4563d1]">
                    <File className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[16px] sm:text-[17px] font-medium  text-gray-900">Маркетплейс Sell Point</p>
                  </div>
                </div>
              </div>

              
              <div className="rounded-2xl bg-white p-6  border border-gray-100">
                <div className="flex  flex-col items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0e4fc] text-[#4563d1]">
                    <Laptop className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[16px] sm:text-[17px] font-medium text-gray-900">
                      Власний сайт на платформі Sell Point
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6  border border-gray-100">
                <div className="flex  flex-col items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e0e4fc] text-[#4563d1]">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[16px] sm:text-[17px] font-medium  text-gray-900">
                      Мобільний додаток Sell Point для покупців
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-[17px] sm:text-[17px] text-gray-900 leading-[1.2]">
              Наш додаток завжди у топі популярних українських додатків для шопінгу
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/auth/register"
                className="rounded-xl bg-[#3A63F1] px-3 sm:px-16 py-2 text-white text-[14px] sm:text-[15px] font-medium hover:bg-[#3358d8] transition-colors"
              >
                Зареєструватись
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-white">
        <div className="mx-auto w-full max-w-[1700px] mt-10 px-4 sm:px-6 lg:px-45 py-14">
          <h2 className="text-center text-[26px] sm:text-[36px] lg:text-[41px] font-bold text-gray-900">
            Прості кроки як створити інтернет-магазин на Sell Point
          </h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-14">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3A63F1] text-white">
                <Notebook className="h-5 w-5" />
              </div>
              <p className="mt-3 text-[#4563d1] font-bold">КРОК 1</p>
              <h3 className="mt-2 font-semibold text-gray-900">Зареєструйтеся</h3>
              <p className="mt-2 text-[17px] text-gray-700 leading-[1.35]">
                Вкажіть свій телефон та електронну адресу. Телефон стане вашим логіном у кабінеті продавця на Sell Point, а на електронну пошту будуть надходити повідомлення про замовлення.
              </p>
            </div>

            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full  bg-[#3A63F1] text-white">
                <Waypoints className="h-5 w-5" />
              </div>
              <p className="mt-3 text-[#4563d1] font-bold">КРОК 2</p>
              <h3 className="mt-2 font-semibold text-gray-900">Виберіть план</h3>
              <p className="mt-2 text-[17px] text-gray-700 leading-[1.35]">
                План залежить від кількості товарів, яку плануєте додати на Sell Point.
              </p>
            </div>

            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3A63F1] text-white">
                <Package2 className="h-5 w-5" />
              </div>
              <p className="mt-3 text-[#4563d1] font-bold">КРОК 3</p>
              <h3 className="mt-2 font-semibold text-gray-900">Додайте товари</h3>
              <p className="mt-2 text-[17px] text-gray-700 leading-[1.35]">
                Завантажте фотографії та описи. Вкажіть детальну та повну інформацію про товар — так покупець швидше обере саме ваш інтернет-магазин.
              </p>
            </div>

            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full  bg-[#3A63F1] text-white">
                <CreditCard className="h-5 w-5" />
              </div>
              <p className="mt-3 text-[#4563d1] font-bold">КРОК 4</p>
              <h3 className="mt-2 font-semibold text-gray-900">Додайте карту або рахунок</h3>
              <p className="mt-2 text-[17px] text-gray-700 leading-[1.35]">
              Щоб отримувати гроші за замовлення. Для цього ми розробили Sell Point-оплату. Це безпечний спосіб оплати карткою на Sell Point. Покупець оплачує замовлення наперед. Гроші надходять до продавця, коли покупець перевірить товар на пошті.
              </p>
            </div>

            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full  bg-[#3A63F1] text-white">
                <BaggageClaim className="h-5 w-5" />
              </div>
              <p className="mt-3 text-[#4563d1] font-bold">КРОК 5</p>
              <h3 className="mt-2 font-semibold text-gray-900">Отримуйте замовлення</h3>
              <p className="mt-2 text-[17px] text-gray-700 leading-[1.35]">
                Швидко обробляйте замовлення, адже покупці чекають їх. Обробити замовлення можна через сайт.
              </p>
            </div>

            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full  bg-[#3A63F1] text-white">
                <Wallet className="h-5 w-5" />
              </div>
              <p className="mt-3 text-[#4563d1] font-bold">КРОК 6</p>
              <h3 className="mt-2 font-semibold text-gray-900">Поповнюйте баланс</h3>
              <p className="mt-2 text-[17px] text-gray-700 leading-[1.35]">
                З нього списується оплата послуг, якими ви будете користуватися на Sell Point.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-white">
        <div className="mx-auto w-full max-w-[1700px] px-4 sm:px-6 lg:px-45 pb-25">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10">
            <div className="lg:col-span-6">
              <h3 className="text-[28px] sm:text-[32px] lg:text-[32px] font-bold text-gray-900">Залишились питання?</h3>
              <p className="mt-4 text-gray-700 text-[17px] max-w-[520px]">
                Перегляньте відео-інструкцію “Як почати продавати на <br /> Sell Point”. Якщо все зрозуміло – реєструйтеся!
              </p>
              <div className="mt-3">
                <Link href="/auth/register" className="inline-block rounded-xl bg-[#3A63F1] px-3 sm:px-16 py-2 text-white text-[14px] sm:text-[15px] font-medium hover:bg-[#3358d8] transition-colors">
                  Зареєструватись
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 flex justify-center lg:justify-end mr-45">
              {(() => {
                const SCALE2 = 0.7 * 0.88; 
                const COLS2 = [183, 111, 183].map((n) => Math.round(n * SCALE2))
                const ROWS2 = [183, 129, 183].map((n) => Math.round(n * SCALE2))
                const GRID_W2 = COLS2.reduce((a, b) => a + b, 0)
                const GRID_H2 = ROWS2.reduce((a, b) => a + b, 0)
                return (
                  <div
                    className="relative grid select-none"
                    style={{
                      gridTemplateColumns: `${COLS2[0]}px ${COLS2[1]}px ${COLS2[2]}px`,
                      gridTemplateRows: `${ROWS2[0]}px ${ROWS2[1]}px ${ROWS2[2]}px`,
                      gap: 0,
                      width: GRID_W2,
                      height: GRID_H2,
                    }}
                    aria-hidden
                  >
                    <div className="relative col-span-2 row-span-1 overflow-hidden m-0.5">
                      <Image src="/photo-banner-1/banner2_part1.png" alt="" fill className="object-contain" />
                    </div>
                    <div className="relative overflow-hidden m-0.5">
                      <Image src="/photo-banner-1/banner2_part2.png" alt="" fill className="object-contain" />
                    </div>
                    <div className="relative col-span-2 overflow-hidden m-0.5">
                      <Image src="/photo-banner-1/banner2_part3.png" alt="" fill className="object-contain" />
                    </div>
                    <div className="relative overflow-hidden m-0.5">
                      <Image src="/photo-banner-1/banner2_part4.png" alt="" fill className="object-contain" />
                    </div>
                    <div className="relative overflow-hidden m-0.5">
                      <Image src="/photo-banner-1/banner2_part5.png" alt="" fill className="object-contain" />
                    </div>
                    <div className="relative col-span-2 overflow-hidden m-0.5">
                      <Image src="/photo-banner-1/banner2_part6.png" alt="" fill className="object-contain" />
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#ffe6ef]">
        <div className="mx-auto w-full max-w-[1700px] px-4 sm:px-6 lg:px-60 py-14">
          <h2 className="text-center text-[26px] sm:text-[36px] lg:text-[41px] font-bold text-gray-900">
            Оберіть пропозицію, яка підходить вам найкраще
          </h2>
          <p className="mt-0 text-center text-[17px] sm:text-[17px] text-gray-900">
            Починайте продавати на Sell Point вже зараз
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-25">
            <div className="rounded-2xl bg-white p-4 flex flex-col">
              <p className="text-[28px] sm:text-[30px] font-bold text-gray-900">1 000 товарів</p>
              <p className="mt-0 text-[42px] sm:text-[46px] font-bold text-gray-900 tracking-tight">
                6 700<span className="align-top text-[22px]">₴</span>
              </p>
              <span className="mt-3 inline-block w-fit rounded-full bg-[#d8f8d9] text-[#2f7d32] px-3 py-1 text-[13px]">Популярний</span>
              <div className="mt-6 text-[15px] text-gray-800 leading-[1.5] space-y-2">
                <p>
                  3 яких:
                </p>
                <p>
                  Оплата за розміщення товарів – <span className="font-semibold">5 400 ₴/рік</span>
                </p>
                <p>
                  Баланс* для роботи на маркетплейсі – <span className="font-semibold">1 300 ₴</span>
                </p>
              </div>
              <div className="mt-6">
                <Link href="/auth/register" className="block text-center rounded-xl bg-[#3A63F1] px-4 py-2 text-white hover:bg-[#3358d8] transition-colors">
                  Зареєструватись
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 flex flex-col">
              <p className="text-[28px] sm:text-[30px] font-bold text-gray-900">6 000 товарів</p>
              <p className="mt-0 text-[42px] sm:text-[46px] font-bold text-gray-900 tracking-tight">
                8 700<span className="align-top text-[22px]">₴</span>
              </p>
              <span className="invisible  mt-3 inline-block w-fit rounded-full bg-[#d8f8d9] text-[#2f7d32] px-3 py-1 text-[13px]">Популярний</span>
              <div className="mt-6 text-[15px] text-gray-800 leading-[1.5] space-y-2">
                <p>
                  3 яких:
                </p>
                <p>
                  Оплата за розміщення товарів – <span className="font-semibold">6 200 ₴/рік</span>
                </p>
                <p>
                  Баланс* для роботи на маркетплейсі – <span className="font-semibold">2 500 ₴</span>
                </p>
              </div>
              <div className="mt-6">
                <Link href="/auth/register" className="block text-center rounded-xl bg-[#3A63F1] px-4 py-2 text-white hover:bg-[#3358d8] transition-colors">
                  Зареєструватись
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 flex flex-col">
              <p className="text-[28px] sm:text-[30px] font-bold text-gray-900">10 000 товарів</p>
              <p className="mt-0 text-[42px] sm:text-[46px] font-bold text-gray-900 tracking-tight">
                13 000<span className="align-top text-[22px]">₴</span>
              </p>
              <span className=" invisible  mt-3 inline-block w-fit rounded-full bg-[#d8f8d9] text-[#2f7d32] px-3 py-1 text-[13px]">Популярний</span>
              <div className="mt-6 text-[15px] text-gray-800 leading-[1.5] space-y-2">
                <p>
                  3 яких:
                </p>
                <p>
                  Оплата за розміщення товарів – <span className="font-semibold">9 000 ₴/рік</span>
                </p>
                <p>
                  Баланс* для роботи на маркетплейсі – <span className="font-semibold">4 000 ₴</span>
                </p>
              </div>
              <div className="mt-6">
                <Link href="/auth/register" className="block text-center rounded-xl bg-[#3A63F1] px-4 py-2 text-white hover:bg-[#3358d8] transition-colors">
                  Зареєструватись
                </Link>
              </div>
            </div>
          </div>

          <p className="mt-6 text-[17px] text-gray-700">*Детальніше про <a className="text-[#4563d1] hover:underline" href="#">баланс</a></p>

          <div className="mt-10 rounded-2xl bg-white  p-6 sm:p-8">
            <h3 className="text-[24px] sm:text-[28px] font-bold text-gray-900">Розміщення на Sell Point включає</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#4563d1]"></span>
                  <p className="font-bold  text-gray-900">Три канали продажів</p>
                </div>
                <p className="mt-3 text-[17px] ml-5 w-52 text-gray-900 leading-[1.5] max-w-[420px]">
                  Маркетплейс Sell Point, власний сайт, мобільний додаток для покупців.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#4563d1]"></span>
                  <p className="font-bold text-gray-900">Самостійне налаштування сайту</p>
                </div>
                <p className="mt-3 text-[17px] ml-5 w-75 text-gray-900  leading-[1.5] max-w-[460px]">
                  Дизайн, експорт товарів для реклами у Google Merchant Center тощо.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#4563d1]"></span>
                  <p className="font-bold text-gray-900">Різні способи оплат</p>
                </div>
                <p className="mt-3 text-[17px] ml-5 w-85 text-gray-900  leading-[1.5] max-w-[420px]">
                  Післяплата, безготівковий розрахунок, Sell Point-оплата.
                </p>
              </div>
            </div>

            
          </div>
          <p className="mt-6 text-[17px] text-gray-900 leading-[1.25]">
              Підприємці-ветерани російсько-української війни мають можливість скористатись спецпропозицією від Sell Point: купити річне розміщення на маркетплейсі за 1 грн. Також дана спец.пропозиція передбачає, що продавець має внести 500 грн на баланс, які він використає на просування своїх товарів в каталозі маркетплейсу.
            </p>
            <p className="mt-3 text-[17px] text-gray-900">
              Детальні умови <a href="#" className="text-[#4563d1] hover:underline font-bold">за посиланням</a>
            </p>
        </div>
      </section>
    </div>
  )
}
