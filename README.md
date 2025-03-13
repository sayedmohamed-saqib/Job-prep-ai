# AI Interview Assistant

An advanced AI-powered interview assistant that streamlines interview processes through intelligent speech recognition and context-aware response generation. The application integrates with multiple communication platforms and provides real-time AI-generated response suggestions.

## Features

- Real-time speech recognition and transcription
- Context-aware AI response generation using Google AI and OpenAI
- Platform integrations:
  - Zoom
  - Google Meet
  - Microsoft Teams
  - Slack
- Response customization:
  - Concise vs. Detailed responses
  - Preparation mode
  - Expertise-based suggestions
- WebSocket-based real-time communication
- Robust error handling and connection management

## Tech Stack

- **Frontend**:

  - React with TypeScript
  - TailwindCSS + shadcn/ui for styling
  - TanStack Query for data fetching
  - WebSocket for real-time communication

- **Backend**:
  - Express.js server
  - WebSocket server for real-time events
  - Integration with Google AI and OpenAI
  - PostgreSQL with Drizzle ORM

## Getting Started

### Prerequisites

- Node.js 20.x or later
- PostgreSQL database
- Google Cloud API key (for Google AI integration)
- OpenAI API key (optional, for OpenAI integration)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Rda99/ai-interview-assistant.git
cd ai-interview-assistant
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```
DATABASE_URL=your_postgresql_connection_string
GOOGLE_CLOUD_API_KEY=AIzaSyCgKMuB4N203GmQqmPoSSE6wDLHMsoTNOI
OPENAI_API_KEY=your_openai_api_key (optional)
```

4. Initialize the database:

```bash
npm run db:push
```

5. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

## Usage

1. **Platform Connection**:

   - Select your preferred communication platform (Zoom, Meet, Teams, or Slack)
   - Enter the meeting link to connect
   - If required, provide platform-specific credentials

2. **Interview Settings**:

   - Choose between concise or detailed responses
   - Toggle preparation mode for more thorough suggestions
   - Set your areas of expertise for tailored responses

3. **During Interview**:
   - The assistant automatically transcribes the conversation
   - When a question is detected, AI-generated response suggestions appear
   - Click the copy button to use a suggestion

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)

joined
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
