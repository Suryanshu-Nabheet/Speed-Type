# Speed Type ⚡

A free, customizable typing test and practice tool designed as a polished terminal-first CLI with multiplayer racing capabilities and comprehensive statistics tracking.

## ✨ Features

### 🎯 Core Features
- **Interactive Typing Tests**: Words, sentences, paragraphs, quotes, and code mode
- **Real-time Metrics**: WPM, accuracy, CPM, consistency, and streak tracking
- **Profile Management**: Local profiles with comprehensive statistics
- **Progress Tracking**: Historical data with detailed analytics
- **Customizable Wordlists**: Import your own or use curated collections
- **Themes**: Dark, light, and high-contrast themes with ANSI color support
- **Cross-platform**: Works on Linux, macOS, and Windows terminals

### 🏁 Advanced Features  
- **Multiplayer Racing**: Real-time races with WebSocket synchronization
- **Replay System**: Record and share typing sessions with unique codes
- **Leaderboards**: Local and global ranking systems
- **Cloud Sync**: Optional profile synchronization across devices
- **Export/Import**: Backup and restore profiles and settings
- **Accessibility**: High-contrast themes and keyboard-friendly navigation

## 🚀 Quick Start

### Global Installation
```bash
npm install -g speed-type
speed-type --version
```

### Basic Usage
```bash
# Start a typing test
speed-type run

# Create a profile
speed-type profile create "YourName"

# View statistics
speed-type stats

# Join a multiplayer race
speed-type race create
```

## 📖 Usage Guide

### Commands Overview

```bash
speed-type <command> [options]

Commands:
  run         Start a typing test
  profile     Manage user profiles  
  stats       Show typing statistics
  leaderboard Show leaderboards
  race        Multiplayer racing
  replay      Watch or share a replay
  config      Manage configuration
```

### Typing Test Options

```bash
# Different test modes
speed-type run --mode words        # Word-based test (default)
speed-type run --mode sentences    # Sentence-based test  
speed-type run --mode paragraphs   # Paragraph test
speed-type run --mode quotes       # Famous quotes
speed-type run --mode code         # Programming code

# Customize difficulty and duration
speed-type run --difficulty easy --time 30
speed-type run --words 100 --theme light
```

### Profile Management

```bash
# Profile operations
speed-type profile create "ProTypist"
speed-type profile list
speed-type profile switch "ProTypist"
speed-type profile delete "OldProfile"

# View detailed statistics
speed-type stats --profile "ProTypist" --detailed
```

### Multiplayer Racing

```bash
# Create and join races
speed-type race create --mode words
speed-type race join ABC123
speed-type race list

# Share your results
speed-type replay SHARE_CODE --share
```

### Configuration

```bash
# Customize your experience
speed-type config set theme dark
speed-type config set soundEnabled true
speed-type config set showWpmInRealTime true
speed-type config list
```

## 🎨 Themes and Customization

Speed Type includes several built-in themes:
- **Dark**: Easy on the eyes for long typing sessions
- **Light**: Clean and bright for daytime use  
- **High Contrast**: Maximum accessibility and readability

### Custom Themes
Create custom themes by adding JSON files to `~/.speed-type/themes/`:

```json
{
  "name": "custom-theme",
  "colors": {
    "background": "#1a1a1a",
    "text": "#ffffff", 
    "correct": "#00ff00",
    "incorrect": "#ff0000",
    "cursor": "#ffff00",
    "accent": "#00ffff",
    "border": "#444444",
    "dim": "#666666"
  }
}
```

## 📊 Statistics and Analytics

Speed Type tracks comprehensive metrics:
- **Speed**: Words per minute (WPM) and characters per minute (CPM)
- **Accuracy**: Percentage of correct keystrokes  
- **Consistency**: Standard deviation of speed over time
- **Streaks**: Longest sequence of correct characters
- **Progress**: Historical improvement tracking

## 🏆 Leaderboards and Competition

### Local Leaderboards
```bash
speed-type leaderboard              # Local rankings
speed-type leaderboard --mode code  # Mode-specific rankings
```

### Global Leaderboards (Optional)
Enable cloud sync to participate in global rankings:
```bash
speed-type config set cloudSyncEnabled true
speed-type leaderboard --type global
```

## 🔧 Development

### Prerequisites
- Node.js 16+ 
- npm or yarn
- TypeScript 4.9+

### Setup
```bash
git clone https://github.com/Suryanshu-Nabheet/Speed-Type.git
cd speed-type
npm install
npm run dev
```

### Testing
```bash
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Build
```bash
npm run build         # Build for production
npm run lint          # Lint code
npm run format        # Format code
```

## 🐳 Docker Usage

### Running with Docker
```bash
# Build image
docker build -t speed-type .

# Run container
docker run -it --rm speed-type run

# With volume for persistent data
docker run -it --rm -v ~/.speed-type:/home/speedtype/.speed-type speed-type
```

### Docker Compose (with Race Server)
```bash
docker-compose up -d  # Start race server
speed-type race create
```

## 📚 API Documentation

### Extending Word Lists

Create custom word lists in `~/.speed-type/wordlists/`:

```json
{
  "name": "my-wordlist",
  "category": "words",
  "difficulty": "medium", 
  "content": ["word1", "word2", "word3"],
  "metadata": {
    "description": "My custom word list",
    "tags": ["custom", "practice"]
  }
}
```

### Plugin Development

Speed Type supports plugins for extending functionality:

```typescript
// ~/.speed-type/plugins/my-plugin.ts
export class MyPlugin {
  name = 'my-plugin';
  
  onTestStart(options: TestOptions) {
    console.log('Test started!');
  }
  
  onTestComplete(results: TestResult) {
    console.log('Test completed!');
  }
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Areas for Contribution
- 🎨 New themes and UI improvements
- 📝 Additional word lists and content
- 🌐 Internationalization and localization  
- 🔧 Performance optimizations
- 🧪 Test coverage improvements
- 📖 Documentation enhancements

## 📋 Roadmap

### Upcoming Features
- [ ] **Web Interface**: Optional browser-based UI
- [ ] **Mobile Support**: React Native companion app
- [ ] **AI Coaching**: Personalized improvement suggestions  
- [ ] **Tournament Mode**: Organized competitive events
- [ ] **Voice Commands**: Hands-free navigation
- [ ] **Biometric Integration**: Heart rate and stress tracking
- [ ] **Gamification**: Achievements and experience points
- [ ] **Team Racing**: Corporate training and team building

## 🔒 Privacy and Security

Speed Type respects your privacy:
- **Local First**: All data stored locally by default
- **Optional Cloud Sync**: Explicitly opt-in to cloud features
- **No Tracking**: No analytics or usage tracking
- **Open Source**: Fully auditable codebase

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Ink](https://github.com/vadimdemedes/ink) - React for CLIs
- [Blessed](https://github.com/chjj/blessed) - Terminal interface library
- [Fastify](https://www.fastify.io/) - Fast web framework
- [Better SQLite3](https://github.com/JoshuaWise/better-sqlite3) - SQLite interface

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/speed-type/speed-type/issues)  
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/speed-type/speed-type/discussions)
- 📧 **Email**: support@speedtype.dev
- 💬 **Discord**: [Speed Type Community](https://discord.gg/speedtype)

---

**Happy typing! ⚡🎯**