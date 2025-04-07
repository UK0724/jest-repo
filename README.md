# Firebase Functions with TypeScript and Testing

This project demonstrates how to create Firebase Cloud Functions using TypeScript, including callable functions and schedulers, with comprehensive testing using Jest and Firebase Emulator.

## Features

- TypeScript support
- Firebase Callable Functions
- Firebase Scheduler Functions
- Jest testing setup
- Firebase Emulator integration
- Comprehensive test coverage

## Prerequisites

- Node.js (v18 or later)
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase project:
   ```bash
   firebase init
   ```
   Select Functions and Emulators when prompted.

## Development

1. Start the Firebase emulator:
   ```bash
   npm run serve
   ```

2. Run tests:
   ```bash
   npm test
   ```

3. Run tests in watch mode:
   ```bash
   npm run test:watch
   ```

## Project Structure

```
.
├── src/
│   └── functions/
│       ├── userFunctions.ts
│       ├── schedulerFunctions.ts
│       └── __tests__/
│           ├── userFunctions.test.ts
│           └── schedulerFunctions.test.ts
├── package.json
├── tsconfig.json
├── firebase.json
└── jest.config.js
```

## Testing

The project uses Jest for testing. Tests are located in the `__tests__` directory alongside their respective function files. The test files demonstrate:

- Mocking Firebase Admin SDK
- Testing callable functions
- Testing scheduler functions
- Error handling
- Authentication checks

## Deployment

To deploy to Firebase:

```bash
npm run deploy
```

## License

MIT 