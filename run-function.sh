#!/bin/bash

# Check if a function name was provided
if [ -z "$1" ]; then
  echo "Usage: ./run-function.sh <function-name>"
  echo "Example: ./run-function.sh productFunctions"
  exit 1
fi

# Run the function with ts-node
echo "Running $1 with ts-node..."
ts-node src/functions/$1.ts 