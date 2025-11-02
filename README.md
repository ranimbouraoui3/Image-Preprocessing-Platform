Setup & Installation
Backend

Navigate to the backend folder:

cd backend


Create and activate a Python virtual environment:

python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows


Install dependencies:

pip install -r requirements.txt


Run the FastAPI server:

uvicorn main:app --reload --host 0.0.0.0 --port 8000


The backend API will be accessible at: http://localhost:8000

Make sure the uploads folder exists in the backend directory for storing images.

Frontend

Navigate to the frontend folder (root of project):

cd frontend


Install dependencies:

pnpm install
# or
npm install


Run the development server:

pnpm dev
# or
npm run dev


The frontend will be accessible at: http://localhost:3000
