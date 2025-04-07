# Firebase Callable Functions Standard

This directory contains Firebase callable functions and their tests. This document outlines the standardized approach for creating new functions.

## Directory Structure

```
src/functions/
├── __tests__/           # Test files for functions
├── templates/           # Templates for creating new functions and tests
├── utils/               # Shared utility functions
│   └── firebaseUtils.ts # Firebase Admin initialization and test utilities
├── userFunctions.ts     # User-related functions
├── productFunctions.ts  # Product-related functions
└── schedulerFunctions.ts # Scheduler-related functions
```

## Creating a New Function

To create a new Firebase callable function, follow these steps:

1. **Copy the template file**:
   - Copy `templates/functionTemplate.ts` to a new file in the `src/functions` directory
   - Name the file according to your function's purpose (e.g., `orderFunctions.ts`)

2. **Update the function file**:
   - Rename the interface to match your data structure
   - Update the function name and implementation
   - Modify the local testing code if needed

3. **Create a test file**:
   - Copy `templates/testTemplate.ts` to a new file in the `src/functions/__tests__` directory
   - Name the file to match your function (e.g., `orderFunctions.test.ts`)
   - Update the import to point to your function file
   - Modify the test cases to match your function's behavior

## Function Structure

Each function follows this standard structure:

1. **Imports**: Import necessary Firebase modules and utilities
2. **Firebase Admin Initialization**: Call `initializeFirebaseAdmin()` from the utils
3. **Interfaces**: Define TypeScript interfaces for the function's data
4. **Implementation**: Define the function implementation with:
   - Authentication check
   - Data extraction
   - Permission validation (if applicable)
   - Business logic
   - Error handling
5. **Export**: Export the function wrapped with `onCall`
6. **Local Testing**: Include code for local testing with ts-node

## Testing Structure

Each test file follows this standard structure:

1. **Setup**: Use `createMockFirebaseAdmin()` from the utils to set up mocks
2. **Authentication Tests**: Test unauthenticated access
3. **Permission Tests**: Test access to other users' data (if applicable)
4. **Success Tests**: Test successful execution of the function

## Running Functions Locally

Each function includes code for local testing with ts-node. To run a function locally:

### Using Helper Scripts

We've created two helper scripts to make running functions locally easier:

1. **Start the Firebase emulators**:
   ```bash
   ./start-emulators.sh
   ```

2. **Run a function with ts-node**:
   ```bash
   ./run-function.sh productFunctions
   ```

### Manual Steps

If you prefer to run the commands manually:

1. Make sure you have the Firebase emulators running:
   ```bash
   firebase emulators:start --only auth,firestore
   ```

2. Run the function with ts-node:
   ```bash
   ts-node src/functions/yourFunction.ts
   ```

The function will execute with the test data defined in the file and connect to the Firebase emulators.

## Shared Utilities

We've created shared utilities to make development easier:

1. **Firebase Admin Initialization**:
   ```typescript
   import { initializeFirebaseAdmin } from './utils/firebaseUtils';
   
   // Initialize Firebase Admin
   initializeFirebaseAdmin();
   ```

2. **Creating Test Requests**:
   ```typescript
   import { createTestRequest } from './utils/firebaseUtils';
   
   const testRequest = createTestRequest({
     field1: 'Test Value',
     field2: 42,
     userId: 'test-user-id',
   });
   ```

3. **Setting Up Mocks for Tests**:
   ```typescript
   import { createMockFirebaseAdmin } from './utils/firebaseUtils';
   
   const mockFirebase = createMockFirebaseAdmin();
   
   beforeAll(() => {
     // Setup mocks
     mockFirebase.setupMocks();
   });
   ```

## Example

See `productFunctions.ts` and `productFunctions.test.ts` for a complete example of a function that creates a product with a user.

## Best Practices

1. **Authentication**: Always check if the request is authenticated
2. **Permissions**: Validate that users can only access their own data
3. **Error Handling**: Use appropriate error codes and messages
4. **Logging**: Include helpful log messages for debugging
5. **Testing**: Write comprehensive tests for all scenarios
6. **Local Testing**: Include code for local testing with ts-node
7. **Firebase Admin Initialization**: Use the shared utility for initialization
8. **Test Utilities**: Use the shared utilities for creating test requests and mocks 