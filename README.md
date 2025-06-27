# TaskDOM Reading App

A gamified reading companion app with voice assistance and progress tracking.

## Setup Instructions

### Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your environment variables in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   VITE_GOOGLE_BOOKS_API_KEY=your_google_books_api_key_here
   ```

### Book Cover Integration

The app uses a sophisticated multi-source approach to ensure high-quality book covers:

#### Primary Source: Google Books API
- **High-Quality Images**: Fetches covers in multiple resolutions (thumbnail, small, medium, large, extra-large)
- **Comprehensive Metadata**: Includes title, author, description, page count, publication date, and ratings
- **Smart Prioritization**: Automatically selects the highest quality available image

#### Fallback Source: Open Library API
- **Extensive Coverage**: When Google Books doesn't have a cover, Open Library provides alternatives
- **Multiple Access Methods**: Searches by ISBN, title/author, and Open Library ID
- **High-Resolution Priority**: Prefers large covers, falls back to medium and small sizes
- **Rate Limit Friendly**: Designed to respect Open Library's usage guidelines

#### Cover Image Resolution Priority
1. **Google Books**: Extra Large → Large → Medium → Small → Thumbnail
2. **Open Library**: Large (L) → Medium (M) → Small (S)
3. **Ultimate Fallback**: Curated Pexels stock image

#### Features

- **Intelligent Fallback**: If Google Books images fail to load, automatically tries Open Library
- **ISBN Support**: Works with both ISBN-10 and ISBN-13 formats
- **Title/Author Search**: When ISBN isn't available, searches by book metadata
- **Image Validation**: Checks if cover URLs are accessible before displaying
- **Error Recovery**: Gracefully handles failed image loads with alternative sources

### Google Books API Integration

#### Getting a Google Books API Key (Optional)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Books API
4. Create credentials (API Key)
5. Add the API key to your `.env` file as `VITE_GOOGLE_BOOKS_API_KEY`

**Note**: The app works without an API key but with rate limiting. With an API key, you get higher rate limits and better performance.

#### Features

- **Book Search**: Search for books by title, author, or keywords
- **ISBN Lookup**: Add books directly by entering their ISBN (10 or 13 digits)
- **Cover Images**: Automatically fetches high-quality cover images with Open Library fallback
- **Book Details**: Retrieves title, author, description, page count, publication date, and ratings
- **Romance Focus**: Special search filters for romance and adult fiction
- **Popular Books**: Shows trending romance books when the search modal opens

### Open Library Integration

#### Features

- **Cover API**: Access to millions of book covers via ISBN, title, or Open Library ID
- **Multiple Sizes**: Supports small (S), medium (M), and large (L) cover sizes
- **Search API**: Find books by title and author when other methods fail
- **No API Key Required**: Free access with reasonable rate limits
- **Comprehensive Database**: Covers books that might not be in Google Books

#### Usage Examples

The app automatically uses Open Library as a fallback, but you can also:

- **Search by ISBN**: `openLibraryService.getCoverByISBN('9780385472579', 'L')`
- **Search by Title**: `openLibraryService.searchBooks('Pride and Prejudice', 'Jane Austen')`
- **Get Best Cover**: `openLibraryService.getBestCoverImage(isbn, title, author)`

### ElevenLabs Integration

The app is configured to use the ElevenLabs API through the provided Supabase Edge Function endpoint:
- **Voices Endpoint**: `https://cexgzhxkenpntzavnsfh.supabase.co/functions/v1/elevenlabs-voices`
- **Generation Endpoint**: `https://cexgzhxkenpntzavnsfh.supabase.co/functions/v1/elevenlabs-generate`

### Available Voice IDs

The app comes pre-configured with these voice options:

#### Male Voices
- **James** (Flirty): `EkK5I93UQWFDigLMpZcX`
- **Christopher** (Dominant): `G17SuINrv2H9FC6nvetn`
- **Adam** (Wholesome): `IRHApOXLvnW57QJPQH2P`

#### Female Voices
- **Monika** (Flirty): `6qL48o1LBmtR94hIYAQh`
- **Viktoria** (Dominant): `6qL48o1LBmtR94hIYAQh`
- **Brittany** (Wholesome): `esy0r39YPLQjOczyOib8`

### Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Features

### Enhanced Book Management
- **Dual-Source Integration**: Google Books + Open Library for maximum cover availability
- **Smart Image Fallback**: Automatically tries multiple sources for the best cover quality
- **ISBN Support**: Add books by scanning or entering ISBN codes with enhanced detection
- **High-Quality Covers**: Prioritizes larger, clearer images from multiple sources
- **Library Organization**: Filter and sort by status, author, title, spice rating, and more
- **Metadata Rich**: Complete book information including descriptions, ratings, and publication info

### Voice Integration
- **Secure Voice Integration**: ElevenLabs API calls through secure Supabase Edge Functions
- **Voice Selection**: Browse and test available voices with male and female options
- **Reading Progress Tracking**: Sync progress across devices
- **Gamification**: Streaks, challenges, and rewards
- **Themed Days**: Special content for different days of the week
- **Gender Preferences**: Choose between male and female voice options for each style

## Voice Styles

Each voice style is available in both male and female options:

- **Flirty**: Playful and encouraging voices for seductive motivation
- **Dominant**: Strong and commanding voices for assertive praise
- **Wholesome**: Warm and supportive voices for gentle encouragement

## API Integration

### Google Books API
- **Book Search**: Search millions of books by title, author, or keywords
- **ISBN Lookup**: Find books by their unique ISBN identifier
- **Metadata Retrieval**: Get complete book information including covers
- **Romance Filtering**: Specialized searches for romance and adult fiction
- **Rate Limiting**: Graceful handling with and without API keys

### Open Library API
- **Cover Database**: Access to extensive collection of book covers
- **ISBN Resolution**: Direct cover lookup by ISBN-10 or ISBN-13
- **Title/Author Search**: Find covers when ISBN isn't available
- **Multiple Formats**: Support for different cover sizes and qualities
- **Free Access**: No API key required, respects rate limiting guidelines

### ElevenLabs API
- **Voice Fetching**: Retrieves available voices from ElevenLabs API
- **Speech Generation**: Converts text to speech using selected voices
- **Fallback Support**: Uses predefined voices if API is unavailable
- **Secure**: API keys are handled server-side for security

## Security

- API keys are never exposed to the client-side code
- All ElevenLabs API calls go through secure Supabase Edge Functions
- Google Books API key is optional and only used for rate limit improvements
- Open Library requires no API key and is accessed directly with rate limiting
- User authentication and data protection via Supabase RLS
- Fallback to predefined voices ensures app functionality even if APIs are down

## Book Search Features

### Enhanced Cover Detection
1. **Primary**: Google Books API with multiple resolution options
2. **Fallback**: Open Library API with ISBN and title/author search
3. **Validation**: Automatic checking of image accessibility
4. **Recovery**: Smart error handling with alternative source attempts

### Search Methods
1. **Text Search**: Search by title, author, or keywords across both APIs
2. **ISBN Search**: Direct lookup using 10 or 13-digit ISBN codes with dual-source checking
3. **Popular Books**: Curated list of trending romance novels

### Book Information Retrieved
- Title and author(s) from multiple sources
- High-quality cover images with intelligent fallback
- Page count and publication date
- Book description/synopsis
- Average rating and review count
- ISBN identifiers (both formats)
- Categories and genres
- Language information

### Library Integration
- Books are automatically added to your personal library
- Default status set to "Want to Read"
- Enhanced cover images are displayed throughout the app
- Search your library by title, author, or ISBN
- Filter and sort your collection multiple ways
- Consistent high-quality covers across all views

## Cover Image Quality Assurance

The app implements a sophisticated cover image system:

1. **Multi-Source Strategy**: Combines Google Books and Open Library for maximum coverage
2. **Quality Prioritization**: Always selects the highest resolution available
3. **Automatic Fallback**: Seamlessly switches sources if primary fails
4. **Error Recovery**: Handles network issues and missing images gracefully
5. **Consistent Display**: Same high-quality image appears everywhere in the app
6. **Performance Optimized**: Efficient loading with proper error handling