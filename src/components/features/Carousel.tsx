'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const slides = [
  {
    id: 1,
    imageUrl: 'https://cloud.sellpoint.pp.ua/media/adds-photos/ad_2.png',
    title: 'Весняні знижки',
  },
  {
    id: 2,
    imageUrl: 'https://cloud.sellpoint.pp.ua/media/adds-photos/ad_2.png',
    title: 'Нова колекція',
  },
  {
    id: 3,
    imageUrl: 'https://cloud.sellpoint.pp.ua/media/adds-photos/ad_2.png',
    title: 'Спеціальні пропозиції',
  },
]

export default function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative h-[350px] w-full overflow-hidden rounded-xl">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute h-full w-full transition-transform duration-500 ease-in-out ${
            index === currentSlide ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ transform: `translateX(${(index - currentSlide) * 100}%)` }}
        >
          <Image
            src={slide.imageUrl}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
          />
        </div>
      ))}
      
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  )
} 