import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Calendar, Star, ArrowRight, Utensils, Hotel, Car, Compass, Sparkles, Globe, Map as MapIcon, X, ShoppingBag, Trash2, Sun, Moon, User, Lock, Mail, LogOut, Menu, Heart } from 'lucide-react';

const LANGUAGES = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hy', name: 'Հայերեն', flag: '🇦🇲' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

const TRANSLATIONS: Record<string, any> = {
  it: {
    hotels: 'Hotel',
    restaurants: 'Ristoranti',
    tours: 'Tour',
    taxi: 'Taxi',
    discover: 'Scopri l\'Italia in modo più intelligente',
    companion: 'Il tuo compagno di fiducia per viaggi indimenticabili in tutta Italia.',
    start: 'Inizia il tuo viaggio',
    featured: 'Destinazioni in primo piano',
    wallet: 'Portafoglio',
    bonus: 'Bonus',
    filter: 'Filtra per',
    all: 'Tutti',
    more: 'Scopri di più',
    close: 'Chiudi',
    basket: 'Cestino',
    addToBasket: 'Aggiungi al cestino',
    priceRange: 'Prezzo',
    low: 'Economico',
    medium: 'Medio',
    high: 'Lusso',
    checkout: 'Pagamento',
    emptyBasket: 'Il tuo cestino è vuoto',
    experiences: 'Esperienze',
    rentals: 'Noleggi',
    events: 'Eventi',
    stories: 'Storie di Viaggio',
    reviews: 'Recensioni',
    leaveReview: 'Lascia una recensione',
    rating: 'Valutazione',
    comment: 'Commento',
    submit: 'Invia',
    noReviews: 'Ancora nessuna recensione.',
  },
  en: {
    hotels: 'Hotels',
    restaurants: 'Restaurants',
    tours: 'Tours',
    taxi: 'Taxi',
    discover: 'Discover Italy Smarter',
    companion: 'Your trusted companion for unforgettable journeys across Italy.',
    start: 'Start Your Journey',
    featured: 'Featured Destinations',
    wallet: 'Wallet',
    bonus: 'Bonus',
    filter: 'Filter by',
    all: 'All',
    more: 'See More Info',
    close: 'Close',
    basket: 'Basket',
    addToBasket: 'Add to Basket',
    priceRange: 'Price',
    low: 'Budget',
    medium: 'Mid-range',
    high: 'Luxury',
    checkout: 'Checkout',
    emptyBasket: 'Your basket is empty',
    experiences: 'Experiences',
    rentals: 'Rentals',
    events: 'Events',
    stories: 'Travel Stories',
    reviews: 'Reviews',
    leaveReview: 'Leave a Review',
    rating: 'Rating',
    comment: 'Comment',
    submit: 'Submit',
    noReviews: 'No reviews yet.',
  },
  hy: {
    hotels: 'Հյուրանոցներ',
    restaurants: 'Ռեստորաններ',
    tours: 'Տուրեր',
    taxi: 'Տաքսի',
    discover: 'Բացահայտեք Իտալիան ավելի խելացի',
    companion: 'Ձեր վստահելի ուղեկիցը Իտալիայում անմոռանալի ճանապարհորդությունների համար:',
    start: 'Սկսեք ձեր ճանապարհորդությունը',
    featured: 'Առաջարկվող ուղղություններ',
    wallet: 'Քսակ',
    bonus: 'Բոնուս',
    filter: 'Ֆիլտրել ըստ',
    all: 'Բոլորը',
    more: 'Տեսնել ավելին',
    close: 'Փակել',
    basket: 'Զամբյուղ',
    addToBasket: 'Ավելացնել զամբյուղում',
    priceRange: 'Գին',
    low: 'Էժան',
    medium: 'Միջին',
    high: 'Թանկ',
    checkout: 'Վճարում',
    emptyBasket: 'Ձեր զամբյուղը դատարկ է',
    experiences: 'Փորձառություններ',
    rentals: 'Վարձույթ',
    events: 'Միջոցառումներ',
    stories: 'Ճամփորդական պատմություններ',
    reviews: 'Կարծիքներ',
    leaveReview: 'Թողնել կարծիք',
    rating: 'Գնահատական',
    comment: 'Մեկնաբանություն',
    submit: 'Ուղարկել',
    noReviews: 'Դեռևս կարծիքներ չկան:',
  },
  ru: {
    hotels: 'Отели',
    restaurants: 'Рестораны',
    tours: 'Туры',
    taxi: 'Такси',
    discover: 'Откройте Италию умнее',
    companion: 'Ваш надежный спутник для незабываемых путешествий по всей Италии.',
    start: 'Начать путешествие',
    featured: 'Популярные направления',
    wallet: 'Кошелек',
    bonus: 'Бонус',
    filter: 'Фильтр по',
    all: 'Все',
    more: 'Подробнее',
    close: 'Закрыть',
    basket: 'Корзина',
    addToBasket: 'В корзину',
    priceRange: 'Цена',
    low: 'Бюджетно',
    medium: 'Средне',
    high: 'Люкс',
    checkout: 'Оплата',
    emptyBasket: 'Ваша корзина пуста',
    experiences: 'Впечатления',
    rentals: 'Аренда',
    events: 'События',
    stories: 'Истории путешествий',
    reviews: 'Отзывы',
    leaveReview: 'Оставить отзыв',
    rating: 'Рейтинг',
    comment: 'Комментарий',
    submit: 'Отправить',
    noReviews: 'Отзывов пока нет.',
  }
};

const HOTELS = [
  { 
    id: 'h1', 
    name: 'Hotel Danieli', 
    location: 'Venice', 
    price: 850, 
    priceLevel: 'high',
    image: 'https://picsum.photos/seed/danieli/800/600', 
    stars: 5,
    description: 'A legendary hotel in the heart of Venice, offering breathtaking views of the lagoon and unparalleled luxury.',
    amenities: ['Spa', 'Fine Dining', 'Private Dock', 'Concierge'],
    history: 'Built in the 14th century as a palace for the Dandolo family, it has hosted royalty and celebrities for centuries. The hotel consists of three buildings: the 14th-century Palazzo Dandolo, the 19th-century Palazzo Casa Nuova, and the 20th-century Palazzo Danieli Excelsior. It was the first hotel in Venice to have an elevator.'
  },
  { 
    id: 'h2', 
    name: 'Grand Hotel Tremezzo', 
    location: 'Lake Como', 
    price: 1200, 
    priceLevel: 'high',
    image: 'https://picsum.photos/seed/tremezzo/800/600', 
    stars: 5,
    description: 'An iconic Art Nouveau masterpiece on the shores of Lake Como, featuring floating pools and lush gardens.',
    amenities: ['Floating Pool', 'Private Beach', 'Luxury Spa', 'Gourmet Dining'],
    history: 'Opened in 1910, it remains one of the most prestigious hotels in the world, capturing the essence of the Belle Époque. It was built for the social elite of Europe and has been family-owned for generations. The hotel is famous for its "T Spa" and the stunning views of Bellagio.'
  },
  { 
    id: 'h3', 
    name: 'Belmond Hotel Splendido', 
    location: 'Portofino', 
    price: 1500, 
    priceLevel: 'high',
    image: 'https://picsum.photos/seed/splendido/800/600', 
    stars: 5,
    description: 'Perched on a hillside overlooking the harbor of Portofino, this former monastery is the epitome of Italian glamour.',
    amenities: ['Infinity Pool', 'Terrace Dining', 'Private Boat Tours', 'Wellness Center'],
    history: 'Originally a 16th-century monastery, it was converted into a villa and later a hotel that became a favorite of Hollywood stars like Elizabeth Taylor and Richard Burton. The hotel is renowned for its lush Mediterranean gardens and its "La Terrazza" restaurant, which offers some of the best views in Italy.'
  },
  { 
    id: 'h4', 
    name: 'Hotel Artemide', 
    location: 'Rome', 
    price: 350, 
    priceLevel: 'medium',
    image: 'https://picsum.photos/seed/artemide/800/600', 
    stars: 4,
    description: 'A charming 19th-century building on Via Nazionale, offering modern comfort and a rooftop bar with views of the city.',
    amenities: ['Rooftop Bar', 'Free Minibar', 'Spa', 'Gym'],
    history: 'Housed in a beautiful 19th-century building, Hotel Artemide combines classical Roman architecture with contemporary design. It is located in the heart of the city, making it a perfect base for exploring the nearby Colosseum and Roman Forum.'
  },
  { 
    id: 'h5', 
    name: 'Ostello Bello', 
    location: 'Milan', 
    price: 80, 
    priceLevel: 'low',
    image: 'https://picsum.photos/seed/ostello/800/600', 
    stars: 3,
    description: 'A vibrant and award-winning hostel in the center of Milan, perfect for budget travelers looking for a social atmosphere.',
    amenities: ['Bar', 'Shared Kitchen', 'Live Music', 'Terrace'],
    history: 'Founded by a group of travelers, Ostello Bello has redefined the hostel experience in Italy. It is located just steps away from the Duomo and has become a hub for international travelers and locals alike.'
  },
  { 
    id: 'h6', 
    name: 'Hotel San Marco', 
    location: 'Rome', 
    price: 120, 
    priceLevel: 'low',
    image: 'https://picsum.photos/seed/sanmarco/800/600', 
    stars: 3,
    description: 'A comfortable 3-star hotel located near Termini Station, offering easy access to all of Rome\'s major attractions.',
    amenities: ['Free Wi-Fi', 'Breakfast Included', 'Air Conditioning', '24h Reception'],
    history: 'A family-run establishment that has been welcoming guests for over 30 years, known for its friendly service and clean rooms.'
  },
  { 
    id: 'h7', 
    name: 'Albergo Firenze', 
    location: 'Florence', 
    price: 110, 
    priceLevel: 'low',
    image: 'https://picsum.photos/seed/firenze/800/600', 
    stars: 3,
    description: 'Located in the heart of Florence, just steps from the Duomo, this hotel offers a classic Tuscan experience at an affordable price.',
    amenities: ['Central Location', 'Traditional Decor', 'Breakfast Buffet', 'Pet Friendly'],
    history: 'Housed in a historic building, this hotel preserves the charm of old Florence while providing modern amenities for today\'s travelers.'
  },
  { 
    id: 'h8', 
    name: 'Hotel Minerva', 
    location: 'Siena', 
    price: 130, 
    priceLevel: 'low',
    image: 'https://picsum.photos/seed/minerva/800/600', 
    stars: 3,
    description: 'A cozy hotel with stunning views of Siena\'s historic center, perfect for exploring the medieval city.',
    amenities: ['Panoramic Terrace', 'Bar', 'Meeting Room', 'Parking'],
    history: 'Originally a private residence, it was converted into a hotel in the mid-20th century and has since become a favorite for those seeking a quiet retreat.'
  },
];

