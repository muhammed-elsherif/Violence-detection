#!/bin/bash

set -e

# Start frontend
echo "Starting Frontend..."
cd frontend
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # comment this line if your current node version is 22
nvm use 22 > frontend.log 2>&1
ng serve > frontend.log 2>&1 &

# Start backend
echo "Starting Backend..."
cd ../backend
npm run start > backend.log 2>&1 &

# Start Machine Learning API (not working)
echo "Starting Machine Learning Service..."
cd ../MachineLearning/test_prediction
source env/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8000 > ml_service.log 2>&1 &

echo "All services started successfully."
wait
