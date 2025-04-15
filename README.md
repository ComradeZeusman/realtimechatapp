# ChatVerse - Real-Time Chat Application

ChatVerse is a modern real-time chat application that allows users to create and join chat rooms, share messages, and exchange files in a secure and user-friendly environment.

## Features

- **Instant Room Creation**: Create private chat rooms with unique IDs instantly
- **Secure Access**: Share room IDs with only those you want to join
- **Real-Time Communication**: Message delivery with no perceptible delay
- **User Presence**: See who's in the room and when users connect/disconnect
- **File Sharing**: Send and receive images, videos, and other files
- **Profanity Filter**: Automatic filtering of inappropriate language
- **Admin Controls**: Room creators can end rooms when needed
- **User Tracking**: Shows when users are typing
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Modern UI**: Sleek interface with gradient animations and clean design

## Technology Stack

- **Backend**: Node.js with Express.js
- **Real-Time Communication**: Socket.IO
- **Frontend Templating**: EJS (Embedded JavaScript)
- **Styling**: Tailwind CSS with custom animations
- **File Handling**: Multer for file uploads
- **Content Moderation**: Bad-words filter
- **Session Management**: Express-session with socket.io integration

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/ComradeZeusman/realtimechatapp
   cd chatverse
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the server:

   ```
   npm start
   ```

4. Access the application at `http://localhost:3000`

## Usage

### Creating a Chat Room

1. Visit the homepage
2. Click "Create Room"
3. Share the generated room ID with others

### Joining a Chat Room

1. Visit the homepage
2. Enter the room ID in the "Join Room" field
3. Click "Join"

### Using the Chat

- Type messages in the input field and press Enter or click Send
- Click the paper clip icon to upload and share files
- Room admins can end the room by clicking "End Room"

## Directory Structure

```
chatverse/
├── server.js            # Main application server
├── package.json         # Project dependencies
├── public/              # Static assets
│   └── uploads/         # Uploaded files storage
├── views/               # EJS templates
│   ├── index.ejs        # Homepage
│   └── room.ejs         # Chat room page
└── LICENSE              # MIT License
```

## Environment Variables

The application uses the following environment variables:

- `PORT` - The port on which the server runs (default: 3000)
- `SESSION_SECRET` - Secret key for session encryption

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Socket.IO for the reliable real-time engine
- Tailwind CSS for the sleek UI components
- Express.js for the robust server framework
- All the open-source libraries that made this project possible