const RESTAURANTS = [
  { 
    id: 'r1', 
    name: 'Osteria Francescana', 
    location: 'Modena', 
    chef: 'Massimo Bottura', 
    price: 300,
    priceLevel: 'high',
    image: 'https://picsum.photos/seed/osteria/800/600', 
    stars: 5,
    michelinStars: 3,
    description: 'Consistently ranked among the best in the world, this restaurant reinvents traditional Italian cuisine with artistic flair.',
    specialty: 'Oops! I Dropped the Lemon Tart',
    history: 'Founded in 1995, it has become a global culinary destination under the visionary leadership of Chef Massimo Bottura. The restaurant is located in the historic center of Modena and is famous for its innovative approach to traditional Emilian ingredients.'
  },
  { 
    id: 'r2', 
    name: 'La Pergola', 
    location: 'Rome', 
    chef: 'Heinz Beck', 
    price: 250,
    priceLevel: 'high',
    image: 'https://picsum.photos/seed/pergola/800/600', 
    stars: 5,
    michelinStars: 3,
    description: 'The only three-Michelin-starred restaurant in Rome, offering panoramic views of the Eternal City and exquisite Mediterranean dishes.',
    specialty: 'Fagotelli La Pergola',
    history: 'Located atop the Rome Cavalieri hotel, it has been a pinnacle of Roman fine dining since its opening. Chef Heinz Beck has led the kitchen since 1994, earning international acclaim for his light and creative Mediterranean cuisine.'
  },
  { 
    id: 'r3', 
    name: 'Enoteca Pinchiorri', 
    location: 'Florence', 
    chef: 'Annie Féolde', 
    price: 280,
    priceLevel: 'high',
    image: 'https://picsum.photos/seed/enoteca/800/600', 
    stars: 5,
    michelinStars: 3,
    description: 'A temple of gastronomy in Florence, known for its legendary wine cellar and innovative Tuscan cuisine.',
    specialty: 'Risotto with Saffron and Gold Leaf',
    history: 'Starting as a wine bar in the 1970s, it evolved into a world-renowned restaurant under Annie Féolde and Giorgio Pinchiorri. It is housed in the historic Palazzo Ciofi-Jacometti and boasts one of the most impressive wine collections in the world.'
  },
  { 
    id: 'r4', 
    name: 'Da Vittorio', 
    location: 'Bergamo', 
    chef: 'Cerea Family', 
    price: 200,
    priceLevel: 'medium',
    image: 'https://picsum.photos/seed/vittorio/800/600', 
    stars: 4,
    michelinStars: 3,
    description: 'A family-run institution near Bergamo, famous for its seafood and warm hospitality.',
    specialty: 'Paccheri alla Vittorio',
    history: 'Opened in 1966 by Vittorio Cerea and his wife Bruna, the restaurant has been a symbol of Italian excellence for over 50 years. It is now run by their children, who continue the tradition of high-quality ingredients and impeccable service.'
  },
  { 
    id: 'r5', 
    name: 'Pizzeria da Michele', 
    location: 'Naples', 
    chef: 'Condurro Family', 
    price: 15,
    priceLevel: 'low',
    image: 'https://picsum.photos/seed/michele/800/600', 
    stars: 3,
    description: 'The most famous pizzeria in the world, serving only two types of pizza: Margherita and Marinara.',
    specialty: 'Pizza Margherita',
    history: 'Founded in 1870, L\'Antica Pizzeria da Michele is a place of pilgrimage for pizza lovers. It was featured in the movie "Eat Pray Love" and continues to serve the same authentic Neapolitan pizza that has made it a legend.'
  },
  { 
    id: 'r6', 
    name: 'Trattoria da Mario', 
    location: 'Florence', 
    chef: 'Mario Rossi', 
    price: 25,
    priceLevel: 'low',
    image: 'https://picsum.photos/seed/mario/800/600', 
    stars: 3,
    description: 'A bustling, traditional trattoria known for its authentic Florentine steak and lively atmosphere.',
    specialty: 'Bistecca alla Fiorentina',
    history: 'Since 1953, Da Mario has been a staple of the Florentine dining scene, serving simple, high-quality Tuscan dishes to locals and tourists alike.'
  },
  { 
    id: 'r7', 
    name: 'Hostaria da Pietro', 
    location: 'Rome', 
    chef: 'Pietro Mancini', 
    price: 35,
    priceLevel: 'low',
    image: 'https://picsum.photos/seed/pietro/800/600', 
    stars: 3,
    description: 'A classic Roman hostaria near Piazza del Popolo, offering traditional Roman pasta dishes in a cozy setting.',
    specialty: 'Cacio e Pepe',
    history: 'A family-run restaurant that prides itself on using seasonal ingredients and traditional recipes passed down through generations.'
  },
  { 
    id: 'r8', 
    name: 'Trattoria del Pesce', 
    location: 'Bari', 
    chef: 'Antonio Esposito', 
    price: 40,
    priceLevel: 'medium',
    image: 'https://picsum.photos/seed/pesce/800/600', 
    stars: 3,
    description: 'A local favorite in Bari, serving the freshest seafood caught daily from the Adriatic Sea.',
    specialty: 'Crudo di Pesce',
    history: 'Located near the old harbor, this trattoria has been the go-to spot for seafood lovers in Puglia for decades.'
  },
];

