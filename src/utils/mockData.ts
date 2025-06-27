import { Book, ReadingGoal, Task, User } from '../types';

// Mock user data
export const mockUser: User = {
  id: '1',
  username: 'bookworm_lover',
  displayName: 'Alexandria',
  pronouns: 'she/her',
  profilePicture: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
  preferredGenres: ['dark romance', 'fantasy smut', 'monster romance'],
  praiseStyle: 'flirty',
  role: 'reader',
  email: 'user@example.com',
  settings: {
    mode: 'nsfw',
    voiceProfile: 'flirty',
    spiceTolerance: 5,
    notifications: {
      readingReminders: true,
      clubUpdates: true,
      achievements: true
    }
  },
  clubs: [],
  createdAt: new Date(),
  dailyReadingGoal: {
    type: 'minutes',
    amount: 45
  }
};

// Mock tasks
export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Read for 45 minutes',
    completed: false,
    createdAt: new Date()
  },
  {
    id: '2',
    title: 'Drink water',
    completed: true,
    createdAt: new Date()
  },
  {
    id: '3',
    title: 'Write book review',
    completed: false,
    createdAt: new Date()
  },
  {
    id: '4',
    title: 'Post on BookTok',
    completed: false,
    createdAt: new Date()
  }
];

// Mock books with ISBN data for Google Books integration
export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'A Court of Thorns and Roses',
    author: 'Sarah J. Maas',
    coverImage: 'https://images.pexels.com/photos/1765033/pexels-photo-1765033.jpeg',
    totalPages: 432,
    currentPage: 256,
    spiceRating: 3,
    tropes: ['enemies to lovers', 'fae', 'slow burn'],
    status: 'currentlyReading',
    spicyScenes: [
      {
        id: '1',
        page: 187,
        rating: 3,
        note: 'First kiss scene'
      },
      {
        id: '2',
        page: 302,
        rating: 4,
        note: 'Steamy scene under the stars'
      }
    ],
    isbn: '9781619634442',
    description: 'When nineteen-year-old huntress Feyre kills a wolf in the woods, a beast-like creature arrives to demand retribution for it.',
    publishedDate: '2015-05-05'
  },
  {
    id: '2',
    title: 'The Love Hypothesis',
    author: 'Ali Hazelwood',
    coverImage: 'https://images.pexels.com/photos/4153150/pexels-photo-4153150.jpeg',
    totalPages: 384,
    currentPage: 384,
    spiceRating: 4,
    tropes: ['fake dating', 'academia', 'grumpy x sunshine'],
    status: 'finished',
    spicyScenes: [
      {
        id: '1',
        page: 240,
        rating: 4,
        note: 'Office scene'
      }
    ],
    isbn: '9780593336823',
    description: 'As a third-year Ph.D. candidate, Olive Smith doesn\'t believe in lasting romantic relationships.',
    publishedDate: '2021-09-14'
  },
  {
    id: '3',
    title: 'Fourth Wing',
    author: 'Rebecca Yarros',
    coverImage: 'https://images.pexels.com/photos/3747139/pexels-photo-3747139.jpeg',
    totalPages: 528,
    currentPage: 0,
    spiceRating: 4,
    tropes: ['fantasy academy', 'enemies to lovers', 'dragons'],
    status: 'wantToRead',
    spicyScenes: [],
    isbn: '9781649374042',
    description: 'Twenty-year-old Violet Sorrengail was supposed to enter the Scribe Quadrant.',
    publishedDate: '2023-05-02'
  },
  {
    id: '4',
    title: 'King of Battle and Blood',
    author: 'Scarlett St. Clair',
    coverImage: 'https://images.pexels.com/photos/6373305/pexels-photo-6373305.jpeg',
    totalPages: 396,
    currentPage: 25,
    spiceRating: 5,
    tropes: ['vampire', 'arranged marriage', 'possessive MMC'],
    status: 'currentlyReading',
    spicyScenes: [
      {
        id: '1',
        page: 12,
        rating: 3,
        note: 'Intense first meeting'
      }
    ],
    isbn: '9781728231570',
    description: 'Their union is his revenge. Isolde de Lara has always been afraid of the vampires that terrorize her country.',
    publishedDate: '2022-09-13'
  },
  {
    id: '5',
    title: 'It Ends with Us',
    author: 'Colleen Hoover',
    coverImage: 'https://images.pexels.com/photos/1765033/pexels-photo-1765033.jpeg',
    totalPages: 384,
    currentPage: 150,
    spiceRating: 3,
    tropes: ['second chance romance', 'contemporary', 'emotional'],
    status: 'currentlyReading',
    spicyScenes: [],
    isbn: '9781501110368',
    description: 'Lily hasn\'t always had it easy, but that\'s never stopped her from working hard for the life she wants.',
    publishedDate: '2016-08-02'
  },
  {
    id: '6',
    title: 'Beach Read',
    author: 'Emily Henry',
    coverImage: 'https://images.pexels.com/photos/4153150/pexels-photo-4153150.jpeg',
    totalPages: 352,
    currentPage: 0,
    spiceRating: 2,
    tropes: ['enemies to lovers', 'writer romance', 'beach setting'],
    status: 'wantToRead',
    spicyScenes: [],
    isbn: '9780451493521',
    description: 'A romance writer who no longer believes in love and a literary writer stuck in a rut engage in a summer-long challenge.',
    publishedDate: '2020-05-19'
  }
];

