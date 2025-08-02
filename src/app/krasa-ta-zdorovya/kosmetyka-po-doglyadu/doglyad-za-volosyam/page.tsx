import { Metadata } from 'next'
import CategoryContent from '../../[category]/CategoryContent'

export const metadata: Metadata = {
  title: 'Догляд за волоссям | Sell Point',
  description: 'Професійні засоби для догляду за волоссям',
}

// Use the category ID for "Догляд за волоссям"
const CATEGORY_ID = '687e80033f410756d06e04f8'

export default function HairCarePage() {
  return <CategoryContent params={Promise.resolve({ category: CATEGORY_ID })} />
} 