const TOURS = [
  { 
    id: 't1', 
    name: 'Vatican Museums Private Tour', 
    location: 'Rome',
    duration: '4h', 
    price: 250, 
    priceLevel: 'medium',
    image: 'https://picsum.photos/seed/vatican/800/600',
    stars: 5,
    description: 'Skip the lines and explore the Sistine Chapel and St. Peter\'s Basilica with an expert art historian.',
    highlights: ['Sistine Chapel', 'Raphael Rooms', 'St. Peter\'s Basilica'],
    info: 'This exclusive tour provides deep insights into the Papal collections and the masterpieces of the Renaissance. You will learn about the history of the Vatican City and the artistic genius of Michelangelo and Raphael.'
  },
  { 
    id: 't2', 
    name: 'Amalfi Coast Boat Charter', 
    location: 'Amalfi',
    duration: 'Full Day', 
    price: 1200, 
    priceLevel: 'high',
    image: 'https://picsum.photos/seed/amalfi/800/600',
    stars: 5,
    description: 'Sail along the stunning Amalfi Coast on a private yacht, stopping at Positano, Amalfi, and hidden coves.',
    highlights: ['Positano View', 'Emerald Grotto', 'Private Swimming'],
    info: 'Experience the Mediterranean like never before, with a professional skipper and local aperitifs on board. The tour includes stops at the most picturesque villages and the opportunity to swim in crystal-clear waters.'
  },
  { 
    id: 't3', 
    name: 'Chianti Wine Tasting', 
    location: 'Tuscany',
    duration: '6h', 
    price: 180, 
    priceLevel: 'medium',
    image: 'https://picsum.photos/seed/chianti/800/600',
    stars: 4,
    description: 'Visit historic vineyards in the heart of Tuscany and sample world-class Chianti Classico wines.',
    highlights: ['Vineyard Walk', 'Cellar Tour', 'Gourmet Lunch'],
    info: 'Learn the secrets of Tuscan winemaking and enjoy a traditional lunch paired with local vintages. You will visit a family-owned estate and discover the history of the Gallo Nero (Black Rooster) symbol of Chianti Classico.'
  },
  { 
    id: 't4', 
    name: 'Colosseum Underground Tour', 
    location: 'Rome',
    duration: '3h', 
    price: 95, 
    priceLevel: 'low',
    image: 'https://picsum.photos/seed/colosseum/800/600',
    stars: 4,
    description: 'Explore the restricted areas of the Colosseum, including the underground tunnels where gladiators prepared for battle.',
    highlights: ['Underground Tunnels', 'Arena Floor', 'Third Tier'],
    info: 'Step back in time and discover the inner workings of the world\'s most famous amphitheater. This tour offers a unique perspective on the engineering and social history of ancient Rome.'
  },
  { 
    id: 't5', 
    name: 'Venice Walking Tour', 
    location: 'Venice',
    duration: '2h', 
    price: 45, 
    priceLevel: 'low',
    image: 'https://picsum.photos/seed/venicewalk/800/600',
    stars: 3,
    description: 'A guided walk through the labyrinthine streets of Venice, discovering hidden gems and historic landmarks.',
    highlights: ['St. Mark\'s Square', 'Rialto Bridge', 'Hidden Courtyards'],
    info: 'Learn about the history and legends of the Floating City from a local guide who knows every corner of Venice.'
  },
  { 
    id: 't6', 
    name: 'Pompeii Express Tour', 
    location: 'Pompeii',
    duration: '2h', 
    price: 55, 
    priceLevel: 'low',
    image: 'https://picsum.photos/seed/pompeii/800/600',
    stars: 3,
    description: 'A fast-paced tour of the ancient city of Pompeii, frozen in time by the eruption of Mt. Vesuvius.',
    highlights: ['Forum', 'Thermal Baths', 'Ancient Villas'],
    info: 'Perfect for those with limited time, this tour covers the most important sites of the archaeological park.'
  },
  { 
    id: 't7', 
    name: 'Siena Medieval History Tour', 
    location: 'Siena',
    duration: '2.5h', 
    price: 50, 
    priceLevel: 'low',
    image: 'https://picsum.photos/seed/sienatour/800/600',
    stars: 3,
    description: 'Discover the rich medieval heritage of Siena, from the Piazza del Campo to the stunning Duomo.',
    highlights: ['Piazza del Campo', 'Siena Cathedral', 'Medieval Streets'],
    info: 'Explore the history of the Palio and the rivalries between Siena\'s historic contrade.'
  },
];

const EXPERIENCES = [
  { 
    id: 'e1', 
    name: 'Private Cooking Class', 
    location: 'Florence',
    duration: '3h', 
    price: 150, 
    priceLevel: 'medium',
    image: 'https://picsum.photos/seed/cooking/800/600',
    stars: 5,
    description: 'Learn to make authentic pasta and tiramisu in a private kitchen with a local chef.',
    highlights: ['Handmade Pasta', 'Local Ingredients', 'Wine Pairing'],
    info: 'Master the secrets of Italian home cooking in an intimate setting. You will prepare a three-course meal and enjoy it with local wines.'
  },
  { 
    id: 'e2', 
    name: 'Opera Night at Arena di Verona', 
    location: 'Verona',
    duration: '4h', 
    price: 200, 
    priceLevel: 'high',
    image: 'https://picsum.photos/seed/opera/800/600',
    stars: 5,
    description: 'Experience a world-class opera performance in a stunning Roman amphitheater.',
    highlights: ['Historic Venue', 'Top Performers', 'Magical Atmosphere'],
    info: 'The Arena di Verona is one of the best-preserved Roman structures and hosts a prestigious opera festival every summer.'
  },
  { 
    id: 'e3', 
    name: 'Gelato Making Workshop', 
    location: 'Rome',
    duration: '1.5h', 
    price: 45, 
    priceLevel: 'low',
    image: 'https://picsum.photos/seed/gelato/800/600',
    stars: 3,
    description: 'Discover the art of making real Italian gelato with traditional methods and fresh ingredients.',
    highlights: ['Artisanal Techniques', 'Tasting Session', 'Recipe Book'],
    info: 'A fun and interactive workshop for all ages, where you\'ll learn the difference between gelato and ice cream.'
  },
  { 
    id: 'e4', 
    name: 'Street Food Tour', 
    location: 'Palermo',
    duration: '3h', 
    price: 55, 
    priceLevel: 'low',
    image: 'https://picsum.photos/seed/streetfood/800/600',
    stars: 3,
    description: 'Explore the vibrant markets of Palermo and taste the best street food Sicily has to offer.',
    highlights: ['Arancine', 'Panelle', 'Local Markets'],
    info: 'A culinary journey through the heart of Palermo, discovering the history and culture behind its famous street food.'
  },
];

const RENTALS = [
  { 
    id: 'rn1', 
    name: 'Ferrari Portofino Rental', 
    location: 'Milan',
    duration: '24h', 
    price: 1500, 
    priceLevel: 'high',
    image: 'https://picsum.photos/seed/ferrari/800/600',
    stars: 5,
    description: 'Drive the ultimate Italian supercar through the scenic roads of Northern Italy.',
    highlights: ['V8 Engine', 'Convertible', 'Italian Style'],
    info: 'Experience the thrill of driving a Ferrari. Perfect for a day trip to Lake Como or the Italian Alps.'
  },
  { 
    id: 'rn2', 
    name: 'Vintage Vespa Rental', 
    location: 'Rome',
    duration: 'Day Trip', 
    price: 75, 
    priceLevel: 'low',
    image: 'https://picsum.photos/seed/vespa/800/600',
    stars: 4,
    description: 'Explore the Eternal City like a local on a classic Italian scooter.',
    highlights: ['Iconic Design', 'Easy Parking', 'City Freedom'],
    info: 'Zip through Roman traffic and discover hidden corners of the city that cars can\'t reach.'
  },
  { 
    id: 'rn3', 
    name: 'Fiat 500 Vintage Rental', 
    location: 'Florence',
    duration: '24h', 
    price: 120, 
    priceLevel: 'low',
    image: 'https://picsum.photos/seed/fiat500/800/600',
    stars: 3,
    description: 'Drive a classic Fiat 500 through the rolling hills of Tuscany for a truly nostalgic experience.',
    highlights: ['Retro Charm', 'Manual Gearbox', 'Perfect for Photos'],
    info: 'The quintessential Italian car, perfect for exploring the countryside at a leisurely pace.'
  },
  { 
    id: 'rn4', 
    name: 'Electric City Bike Rental', 
    location: 'Milan',
    duration: 'Full Day', 
    price: 35, 
    priceLevel: 'low',
    image: 'https://picsum.photos/seed/ebike/800/600',
    stars: 3,
    description: 'An eco-friendly way to see Milan, with powerful electric assistance for effortless riding.',
    highlights: ['Sustainable Travel', 'Lightweight', 'Extended Range'],
    info: 'Explore Milan\'s parks and historic center without breaking a sweat.'
  },
  { 
    id: 'rn5', 
    name: 'Compact Economy Car', 
    location: 'Naples',
    duration: '24h', 
    price: 60, 
    priceLevel: 'low',
    image: 'https://picsum.photos/seed/economycar/800/600',
    stars: 3,
    description: 'A reliable and fuel-efficient car for budget-conscious travelers exploring Southern Italy.',
    highlights: ['Fuel Efficient', 'Easy to Drive', 'Air Conditioning'],
    info: 'A practical choice for navigating the narrow streets and coastal roads of the Amalfi Coast.'
  },
];

const EVENTS = [
  { 
    id: 'ev1', 
    name: 'Venice Carnival Masquerade', 
    location: 'Venice',
    duration: 'Night', 
    price: 500, 
    priceLevel: 'high',
    image: 'https://picsum.photos/seed/venice-carnival/800/600',
    stars: 5,
    description: 'Attend an exclusive masquerade ball in a historic Venetian palace.',
    highlights: ['Luxury Costumes', 'Gourmet Dinner', 'Live Music'],
    info: 'The Venice Carnival is one of the most famous festivals in the world, known for its elaborate masks and historical reenactments.'
  },
  { 
    id: 'ev2', 
    name: 'Milan Fashion Week Pass', 
    location: 'Milan',
    duration: 'Full Day', 
    price: 2000, 
    priceLevel: 'high',
    image: 'https://picsum.photos/seed/milan-fashion/800/600',
    stars: 5,
    description: 'Get exclusive access to top designer runway shows and after-parties.',
    highlights: ['Front Row Seats', 'VIP Access', 'Networking'],
    info: 'Milan Fashion Week is a global event where the world\'s leading designers showcase their latest collections.'
  },
  { 
    id: 'ev3', 
    name: 'Local Sagra (Food Festival)', 
    location: 'Tuscany',
    duration: 'Evening', 
    price: 30, 
    priceLevel: 'low',
    image: 'https://picsum.photos/seed/sagra/800/600',
    stars: 3,
    description: 'Join a traditional village food festival celebrating local seasonal products.',
    highlights: ['Authentic Food', 'Folk Music', 'Community Spirit'],
    info: 'Sagras are a fundamental part of Italian rural life, offering a chance to taste traditional dishes at affordable prices.'
  },
  { 
    id: 'ev4', 
    name: 'Open Air Cinema Night', 
    location: 'Rome',
    duration: 'Night', 
    price: 15, 
    priceLevel: 'low',
    image: 'https://picsum.photos/seed/cinema/800/600',
    stars: 3,
    description: 'Watch a classic Italian film under the stars in a historic Roman piazza.',
    highlights: ['Classic Films', 'Stunning Setting', 'Summer Vibes'],
    info: 'A popular summer activity in Rome, where historic squares are transformed into outdoor cinemas.'
  },
];

