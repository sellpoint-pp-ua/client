import { Metadata } from 'next'
import BeautyAndHealthContent from './BeautyAndHealthContent'

export const metadata: Metadata = {
  title: 'Краса та здоров&apos;я | Sell Point',
  description: 'Широкий вибір товарів для краси та здоров&apos;я',
}

export default function BeautyAndHealthPage() {
  return <BeautyAndHealthContent />
} 