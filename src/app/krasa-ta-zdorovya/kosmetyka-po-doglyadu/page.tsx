import { Metadata } from 'next'
import CategoryContent from '../[category]/CategoryContent'

export const metadata: Metadata = {
  title: 'Косметика по догляду | Sell Point',
  description: 'Широкий вибір косметики по догляду за шкірою',
}

// Use the category ID for "Косметика по догляду"
const CATEGORY_ID = '687e7fa43f410756d06e04f0'

export default function CosmeticsPage() {
  return <CategoryContent params={Promise.resolve({ category: CATEGORY_ID })} />
} 