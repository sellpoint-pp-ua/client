import React from 'react'
import Image from 'next/image'

const searchChips: string[] = [
	'Автомобільні шини',
	'Аксесуари для Iphone 16 PRO',
	'Кухонний набір ножів',
	'Одяг для немовлят',
	'Демісезонний жіночий одяг',
	'Іграшки для домашніх улюбленців',
	'Акваріуми',
	'Іграшкові автомобілі на радіокеруванні',
	'Жіночі кросівки adidas',
	'Чоловічий спортивний костюм для спортзалу',
	'Чоловічий демісезонний одяг',
]

export default function SiteFooter() {
	return (
		<footer className="bg-gray-100">
			<div className="mx-auto w-full max-w-[1700px] px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-30 py-8 sm:py-10 2xl:pt-0">
				{/* What people search */}
				<div className="mb-6 sm:mb-8">
					<h3 className="mb-3 text-[19px]  text-gray-900">Що шукають</h3>
					<div className="flex flex-wrap gap-3">
						{searchChips.map((label, idx) => (
							<button
								key={idx}
								className="whitespace-nowrap rounded-lg bg-white px-3.5 py-1.5 text-sm hover:border-[#4563d1]  hover:underline transition-colors text-[#4563d1]"
								type="button"
							>
								{label}
							</button>
						))}
					</div>
				</div>

				{/* CTA card */}
				<div className=" rounded-xl bg-white pl-3 pr-3 pb-1 mb-6">
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
						{/* Left text block */}
						<div className="lg:col-span-4">
							<div className="flex items-center gap-3">
								<h3 className="text-[22px] sm:text-[20px] font-semibold text-gray-900">
									Почніть бізнес на SellPoint уже сьогодні
								</h3>
							</div>
							<p className="mt-2 text-[14px] text-green-600">
								Отримайте доступ до найбільшої бази надійних покупців
							</p>

							<div className="mt-4">
								<button className="rounded-xl bg-[#3A63F1] px-5 py-2.5 w-full mx-auto text-white  hover:bg-[#3358d8] transition-colors">
									Зареєструватися
								</button>
							</div>
						</div>

						<div className="lg:col-span-6">
							<ul className="mt-4 space-y-3 text-[14px] text-gray-800">
								<li className="flex items-start gap-3">
									<span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#4563d1] text-white text-xs">✓</span>
									<span>Отримуйте компенсації за незабрані посилки</span>
								</li>
								<li className="flex items-start gap-3">
									<span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#4563d1] text-white text-xs">✓</span>
									<span>Користуйтеся зручним кабінетом з готовими інтеграціями з логістами та банками</span>
								</li>
								<li className="flex items-start gap-3">
									<span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#4563d1] text-white text-xs">✓</span>
									<span>Створіть власний сайт для додаткових продажів</span>
								</li>
							</ul>
							</div>
						{/* Right image */}
						<div className="lg:col-span-2 ">
							<div className="flex items-center justify-end ">
								<Image
									src="https://cloud.sellpoint.pp.ua/media/adds-photos/ad_1.png"
									alt="Почніть бізнес на SellPoint уже сьогодні"
									width={200}
									height={200}
									className=" w-auto object-contain mr-15"
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Links columns */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-[14px] text-gray-800">
					<div>
						<h4 className="mb-3 font-semibold text-gray-900">Покупцям</h4>
						<ul className="space-y-2">
							<li><a href="#" className="hover:underline">Довідка для покупців</a></li>
							<li><a href="#" className="hover:underline">Підтримка</a></li>
							<li><a href="#" className="hover:underline">Акції і пропозиції</a></li>
							<li><a href="#" className="hover:underline">Що таке “Купити із Sellpoint”</a></li>
							<li><a href="#" className="hover:underline">Як купувати з оплатою</a></li>
							<li><a href="#" className="hover:underline">Рекомендації з безпечних покупок</a></li>
							<li><a href="#" className="hover:underline">Перевірка на приналежність сайту до платформи sellpoint.ua</a></li>
							<li><a href="#" className="hover:underline">Каталог запчастин</a></li>
						</ul>
					</div>
					<div>
						<h4 className="mb-3 font-semibold text-gray-900">Продавцям</h4>
						<ul className="space-y-2">
							<li><a href="#" className="hover:underline">Довідка для продавців</a></li>
							<li><a href="#" className="hover:underline">Створити інтернет-магазин на Sellpoint</a></li>
							<li><a href="#" className="hover:underline">Просування в каталозі ProSale</a></li>
							<li><a href="#" className="hover:underline">Sprava.sellpoint - медіа для підприємців</a></li>
							<li><a href="#" className="hover:underline">Угода користувача</a></li>
							<li><a href="#" className="hover:underline">Політика конфіденційності</a></li>
							<li><a href="#" className="hover:underline">Правила роботи на маркетплейсі</a></li>
							<li><a href="#" className="hover:underline">Бонусна програма електронний маркетплейс SELLPOINT</a></li>
							<li><a href="#" className="hover:underline">Інструкція GoogleAds</a></li>
						</ul>
					</div>
					<div>
						<h4 className="mb-3 font-semibold text-gray-900">Про нас</h4>
						<ul className="space-y-2">
							<li><a href="#" className="hover:underline">Про sellpoint.ua</a></li>
							<li><a href="#" className="hover:underline">Робота в sellpoint.ua</a></li>
							<li><a href="#" className="hover:underline">Контактна інформація</a></li>
							<li><a href="#" className="hover:underline">Захист прав на контент</a></li>
							<li><a href="#" className="hover:underline">Content right protection</a></li>
						</ul>
					</div>
					<div>
						<h4 className="mb-3 font-semibold text-gray-900">Партнери</h4>
						<ul className="space-y-2">
							<li><a href="#" className="hover:underline">Volonter by Sellpoint</a></li>
							<li><a href="#" className="hover:underline">Bigl.ua</a></li>
							<li><a href="#" className="hover:underline">Shafa</a></li>
							<li><a href="#" className="hover:underline">Kabanchik.ua</a></li>
							<li><a href="#" className="hover:underline">Вчасно</a></li>
							<li><a href="#" className="hover:underline">Zakupivli</a></li>
							<li><a href="#" className="hover:underline">Vendigo.ro</a></li>
							<li><a href="#" className="hover:underline">Karincagibi.com</a></li>
						</ul>
					</div>
				</div>
			</div>
		</footer>
	)
}