// Book tropes
export const popularTropes = [
  'enemies to lovers',
  'forced proximity',
  'only one bed',
  'fake dating',
  'slow burn',
  'forbidden love',
  'second chance romance',
  'grumpy x sunshine',
  'age gap',
  'friends to lovers',
  'reverse harem',
  'morally grey hero',
  'bully romance',
  'monster romance',
  'arranged marriage',
  'fated mates',
  'possessive MMC',
  'breeding kink',
  'size difference',
  'praise kink',
  'fantasy academy',
  'dark romance',
  'small town romance',
  'rockstar romance',
  'sports romance',
  'office romance',
  'marriage of convenience',
  'royalty',
  'billionaire',
  'academy'
];

// Praise messages based on styles
const praiseMessages = {
  flirty: [
    "Oh, look at you go! I love watching you turn those pages...",
    "That reading streak is as hot as the scenes in your book!",
    "You're devouring that book like it's dessert. Sexy AND smart!",
    "45 minutes of focused reading? That's such a turn-on!",
    "The way you hit your reading goal makes me weak in the knees..."
  ],
  funny: [
    "Hot damn! You're reading like the book has your nudes in the last chapter!",
    "Look at you reading like a scholar by day, freak by... also day!",
    "Your brain is getting as much action as the characters in your book!",
    "Reading AND hydrating? Is there anything you CAN'T do?",
    "If being well-read was a crime, you'd be doing LIFE, baby!"
  ],
  wholesome: [
    "I'm so proud of your dedication to reading today!",
    "You're making wonderful progress through your book!",
    "Your consistency is truly admirable!",
    "What a joy to see you enjoying literature so much!",
    "You're taking such good care of your mind with all this reading!"
  ],
  dominant: [
    "That's right. Keep reading. I didn't tell you to stop.",
    "Look at you, being such a good reader. Exactly as I expect.",
    "You've earned a reward after finishing that chapter.",
    "I know you can read faster than that. Prove it to me.",
    "You'll finish this book by the deadline I set. Won't you?"
  ],
  submissive: [
    "Is it okay if I tell you how impressed I am with your reading?",
    "You're so amazing at staying focused... I wish I could be more like you.",
    "Would it please you if I tracked your progress for you?",
    "I'm here whenever you need anything while you're reading...",
    "Thank you for letting me be part of your reading journey!"
  ]
};