const STORIES = [
  {
    id: 's1',
    title: 'A Sunset in Positano',
    author: 'Elena Rossi',
    image: 'https://picsum.photos/seed/positano-story/800/1000',
    excerpt: 'The sky turned a deep shade of orange as the sun dipped below the horizon, painting the colorful houses of Positano in a magical light...'
  },
  {
    id: 's2',
    title: 'The Secret Gardens of Rome',
    author: 'Marco Bianchi',
    image: 'https://picsum.photos/seed/rome-story/800/1000',
    excerpt: 'Hidden behind high stone walls and ancient gates, Rome\'s secret gardens offer a peaceful escape from the bustling city streets...'
  },
  {
    id: 's3',
    title: 'Truffle Hunting in Piedmont',
    author: 'Sofia Conti',
    image: 'https://picsum.photos/seed/truffle-story/800/1000',
    excerpt: 'Following the expert nose of a truffle dog through the misty woods of Piedmont is an experience like no other...'
  }
];
import AIConcierge from './components/AIConcierge';
import TranslatedText from './components/TranslatedText';

const DESTINATIONS = [
  {
    id: 'rome',
    name: 'Rome',
    tagline: 'The Eternal City',
    image: 'https://picsum.photos/seed/rome/800/600',
    description: 'Where ancient history meets modern vibrant life.'
  },
  {
    id: 'milan',
    name: 'Milan',
    tagline: 'Fashion & Design',
    image: 'https://picsum.photos/seed/milan/800/600',
    description: 'The sophisticated heart of Italian commerce and style.'
  },
  {
    id: 'florence',
    name: 'Florence',
    tagline: 'Cradle of Renaissance',
    image: 'https://picsum.photos/seed/florence/800/600',
    description: 'An open-air museum of art and architectural wonders.'
  }
];

