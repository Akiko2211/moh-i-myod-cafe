// Меню кофейни. category — раздел меню, portion — объём или вес.
// Позиции без своей фотографии показывают иллюстрацию раздела.
export const products = [
    // --- Кофе ---
    { id: 2,  category: 'coffee', name: 'Капучино', description: 'Классика с бархатной молочной пенкой', price: 220, portion: '300 мл', image: 'images/menu/cappuccino.webp' },
    { id: 4,  category: 'coffee', name: 'Эспрессо', description: 'Плотный и яркий, из свежеобжаренного зерна', price: 150, portion: '40 мл', image: 'images/menu/placeholder-coffee.svg' },
    { id: 5,  category: 'coffee', name: 'Американо', description: 'Эспрессо, разбавленный горячей водой', price: 180, portion: '300 мл', image: 'images/menu/placeholder-coffee.svg' },
    { id: 6,  category: 'coffee', name: 'Латте', description: 'Мягкий кофе с большим количеством молока', price: 240, portion: '350 мл', image: 'images/menu/placeholder-coffee.svg' },
    { id: 7,  category: 'coffee', name: 'Флэт уайт', description: 'Двойной эспрессо и тонкий слой молока', price: 260, portion: '250 мл', image: 'images/menu/placeholder-coffee.svg' },
    { id: 8,  category: 'coffee', name: 'Ванильный раф', description: 'Эспрессо, сливки и натуральная ваниль', price: 280, portion: '300 мл', image: 'images/menu/placeholder-coffee.svg' },

    // --- Авторские напитки ---
    { id: 1,  category: 'signature', name: 'Медовый раф', description: 'Эспрессо, сливки и цветочный мёд', price: 290, portion: '300 мл', image: 'images/menu/honey-raf.webp' },
    { id: 9,  category: 'signature', name: 'Лавандовый раф', description: 'Сливочный раф с лавандовым сиропом', price: 310, portion: '300 мл', image: 'images/menu/placeholder-signature.svg' },
    { id: 10, category: 'signature', name: 'Латте «Мёд и корица»', description: 'Латте с липовым мёдом и щепоткой корицы', price: 290, portion: '350 мл', image: 'images/menu/placeholder-signature.svg' },
    { id: 11, category: 'signature', name: 'Апельсиновый бамбл', description: 'Эспрессо, апельсиновый сок, карамель и лёд', price: 320, portion: '350 мл', image: 'images/menu/placeholder-signature.svg' },

    // --- Чай и какао ---
    { id: 3,  category: 'tea', name: 'Матча-латте', description: 'Японский зелёный чай на кокосовом молоке', price: 280, portion: '300 мл', image: 'images/menu/matcha-latte.webp' },
    { id: 12, category: 'tea', name: 'Иван-чай с мёдом', description: 'Травяной чай в чайнике, к нему — мёд', price: 260, portion: '600 мл', image: 'images/menu/placeholder-tea.svg' },
    { id: 13, category: 'tea', name: 'Облепиховый чай', description: 'Облепиха, апельсин, мёд и розмарин', price: 280, portion: '500 мл', image: 'images/menu/placeholder-tea.svg' },
    { id: 14, category: 'tea', name: 'Какао с маршмеллоу', description: 'Густое какао на молоке', price: 250, portion: '300 мл', image: 'images/menu/placeholder-tea.svg' },

    // --- Завтраки ---
    { id: 15, category: 'breakfast', name: 'Сырники', description: 'Со сметаной и цветочным мёдом', price: 350, portion: '220 г', image: 'images/menu/placeholder-breakfast.svg' },
    { id: 16, category: 'breakfast', name: 'Овсяная каша', description: 'На молоке, с ягодами и мёдом', price: 290, portion: '300 г', image: 'images/menu/placeholder-breakfast.svg' },
    { id: 17, category: 'breakfast', name: 'Тост с авокадо', description: 'Цельнозерновой хлеб, авокадо и яйцо пашот', price: 420, portion: '250 г', image: 'images/menu/placeholder-breakfast.svg' },
    { id: 18, category: 'breakfast', name: 'Гранола с йогуртом', description: 'Домашняя гранола, греческий йогурт, мёд', price: 320, portion: '250 г', image: 'images/menu/placeholder-breakfast.svg' },

    // --- Выпечка ---
    { id: 19, category: 'bakery', name: 'Круассан', description: 'Слоёный, на сливочном масле', price: 180, portion: '70 г', image: 'images/menu/placeholder-bakery.svg' },
    { id: 20, category: 'bakery', name: 'Миндальный круассан', description: 'С миндальным кремом и лепестками', price: 230, portion: '90 г', image: 'images/menu/placeholder-bakery.svg' },
    { id: 21, category: 'bakery', name: 'Синнабон', description: 'Булочка с корицей и сливочным кремом', price: 260, portion: '120 г', image: 'images/menu/placeholder-bakery.svg' },

    // --- Десерты ---
    { id: 22, category: 'desserts', name: 'Медовик', description: 'Тонкие медовые коржи и сметанный крем', price: 290, portion: '140 г', image: 'images/menu/placeholder-desserts.svg' },
    { id: 23, category: 'desserts', name: 'Чизкейк Сан-Себастьян', description: 'Нежный, с карамельной корочкой', price: 330, portion: '150 г', image: 'images/menu/placeholder-desserts.svg' },
    { id: 24, category: 'desserts', name: 'Морковный торт', description: 'С грецким орехом и сливочным сыром', price: 310, portion: '150 г', image: 'images/menu/placeholder-desserts.svg' }
];
