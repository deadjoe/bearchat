# BearChat

BearChat is a real-time translation application designed for face-to-face interactions with speakers of Asian languages (Japanese, Korean, Thai, and Vietnamese). It provides a clean, minimalistic interface optimized for mobile devices.

## Features

- Real-time speech recognition
- Instant translation between languages
- Text-to-speech synthesis
- Mobile-optimized interface
- Dark mode UI
- Settings panel for API configuration
- Secure API key storage

## Technology Stack

### Frontend Framework and Build Tools

| Technology | Version | Purpose |
|------------|---------|----------|
| React | 18.2.0 | UI Framework |
| TypeScript | 5.2.2 | Type Safety |
| Vite | 5.0.0 | Build Tool |
| SWC | Latest | Fast Refresh |

### Styling and UI

| Technology | Version | Purpose |
|------------|---------|----------|
| Tailwind CSS | 3.3.6 | Utility-first CSS |
| tailwindcss-animate | Latest | Animations |
| Lucide React | Latest | Icons |
| Shadcn/ui | Latest | UI Components |

### APIs and Integration

| Technology | Version | Purpose |
|------------|---------|----------|
| Web Speech API | Browser Native | Speech Recognition & Synthesis |
| OpenAI API | Latest | Translation Services |

### Development Tools

| Technology | Version | Purpose |
|------------|---------|----------|
| ESLint | 8.53.0 | Code Linting |
| PostCSS | 8.4.31 | CSS Processing |
| Autoprefixer | 10.4.16 | CSS Compatibility |

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/deadjoe/bearchat.git
cd bearchat
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your OpenAI API key:
```env
OPENAI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Copyright 2024 Joe. All rights reserved.

This is a proprietary software. Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited.
