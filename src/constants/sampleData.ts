export const filterOptions = [
  {
    title: 'Бренд',
    options: ['La Roche-Posay', 'Vichy', 'CeraVe', 'The Ordinary', 'Bioderma', 'Avene', 'SVR']
  },
  {
    title: 'Ціновий діапазон',
    options: ['До 500 ₴', '500-1000 ₴', '1000-2000 ₴', 'Більше 2000 ₴']
  },
  {
    title: 'Тип шкіри',
    options: ['Нормальна', 'Суха', 'Жирна', 'Комбінована', 'Чутлива']
  },
  {
    title: 'Призначення',
    options: ['Зволоження', 'Очищення', 'Живлення', 'Захист', 'Антивікове']
  },
  {
    title: 'Наявність',
    options: ['В наявності', 'Під замовлення']
  }
];

export const sortOptions = [
  { label: 'За популярністю', value: 'popularity' },
  { label: 'Від дешевих до дорогих', value: 'price_asc' },
  { label: 'Від дорогих до дешевих', value: 'price_desc' },
  { label: 'За рейтингом', value: 'rating' },
  { label: 'Новинки', value: 'newest' }
];