export const CATEGORIES = ['Plants', 'Seeds', 'Pots', 'Care'] as const;

export const SAMPLE_PRODUCTS = [
  {
    id: 'p1',
    name: 'Snake Plant Laurentii',
    description: 'A classic indoor plant known for its air-purifying qualities and architectural leaves.',
    price: 1299,
    category: 'Plants',
    images: ['https://images.unsplash.com/photo-1593482892290-f54927ae1cad?q=80&w=800&auto=format&fit=crop'],
    stock: 50,
    tags: ['indoor', 'air-purifying', 'low-maintenance'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'p2',
    name: 'Monstera Deliciosa',
    description: 'The "Swiss Cheese Plant" is a favorite for its large, heart-shaped leaves that develop holes as it matures.',
    price: 1899,
    category: 'Plants',
    images: ['https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=800&auto=format&fit=crop'],
    stock: 30,
    tags: ['indoor', 'statement', 'tropical'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'p3',
    name: 'Terracotta Cylinder Pot',
    description: 'Handmade terracotta pot with a modern cylindrical shape.',
    price: 599,
    category: 'Pots',
    images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop'],
    stock: 100,
    tags: ['handmade', 'minimal'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'p4',
    name: 'Organic Potting Mix',
    description: 'Premium organic potting soil enriched with worm castings and perlite.',
    price: 349,
    category: 'Care',
    images: ['https://images.unsplash.com/photo-1416870233487-a9c268c170bf?q=80&w=800&auto=format&fit=crop'],
    stock: 200,
    tags: ['soil', 'organic'],
    createdAt: new Date().toISOString()
  }
];

export const SAMPLE_STORIES = [
  { id: 's1', url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=1080&auto=format&fit=crop', type: 'image' },
  { id: 's2', url: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=1080&auto=format&fit=crop', type: 'image' },
  { id: 's3', url: 'https://images.unsplash.com/photo-1501004318641-729e8c3986e7?q=80&w=1080&auto=format&fit=crop', type: 'image' }
];

export const SAMPLE_BLOGS = [
  {
    id: 'b1',
    title: 'How to Care for Succulents',
    content: 'Succulents are easy to care for if you know the basics. Sunlight and proper watering are key...',
    author: 'Admin',
    image: 'https://images.unsplash.com/photo-1446071103084-c257b5f70672?q=80&w=800&auto=format&fit=crop',
    createdAt: new Date().toISOString()
  }
];