export default function App() {
  const [view, setView] = useState<'home' | 'dashboard' | 'checkout' | 'hotels' | 'restaurants' | 'tours' | 'taxi' | 'experiences' | 'rentals' | 'events'>('home');
  const [user, setUser] = useState<any>(null);
  const [lang, setLang] = useState('it');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [basket, setBasket] = useState<any[]>([]);
  const [showBasket, setShowBasket] = useState(false);
  const [favorites, setFavorites] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [infoModal, setInfoModal] = useState<{ title: string, content: string } | null>(null);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.it;

  const addToBasket = (item: any) => {
    setBasket(prev => [...prev, { ...item, basketId: Math.random().toString(36).substr(2, 9) }]);
  };

  const removeFromBasket = (basketId: string) => {
    setBasket(prev => prev.filter(item => item.basketId !== basketId));
  };

  const basketTotal = basket.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (item: any) => {
    const isFav = favorites.some(f => f.id === item.id);
    if (isFav) {
      setFavorites(prev => prev.filter(f => f.id !== item.id));
    } else {
      setFavorites(prev => [...prev, item]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-40 bg-nav backdrop-blur-md border-b border-border px-6 py-4 flex justify-between items-center transition-colors">
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 text-ink/60 hover:bg-paper/50 rounded-full transition-colors"
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <div className="w-8 h-8 bg-ink rounded-lg flex items-center justify-center text-paper font-display font-bold shrink-0">I</div>
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-ink whitespace-nowrap">ItaliaGo</span>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-4 xl:gap-8 text-[10px] xl:text-xs font-bold uppercase tracking-widest text-ink/60">
          <button onClick={() => setView('hotels')} className={`hover:text-ink transition-colors ${view === 'hotels' ? 'text-ink' : ''}`}>{t.hotels}</button>
          <button onClick={() => setView('restaurants')} className={`hover:text-ink transition-colors ${view === 'restaurants' ? 'text-ink' : ''}`}>{t.restaurants}</button>
          <button onClick={() => setView('experiences')} className={`hover:text-ink transition-colors ${view === 'experiences' ? 'text-ink' : ''}`}>{t.experiences}</button>
          <button onClick={() => setView('tours')} className={`hover:text-ink transition-colors ${view === 'tours' ? 'text-ink' : ''}`}>{t.tours}</button>
          <button onClick={() => setView('rentals')} className={`hover:text-ink transition-colors ${view === 'rentals' ? 'text-ink' : ''}`}>{t.rentals}</button>
          <button onClick={() => setView('events')} className={`hover:text-ink transition-colors ${view === 'events' ? 'text-ink' : ''}`}>{t.events}</button>
          <button onClick={() => setView('taxi')} className={`hover:text-ink transition-colors ${view === 'taxi' ? 'text-ink' : ''}`}>{t.taxi}</button>
        </div>

        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="fixed top-[73px] left-0 w-64 h-[calc(100vh-73px)] bg-card border-r border-border p-6 flex flex-col gap-6 z-50 lg:hidden"
            >
              <button onClick={() => { setView('hotels'); setShowMobileMenu(false); }} className="text-left text-sm font-bold uppercase tracking-widest text-ink">{t.hotels}</button>
              <button onClick={() => { setView('restaurants'); setShowMobileMenu(false); }} className="text-left text-sm font-bold uppercase tracking-widest text-ink">{t.restaurants}</button>
              <button onClick={() => { setView('experiences'); setShowMobileMenu(false); }} className="text-left text-sm font-bold uppercase tracking-widest text-ink">{t.experiences}</button>
              <button onClick={() => { setView('tours'); setShowMobileMenu(false); }} className="text-left text-sm font-bold uppercase tracking-widest text-ink">{t.tours}</button>
              <button onClick={() => { setView('rentals'); setShowMobileMenu(false); }} className="text-left text-sm font-bold uppercase tracking-widest text-ink">{t.rentals}</button>
              <button onClick={() => { setView('events'); setShowMobileMenu(false); }} className="text-left text-sm font-bold uppercase tracking-widest text-ink">{t.events}</button>
              <button onClick={() => { setView('taxi'); setShowMobileMenu(false); }} className="text-left text-sm font-bold uppercase tracking-widest text-ink">{t.taxi}</button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowBasket(!showBasket)}
              className="relative p-2 rounded-full border border-border hover:bg-paper transition-colors text-ink"
            >
              <ShoppingBag size={18} />
              {basket.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {basket.length}
                </span>
              )}
            </button>
            
            <AnimatePresence>
              {showBasket && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-border flex justify-between items-center">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-ink">{t.basket}</h3>
                    <button onClick={() => setShowBasket(false)} className="text-ink"><X size={16} /></button>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-4 space-y-4">
                    {basket.length === 0 ? (
                      <p className="text-center text-ink/40 py-8 italic text-sm">{t.emptyBasket}</p>
                    ) : (
                      basket.map((item) => (
                        <div key={item.basketId} className="flex gap-3 group">
                          <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />
                          <div className="flex-1">
                            <h4 className="text-xs font-bold text-ink">{item.name}</h4>
                            <p className="text-[10px] text-ink/40">{item.location}</p>
                            <p className="text-xs font-bold mt-1 text-ink">€{item.price}</p>
                          </div>
                          <button 
                            onClick={() => removeFromBasket(item.basketId)}
                            className="text-ink/20 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  {basket.length > 0 && (
                    <div className="p-4 bg-paper/30 border-t border-border space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{t.total}</span>
                        <span className="text-xl font-display text-ink">€{basketTotal.toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={() => { setView('checkout'); setShowBasket(false); }}
                        className="w-full btn-luxury py-3 text-xs"
                      >
                        {t.checkout}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border hover:bg-paper transition-colors text-sm text-ink"
            >
              <Globe size={14} />
              <span>{LANGUAGES.find(l => l.code === lang)?.flag}</span>
            </button>
            
            <AnimatePresence>
              {showLangMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden z-50"
                >
                  <div className="p-2 space-y-1">
                    {LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setShowLangMenu(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-colors ${lang === l.code ? 'bg-gold text-white' : 'text-ink hover:bg-paper'}`}
                      >
                        <span>{l.flag}</span>
                        <span className="font-medium">{l.name}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            {user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => setView('dashboard')}
                className="flex items-center gap-2 p-1 sm:px-4 sm:py-2 rounded-full border border-border hover:bg-paper transition-colors"
              >
                <div className="w-8 h-8 sm:w-6 sm:h-6 bg-gold rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                  {user.name.split(' ').map((n: any) => n[0]).join('')}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-ink truncate max-w-[100px]">{user.name}</span>
              </button>
              <button 
                onClick={() => setUser(null)}
                className="p-2 text-ink/40 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="btn-luxury text-[10px] sm:text-sm px-4 py-2 sm:px-6 sm:py-3">Sign In</button>
          )}
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-20">
        {view === 'home' && <HomeView setView={setView} t={t} lang={lang} setInfoModal={setInfoModal} />}
        {view === 'dashboard' && <DashboardView user={user} t={t} favorites={favorites} onRemoveFavorite={toggleFavorite} />}
        {view === 'checkout' && <CheckoutView setView={setView} basket={basket} basketTotal={basketTotal} onPaymentSuccess={() => setBasket([])} />}
        {view === 'hotels' && <ListView items={HOTELS} type="hotel" title={t.hotels} t={t} lang={lang} onAddToBasket={addToBasket} favorites={favorites} onToggleFavorite={toggleFavorite} />}
        {view === 'restaurants' && <ListView items={RESTAURANTS} type="restaurant" title={t.restaurants} t={t} lang={lang} onAddToBasket={addToBasket} favorites={favorites} onToggleFavorite={toggleFavorite} />}
        {view === 'experiences' && <ListView items={EXPERIENCES} type="experience" title={t.experiences} t={t} lang={lang} onAddToBasket={addToBasket} favorites={favorites} onToggleFavorite={toggleFavorite} />}
        {view === 'tours' && <ListView items={TOURS} type="tour" title={t.tours} t={t} lang={lang} onAddToBasket={addToBasket} favorites={favorites} onToggleFavorite={toggleFavorite} />}
        {view === 'rentals' && <ListView items={RENTALS} type="rental" title={t.rentals} t={t} lang={lang} onAddToBasket={addToBasket} favorites={favorites} onToggleFavorite={toggleFavorite} />}
        {view === 'events' && <ListView items={EVENTS} type="event" title={t.events} t={t} lang={lang} onAddToBasket={addToBasket} favorites={favorites} onToggleFavorite={toggleFavorite} />}
        {view === 'taxi' && <TaxiView t={t} lang={lang} />}
      </main>

      <footer className="bg-ink text-paper py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h3 className="font-display text-2xl">ItaliaGo</h3>
            <p className="text-paper/60 text-sm leading-relaxed">
              Crafting unforgettable Italian experiences through technology and heritage.
            </p>
            <div className="pt-4 h-48 rounded-2xl overflow-hidden border border-border">
              <iframe 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                loading="lazy" 
                allowFullScreen 
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.142293761308!2d12.4963655!3d41.8902102!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x132f61b6532013ad%3A0x72f0ab10a0506514!2sColosseum!5e0!3m2!1sen!2sit!4v1620000000000!5m2!1sen!2sit"
              ></iframe>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest mb-6 text-gold">Explore</h4>
            <ul className="space-y-3 text-sm text-paper/60">
              <li><button onClick={() => { setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-paper">Destinations</button></li>
              <li><button onClick={() => setView('hotels')} className="hover:text-paper">Luxury Stays</button></li>
              <li><button onClick={() => setView('experiences')} className="hover:text-paper">Culinary Tours</button></li>
              <li><button onClick={() => setView('taxi')} className="hover:text-paper">Private Transport</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest mb-6 text-gold">Support</h4>
            <ul className="space-y-3 text-sm text-paper/60">
              <li><button onClick={() => setShowAI(true)} className="hover:text-paper">Help Center</button></li>
              <li><button onClick={() => setInfoModal({ title: 'Safety Info', content: 'Your safety is our priority. We work with certified partners and provide 24/7 support during your Italian journey.' })} className="hover:text-paper">Safety Info</button></li>
              <li><button onClick={() => setInfoModal({ title: 'Refund Policy', content: 'Cancellations made 48 hours before the scheduled experience are eligible for a full refund.' })} className="hover:text-paper">Refund Policy</button></li>
              <li><button onClick={() => setShowAI(true)} className="hover:text-paper">Contact Us</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest mb-6 text-gold">Newsletter</h4>
            <div className="flex gap-2">
              <input type="email" placeholder="Email" className="bg-paper/10 border-none rounded-full px-4 py-2 text-sm w-full outline-none focus:ring-1 focus:ring-gold" />
              <button 
                onClick={() => alert('Thank you for joining our newsletter!')}
                className="bg-gold text-ink px-4 py-2 rounded-full text-sm font-bold"
              >
                Join
              </button>
            </div>
            
            <div className="mt-8 pt-8 border-t border-border">
              <h4 className="font-bold text-[10px] uppercase tracking-widest mb-4 text-gold">Language</h4>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={`px-3 py-1 rounded-full border text-[10px] font-bold transition-all ${lang === l.code ? 'bg-gold border-gold text-white' : 'border-border text-paper/60 hover:border-paper'}`}
                  >
                    {l.flag} {l.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-paper/40">
          <p>© 2026 ItaliaGo. All rights reserved.</p>
          <div className="flex gap-6">
            <button onClick={() => setInfoModal({ title: 'Privacy Policy', content: 'We value your privacy. Your data is encrypted and never shared with third parties without your consent.' })} className="hover:text-paper">Privacy Policy</button>
            <button onClick={() => setInfoModal({ title: 'Terms of Service', content: 'By using ItaliaGo, you agree to our terms of providing luxury travel concierge services.' })} className="hover:text-paper">Terms of Service</button>
            <button onClick={() => setInfoModal({ title: 'Cookie Policy', content: 'We use cookies to enhance your experience and provide personalized travel recommendations.' })} className="hover:text-paper">Cookie Policy</button>
          </div>
        </div>
      </footer>

      <AIConcierge isOpen={showAI} setIsOpen={setShowAI} />
      
      <AnimatePresence>
        {infoModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInfoModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-card rounded-[2rem] overflow-hidden shadow-2xl p-8 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-display italic text-ink">{infoModal.title}</h2>
                <button onClick={() => setInfoModal(null)} className="p-2 hover:bg-paper rounded-full transition-colors text-ink">
                  <X size={20} />
                </button>
              </div>
              <p className="text-ink/70 leading-relaxed">
                {infoModal.content}
              </p>
              <button 
                onClick={() => setInfoModal(null)}
                className="w-full btn-luxury py-4"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
        {showAuthModal && (
          <AuthModal 
            onClose={() => setShowAuthModal(false)} 
            onSuccess={(userData) => {
              setUser(userData);
              setShowAuthModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function HomeView({ setView, t, lang, setInfoModal }: { setView: any, t: any, lang: string, setInfoModal: any }) {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <img 
          src="https://picsum.photos/seed/italy-hero/1920/1080" 
          alt="Italy" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white space-y-6 px-6 max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl md:text-8xl font-display italic leading-tight"
          >
            {t.discover}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl font-light tracking-wide opacity-90"
          >
            {t.companion}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-8"
          >
            <button 
              onClick={() => {
                const el = document.getElementById('services');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }} 
              className="px-10 py-4 bg-ink text-paper rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl"
            >
              {t.start}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="max-w-7xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
        {[
          { icon: Hotel, label: t.hotels, color: 'bg-blue-50 dark:bg-blue-900/20', view: 'hotels' },
          { icon: Utensils, label: t.restaurants, color: 'bg-orange-50 dark:bg-orange-900/20', view: 'restaurants' },
          { icon: Sparkles, label: t.experiences, color: 'bg-yellow-50 dark:bg-yellow-900/20', view: 'experiences' },
          { icon: Compass, label: t.tours, color: 'bg-emerald-50 dark:bg-emerald-900/20', view: 'tours' },
          { icon: Car, label: t.rentals, color: 'bg-red-50 dark:bg-red-900/20', view: 'rentals' },
          { icon: MapIcon, label: t.taxi, color: 'bg-purple-50 dark:bg-purple-900/20', view: 'taxi' },
        ].map((item, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            onClick={() => setView(item.view as any)}
            className="luxury-card p-8 flex flex-col items-center text-center space-y-4 cursor-pointer"
          >
            <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center text-ink`}>
              <item.icon size={32} />
            </div>
            <h3 className="font-bold text-lg uppercase tracking-widest text-ink">{item.label}</h3>
          </motion.div>
        ))}
      </section>

      {/* Destinations */}
      <section className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-display italic text-ink">{t.featured}</h2>
            <p className="text-ink/60 italic">Handpicked escapes for the discerning traveler.</p>
          </div>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="btn-outline flex items-center gap-2">
            View All <ArrowRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {DESTINATIONS.map((dest, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.02 }}
              className="group relative h-[500px] rounded-3xl overflow-hidden shadow-lg cursor-pointer"
            >
              <img src={dest.image} alt={dest.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 p-8 text-white space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{dest.tagline}</span>
                <h3 className="text-3xl font-display">{dest.name}</h3>
                <p className="text-sm opacity-80 font-light leading-relaxed">
                  <TranslatedText text={dest.description} lang={lang} />
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stories */}
      <section className="bg-paper py-24 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-display italic">{t.stories}</h2>
            <p className="text-ink/60 italic max-w-2xl mx-auto">Discover Italy through the eyes of fellow travelers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {STORIES.map((story) => (
              <motion.div 
                key={story.id}
                className="space-y-6 group cursor-pointer"
              >
                <div className="aspect-[4/5] overflow-hidden rounded-3xl">
                  <img src={story.image} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gold">By {story.author}</p>
                  <h3 className="text-2xl font-display italic group-hover:text-gold transition-colors">{story.title}</h3>
                  <p className="text-sm text-ink/60 leading-relaxed line-clamp-3">
                    <TranslatedText text={story.excerpt} lang={lang} />
                  </p>
                  <button 
                    onClick={() => setInfoModal({ title: story.title, content: story.excerpt + " ... Full story coming soon to ItaliaGo Magazine." })}
                    className="text-sm font-bold flex items-center gap-2 group-hover:gap-4 transition-all"
                  >
                    Read More <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-ink rounded-[3rem] p-12 md:p-24 text-center text-white space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img src="https://picsum.photos/seed/newsletter-bg/1920/1080" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-display italic">Join the Inner Circle</h2>
            <p className="text-white/60 text-lg font-light">Receive exclusive offers, travel tips, and early access to new experiences.</p>
            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <input type="email" placeholder="Your email address" className="flex-1 bg-white/10 border border-white/20 rounded-full px-8 py-4 outline-none focus:ring-2 focus:ring-gold transition-all" />
              <button 
                onClick={() => alert('Thank you for subscribing!')}
                className="btn-luxury px-12 py-4"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DashboardView({ user, t, favorites, onRemoveFavorite }: { user: any, t: any, favorites: any[], onRemoveFavorite: (item: any) => void }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'favorites'>('bookings');

  useEffect(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => setBookings(data));
  }, []);

  if (!user) return <div className="p-20 text-center text-ink/60">Loading your dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl text-ink">Bentornato, {user.name}</h1>
          <p className="text-ink/60">Manage your bookings and rewards.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col items-center min-w-[150px]">
            <span className="text-xs font-bold uppercase tracking-widest text-ink/40 mb-1">{t.wallet}</span>
            <span className="text-2xl font-display text-ink">€{user.wallet_balance.toFixed(2)}</span>
          </div>
          <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col items-center min-w-[150px]">
            <span className="text-xs font-bold uppercase tracking-widest text-ink/40 mb-1">{t.bonus}</span>
            <span className="text-2xl font-display text-gold">{user.bonus}</span>
          </div>
        </div>
      </div>

      <div className="flex border-b border-border">
        <button 
          onClick={() => setActiveTab('bookings')}
          className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'bookings' ? 'border-gold text-ink' : 'border-transparent text-ink/40'}`}
        >
          Bookings
        </button>
        <button 
          onClick={() => setActiveTab('favorites')}
          className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'favorites' ? 'border-gold text-ink' : 'border-transparent text-ink/40'}`}
        >
          Favorites ({favorites.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'bookings' ? (
            <>
              <h2 className="text-2xl font-display italic text-ink">Recent Bookings</h2>
              <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[600px]">
                    <thead>
                      <tr className="bg-paper/50 text-[10px] font-bold uppercase tracking-widest text-ink/40">
                        <th className="px-6 py-4">Service</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {bookings.map((booking, i) => (
                        <tr key={i} className="hover:bg-paper/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-paper rounded-lg flex items-center justify-center text-ink">
                                {booking.type === 'hotel' && <Hotel size={14} />}
                                {booking.type === 'restaurant' && <Utensils size={14} />}
                                {booking.type === 'taxi' && <Car size={14} />}
                                {booking.type === 'tour' && <Compass size={14} />}
                              </div>
                              <div>
                                <p className="font-bold text-sm text-ink">{booking.item_name}</p>
                                <p className="text-[10px] text-ink/40 uppercase tracking-widest">{booking.type}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-ink/60">
                            {new Date(booking.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-sm text-ink">
                            €{booking.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-ink/40 italic">
                            No bookings found. Start exploring!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-display italic text-ink">Your Favorites</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {favorites.map((item, i) => (
                  <div key={i} className="luxury-card group">
                    <div className="h-48 overflow-hidden relative">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <button 
                        onClick={() => onRemoveFavorite(item)}
                        className="absolute top-4 right-4 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="p-4 space-y-2 bg-card">
                      <h3 className="font-display text-lg text-ink">{item.name}</h3>
                      <p className="text-xs text-ink/60 flex items-center gap-1">
                        <MapPin size={10} /> {item.location}
                      </p>
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-sm text-ink">€{item.price}</span>
                        <div className="flex gap-1">
                          {Array.from({ length: item.stars }).map((_, j) => (
                            <Star key={j} size={8} fill="currentColor" className="text-gold" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {favorites.length === 0 && (
                  <div className="col-span-full py-20 text-center space-y-4">
                    <Heart size={48} className="mx-auto text-ink/10" />
                    <p className="text-ink/40 italic">You haven't added any favorites yet.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl text-ink">Special Offers</h2>
          <div className="space-y-4">
            {[
              { title: 'Venice Gondola Tour', discount: '15% OFF', image: 'https://picsum.photos/seed/venice/400/300' },
              { title: 'Tuscany Wine Tasting', discount: 'Points Booster', image: 'https://picsum.photos/seed/tuscany/400/300' },
            ].map((offer, i) => (
              <div key={i} className="luxury-card group cursor-pointer">
                <div className="h-40 overflow-hidden">
                  <img src={offer.image} alt={offer.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-4 flex justify-between items-center bg-card">
                  <div>
                    <h4 className="font-bold text-sm text-ink">{offer.title}</h4>
                    <p className="text-xs text-gold font-bold">{offer.discount}</p>
                  </div>
                  <ArrowRight size={16} className="text-ink/20 group-hover:text-ink transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutView({ setView, basket, basketTotal, onPaymentSuccess }: { setView: any, basket: any[], basketTotal: number, onPaymentSuccess: () => void }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate API call for each item
    for (const item of basket) {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: item.type || 'experience',
          itemName: item.name,
          details: `${item.location} - ${item.duration || 'Booking'}`,
          amount: item.price
        })
      });
    }
    
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      onPaymentSuccess();
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-6">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto"
        >
          <Star size={40} />
        </motion.div>
        <h1 className="text-4xl font-display italic text-ink">Payment Successful!</h1>
        <p className="text-ink/60">Your bookings are confirmed. We've sent the details to your email.</p>
        <div className="pt-8 flex gap-4 justify-center">
          <button onClick={() => setView('dashboard')} className="btn-luxury">Go to Dashboard</button>
          <button onClick={() => setView('home')} className="btn-outline">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-display italic text-ink">Complete Your Booking</h1>
            <p className="text-ink/60">Secure payment via Stripe or PayPal.</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-widest text-ink/40">Payment Method</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <button className="p-4 border-2 border-ink rounded-2xl flex flex-col items-center gap-2">
                  <div className="w-8 h-8 bg-ink rounded-full" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink">Card</span>
                </button>
                <button className="p-4 border border-border rounded-2xl flex flex-col items-center gap-2 opacity-50">
                  <div className="w-8 h-8 bg-blue-600 rounded-full" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink">PayPal</span>
                </button>
                <button className="p-4 border border-border rounded-2xl flex flex-col items-center gap-2 opacity-50">
                  <div className="w-8 h-8 bg-gold rounded-full" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink">Wallet</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-widest text-ink/40">Card Details</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Cardholder Name" className="w-full bg-paper/50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-ink text-ink" />
                <input type="text" placeholder="Card Number" className="w-full bg-paper/50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-ink text-ink" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="MM/YY" className="bg-paper/50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-ink text-ink" />
                  <input type="text" placeholder="CVC" className="bg-paper/50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-ink text-ink" />
                </div>
              </div>
            </div>

            <button 
              onClick={handlePayment}
              disabled={isProcessing || basket.length === 0}
              className="w-full btn-luxury h-14 flex items-center justify-center gap-3"
            >
              {isProcessing ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>Pay €{basketTotal.toFixed(2)}</>
              )}
            </button>
            <p className="text-center text-[10px] text-ink/40 uppercase tracking-widest">
              Secure SSL Encryption • PCI-DSS Compliant
            </p>
          </div>
        </div>

        <div className="lg:sticky lg:top-32 h-fit space-y-8">
          <div className="bg-card rounded-3xl p-8 border border-border shadow-sm space-y-6">
            <h3 className="text-xl font-display text-ink">Booking Summary</h3>
            <div className="space-y-4">
              <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                {basket.map((item) => (
                  <div key={item.basketId} className="flex gap-4 pb-4 border-b border-border last:border-0">
                    <img src={item.image} className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-ink">{item.name}</h4>
                      <p className="text-[10px] text-ink/60">{item.location} • {item.duration || 'Experience'}</p>
                      <div className="flex items-center gap-1 text-gold mt-1">
                        <Star size={8} fill="currentColor" />
                        <Star size={8} fill="currentColor" />
                        <Star size={8} fill="currentColor" />
                        <Star size={8} fill="currentColor" />
                        <Star size={8} fill="currentColor" />
                      </div>
                    </div>
                    <span className="font-bold text-sm text-ink">€{item.price}</span>
                  </div>
                ))}
                {basket.length === 0 && (
                  <p className="text-center text-ink/40 py-8 italic">Your basket is empty.</p>
                )}
              </div>
              
              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-ink/60">Subtotal</span>
                  <span className="text-ink">€{basketTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink/60">Service Fee</span>
                  <span className="text-emerald-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink/60">Taxes</span>
                  <span className="text-emerald-600">Included</span>
                </div>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-border">
                <span className="text-xs font-bold uppercase tracking-widest text-ink/40">Total Amount</span>
                <span className="text-3xl font-display text-ink">€{basketTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gold/5 rounded-3xl p-6 border border-gold/10 flex items-center gap-4">
            <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center text-gold">
              <Sparkles size={24} />
            </div>
            <div>
              <p className="font-bold text-sm text-ink">Earn {Math.floor(basketTotal)} Points</p>
              <p className="text-xs text-ink/60">Use them for future discounts or upgrades.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewsSection({ itemId, t, lang }: { itemId: string, t: any, lang: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews/${itemId}`)
      .then(res => res.json())
      .then(data => setReviews(data));
  }, [itemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, rating, comment })
      });
      const newReview = await res.json();
      setReviews(prev => [newReview, ...prev]);
      setComment('');
      setRating(5);
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pt-6 border-t border-border">
      <h3 className="text-xl font-display text-ink">{t.reviews}</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-paper/30 p-4 rounded-2xl">
        <h4 className="text-xs font-bold uppercase tracking-widest text-ink/40">{t.leaveReview}</h4>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => setRating(num)}
              className={`p-1 transition-colors ${rating >= num ? 'text-gold' : 'text-ink/20'}`}
            >
              <Star size={20} fill={rating >= num ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t.comment}
          className="w-full bg-card border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-gold text-ink min-h-[100px]"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-luxury w-full py-2 text-xs disabled:opacity-50"
        >
          {isSubmitting ? '...' : t.submit}
        </button>
      </form>

      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {reviews.length === 0 ? (
          <p className="text-sm text-ink/40 italic">{t.noReviews}</p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="space-y-2 pb-4 border-b border-border last:border-0">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-ink">{review.user_name}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      fill={review.rating > i ? 'currentColor' : 'none'}
                      className={review.rating > i ? 'text-gold' : 'text-ink/20'}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-ink/60 leading-relaxed">
                <TranslatedText text={review.comment} lang={lang} />
              </p>
              <p className="text-[10px] text-ink/30">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ListView({ items, type, title, t, lang, onAddToBasket, favorites, onToggleFavorite }: { items: any[], type: string, title: string, t: any, lang: string, onAddToBasket: (item: any) => void, favorites: any[], onToggleFavorite: (item: any) => void }) {
  const [filter, setFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const locations = ['all', ...Array.from(new Set(items.map(item => item.location)))];
  const priceLevels = ['all', 'low', 'medium', 'high'];
  const starLevels = ['all', 3, 4, 5];

  const filteredItems = items.filter(item => {
    const locMatch = filter === 'all' || item.location === filter;
    const priceMatch = priceFilter === 'all' || item.priceLevel === priceFilter;
    const starMatch = starFilter === 'all' || item.stars === starFilter;
    return locMatch && priceMatch && starMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display italic text-ink">{title}</h1>
          <p className="text-sm text-ink/60 italic">Curated selections for an authentic Italian experience.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2 sm:gap-4 bg-card p-2 rounded-2xl sm:rounded-full border border-border shadow-sm w-full sm:w-auto overflow-x-auto">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 px-2 sm:px-4 whitespace-nowrap">{t.filter}</span>
            <div className="flex gap-1">
              {locations.map(loc => (
                <button
                  key={loc}
                  onClick={() => setFilter(loc)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    filter === loc 
                      ? 'bg-ink text-white' 
                      : 'hover:bg-paper text-ink/60'
                  }`}
                >
                  {loc === 'all' ? t.all : loc}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 bg-card p-2 rounded-full border border-border shadow-sm">
            <span className="text-xs font-bold uppercase tracking-widest text-ink/40 px-4">{t.priceRange}</span>
            <div className="flex gap-1">
              {priceLevels.map(level => (
                <button
                  key={level}
                  onClick={() => setPriceFilter(level)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    priceFilter === level 
                      ? 'bg-gold text-white' 
                      : 'hover:bg-paper text-ink/60'
                  }`}
                >
                  {level === 'all' ? t.all : t[level]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 bg-card p-2 rounded-full border border-border shadow-sm">
            <span className="text-xs font-bold uppercase tracking-widest text-ink/40 px-4">{t.rating}</span>
            <div className="flex gap-1">
              {starLevels.map(level => (
                <button
                  key={level}
                  onClick={() => setStarFilter(level as any)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                    starFilter === level 
                      ? 'bg-gold text-white' 
                      : 'hover:bg-paper text-ink/60'
                  }`}
                >
                  {level === 'all' ? t.all : (
                    <>
                      {level} <Star size={10} fill="currentColor" />
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredItems.map((item, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -10 }}
            className="luxury-card group cursor-pointer"
          >
            <div className="h-64 overflow-hidden relative">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <div className="bg-card/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1">
                  {Array.from({ length: item.stars }).map((_, j) => (
                    <Star key={j} size={10} fill="currentColor" className="text-gold" />
                  ))}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(item); }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    favorites.some(f => f.id === item.id) 
                      ? 'bg-red-500 text-white' 
                      : 'bg-card/90 backdrop-blur text-ink/40 hover:text-red-500'
                  }`}
                >
                  <Heart size={14} fill={favorites.some(f => f.id === item.id) ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4 bg-card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-display text-ink">{item.name}</h3>
                  <p className="text-sm text-ink/60 flex items-center gap-1">
                    <MapPin size={12} /> {item.location}
                  </p>
                </div>
                {item.price && <span className="font-bold text-ink">€{item.price}</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelectedItem(item)} className="flex-1 btn-outline text-xs py-2">{t.more}</button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onAddToBasket(item); }}
                  className="flex-1 btn-luxury text-xs py-2"
                >
                  {t.addToBasket}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-card rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-card/80 backdrop-blur rounded-full flex items-center justify-center text-ink hover:bg-card transition-colors z-10"
              >
                <X size={20} />
              </button>
              
              <div className="overflow-y-auto flex-1">
                <div className="h-64 overflow-hidden">
                  <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="p-8 space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-display text-ink">{selectedItem.name}</h2>
                    <p className="text-ink/60 flex items-center gap-1">
                      <MapPin size={14} /> {selectedItem.location}
                    </p>
                  </div>
                  {selectedItem.price && <span className="text-2xl font-display text-ink">€{selectedItem.price}</span>}
                </div>
                
                <div className="space-y-4">
                  <p className="text-ink/80 leading-relaxed">
                    <TranslatedText text={selectedItem.description} lang={lang} />
                  </p>
                  
                  {selectedItem.amenities && (
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.amenities.map((a: string) => (
                        <span key={a} className="px-3 py-1 bg-paper rounded-full text-[10px] font-bold uppercase tracking-widest text-ink/40">
                          <TranslatedText text={a} lang={lang} />
                        </span>
                      ))}
                    </div>
                  )}

                  {selectedItem.highlights && (
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.highlights.map((h: string) => (
                        <span key={h} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                          <TranslatedText text={h} lang={lang} />
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-ink/40 mb-2">Heritage & Info</h4>
                    <p className="text-sm text-ink/60 italic leading-relaxed">
                      <TranslatedText text={selectedItem.history || selectedItem.info || ''} lang={lang} />
                    </p>
                  </div>

                  {(type === 'hotel' || type === 'restaurant') && (
                    <ReviewsSection itemId={selectedItem.id} t={t} lang={lang} />
                  )}

                  <div className="pt-6">
                    <button 
                      onClick={() => { onAddToBasket(selectedItem); setSelectedItem(null); }}
                      className="w-full btn-luxury py-4"
                    >
                      {t.addToBasket}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </div>
  );
}

function TaxiView({ t, lang }: { t: any, lang: string }) {
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [pickup, setPickup] = useState('Piazza del Popolo, Roma');
  const [destination, setDestination] = useState('');
  const [selectedCar, setSelectedCar] = useState<number>(0);
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [isRequesting, setIsRequesting] = useState(false);
  const [rideStatus, setRideStatus] = useState<'idle' | 'searching' | 'enroute' | 'arrived'>('idle');
  const [estimate, setEstimate] = useState<{ cost: number, time: number, traffic: string, distance: string } | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    }, (err) => {
      console.error("Geolocation error:", err);
      // Fallback to Rome
      setCoords({ lat: 41.9028, lng: 12.4964 });
    });
  }, []);

  const VEHICLES = [
    { id: 0, company: 'Roma Elite Transports', name: 'Mercedes S-Class', type: 'Luxury Sedan', basePrice: 45, multiplier: 1.5, stars: 5, image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=200' },
    { id: 1, company: 'Prestige Italia', name: 'Range Rover Vogue', type: 'Luxury SUV', basePrice: 60, multiplier: 1.8, stars: 5, image: 'https://images.unsplash.com/photo-1541443131876-44b03de101c5?auto=format&fit=crop&q=80&w=200' },
    { id: 2, company: 'Veloce Luxury', name: 'Maserati Quattroporte', type: 'Sport Luxury', basePrice: 80, multiplier: 2.2, stars: 4, image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=200' },
    { id: 3, company: 'City Cab Roma', name: 'Toyota Prius', type: 'Economy Hybrid', basePrice: 15, multiplier: 0.8, stars: 3, image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=200' },
    { id: 4, company: 'EcoTravel Italy', name: 'Nissan Leaf', type: 'Electric Compact', basePrice: 20, multiplier: 0.9, stars: 3, image: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&q=80&w=200' },
    { id: 5, company: 'Standard Transports', name: 'Volkswagen Passat', type: 'Standard Sedan', basePrice: 25, multiplier: 1.0, stars: 3, image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=200' },
  ];

  const filteredVehicles = VEHICLES.filter(v => starFilter === 'all' || v.stars === starFilter);

  const handleDestinationChange = (val: string) => {
    setDestination(val);
    if (val.length > 3) {
      const dist = (val.length * 0.4).toFixed(1);
      const trafficLevels = ['Low', 'Moderate', 'Heavy'];
      const traffic = trafficLevels[Math.floor(Math.random() * trafficLevels.length)];
      const trafficMult = traffic === 'Heavy' ? 1.6 : (traffic === 'Moderate' ? 1.2 : 1);
      const car = VEHICLES[selectedCar];
      
      setEstimate({
        distance: `${dist} km`,
        cost: (car.basePrice + parseFloat(dist) * car.multiplier) * trafficMult,
        time: Math.round(parseFloat(dist) * 3 * trafficMult),
        traffic
      });
    } else {
      setEstimate(null);
    }
  };

  const handleRequest = () => {
    if (!destination) return;
    setIsRequesting(true);
    setRideStatus('searching');
    setTimeout(() => setRideStatus('enroute'), 2500);
    setTimeout(() => setRideStatus('arrived'), 8000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-display italic text-ink">
            <TranslatedText text="Private Transport" lang={lang} />
          </h1>
          <p className="text-ink/60 italic">
            <TranslatedText text="Luxury travel at your fingertips." lang={lang} />
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-card p-2 rounded-full border border-border shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 px-4 whitespace-nowrap">{t.rating}</span>
            <div className="flex gap-1">
              {['all', 3, 4, 5].map(level => (
                <button
                  key={level}
                  onClick={() => setStarFilter(level as any)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                    starFilter === level 
                      ? 'bg-gold text-white' 
                      : 'hover:bg-paper text-ink/60'
                  }`}
                >
                  {level === 'all' ? t.all : (
                    <>
                      {level} <Star size={10} fill="currentColor" />
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={handleRequest}
            disabled={!destination || isRequesting}
            className={`flex-1 md:flex-none btn-luxury px-10 ${(!destination || isRequesting) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRequesting ? 'Requesting...' : 'Request Now'}
          </button>
          <button className="flex-1 md:flex-none btn-outline px-10">Schedule</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">Pickup Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" size={18} />
                  <input 
                    type="text" 
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full bg-paper/50 border-none rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-1 focus:ring-gold text-ink transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-4">Destination</label>
                <div className="relative">
                  <Compass className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" size={18} />
                  <input 
                    type="text" 
                    placeholder="Where to?"
                    value={destination}
                    onChange={(e) => handleDestinationChange(e.target.value)}
                    className="w-full bg-paper/50 border-none rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-1 focus:ring-gold text-ink transition-all"
                  />
                </div>
              </div>
            </div>

            {estimate && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-6 pt-4 border-t border-border"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Est. Cost</span>
                  <span className="text-xl font-display text-gold">€{estimate.cost.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Est. Time</span>
                  <span className="text-xl font-display text-ink">{estimate.time} mins</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Distance</span>
                  <span className="text-xl font-display text-ink">{estimate.distance}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Traffic</span>
                  <span className={`text-xl font-display ${estimate.traffic === 'Heavy' ? 'text-red-500' : estimate.traffic === 'Moderate' ? 'text-orange-500' : 'text-emerald-500'}`}>
                    {estimate.traffic}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          <div className="h-[500px] rounded-[2.5rem] overflow-hidden shadow-lg border border-border relative group">
            <iframe 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              loading="lazy" 
              allowFullScreen 
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15000!2d${coords?.lng || 12.4964}!3d${coords?.lat || 41.9028}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sit!4v1620000000000!5m2!1sen!2sit`}
            ></iframe>
            
            <AnimatePresence>
              {rideStatus !== 'idle' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-8"
                >
                  <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-card p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center space-y-6"
                  >
                    <div className="relative w-20 h-20 mx-auto">
                      <div className="absolute inset-0 bg-gold/20 rounded-full animate-ping" />
                      <div className="relative w-20 h-20 bg-gold rounded-full flex items-center justify-center text-white">
                        {rideStatus === 'searching' ? <Globe className="animate-spin" size={32} /> : <Car size={32} />}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-2xl font-display italic text-ink">
                        {rideStatus === 'searching' && 'Finding your driver...'}
                        {rideStatus === 'enroute' && 'Driver is on the way'}
                        {rideStatus === 'arrived' && 'Driver has arrived!'}
                      </h4>
                      <p className="text-sm text-ink/60">
                        {rideStatus === 'searching' && 'Connecting with premium partners in Roma.'}
                        {rideStatus === 'enroute' && `${VEHICLES[selectedCar].name} is 2 minutes away.`}
                        {rideStatus === 'arrived' && 'Your luxury ride is waiting outside.'}
                      </p>
                    </div>
                    {rideStatus === 'arrived' && (
                      <button 
                        onClick={() => {
                          setIsRequesting(false);
                          setRideStatus('idle');
                          setDestination('');
                        }}
                        className="w-full btn-luxury"
                      >
                        Finish Ride
                      </button>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {!coords && (
              <div className="absolute inset-0 bg-paper/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-ink text-white rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <MapPin size={24} />
                  </div>
                  <p className="font-medium text-ink">Locating you in Italy...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-display italic text-ink">Select Vehicle</h3>
          <div className="space-y-4">
            {filteredVehicles.map((v, i) => (
              <motion.div 
                key={v.id} 
                whileHover={{ x: 5 }}
                onClick={() => setSelectedCar(v.id)}
                className={`luxury-card p-4 flex flex-col gap-4 cursor-pointer transition-all border-2 ${selectedCar === v.id ? 'border-gold shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-paper rounded-xl overflow-hidden">
                      <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-ink">{v.name}</h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gold">
                        <TranslatedText text={v.company} lang={lang} />
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-ink">Base €{v.basePrice}</p>
                    <p className="text-[10px] text-ink/40">
                      <TranslatedText text="Luxury Tier" lang={lang} />
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-[10px] text-ink/60">
                    <TranslatedText text={v.type} lang={lang} />
                  </span>
                  <div className="flex items-center gap-1 text-gold">
                    {Array.from({ length: v.stars }).map((_, j) => (
                      <Star key={j} size={10} fill="currentColor" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredVehicles.length === 0 && (
              <div className="p-8 text-center bg-card rounded-3xl border border-dashed border-border">
                <p className="text-ink/40 italic">No vehicles match your rating criteria.</p>
              </div>
            )}
          </div>

          <div className="bg-ink p-8 rounded-[2rem] text-white space-y-4 shadow-xl">
            <h4 className="text-xl font-display italic">Why ItaliaGo?</h4>
            <ul className="space-y-3 text-sm font-light opacity-80">
              <li className="flex items-center gap-2"><Sparkles size={14} className="text-gold" /> Professional Chauffeurs</li>
              <li className="flex items-center gap-2"><Sparkles size={14} className="text-gold" /> Real-time Tracking</li>
              <li className="flex items-center gap-2"><Sparkles size={14} className="text-gold" /> Complimentary Refreshments</li>
              <li className="flex items-center gap-2"><Sparkles size={14} className="text-gold" /> Multi-lingual Support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: (user: any) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = mode === 'login' ? '/api/login' : '/api/register';
    const body = mode === 'login' ? { email, password } : { email, password, name };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        onSuccess(data);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-card rounded-[2rem] overflow-hidden shadow-2xl p-8 space-y-8"
      >
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-display italic text-ink">
            {mode === 'login' ? 'Welcome Back' : 'Join ItaliaGo'}
          </h2>
          <p className="text-ink/60 text-sm">
            {mode === 'login' ? 'Sign in to access your luxury travel suite.' : 'Create an account for exclusive Italian experiences.'}
          </p>
        </div>

        <div className="flex p-1 bg-paper rounded-full">
          <button 
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-card shadow-sm text-ink' : 'text-ink/40'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${mode === 'register' ? 'bg-card shadow-sm text-ink' : 'text-ink/40'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/20" size={18} />
              <input 
                type="text" 
                placeholder="Full Name" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-paper/50 border-none rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-1 focus:ring-gold text-ink transition-all" 
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/20" size={18} />
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-paper/50 border-none rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-1 focus:ring-gold text-ink transition-all" 
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/20" size={18} />
            <input 
              type="password" 
              placeholder="Password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-paper/50 border-none rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-1 focus:ring-gold text-ink transition-all" 
            />
          </div>

          {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-luxury py-4 flex items-center justify-center gap-3"
          >
            {loading ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <button 
          onClick={onClose}
          className="w-full text-xs font-bold uppercase tracking-widest text-ink/40 hover:text-ink transition-colors"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
}
