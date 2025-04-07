#!/bin/bash

# Start Firebase emulators
echo "Starting Firebase emulators..."
firebase emulators:start --only auth,firestore 