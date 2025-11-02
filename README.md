# Image Editor & Histogram Analysis Project

This repository contains a full-stack project for **image editing, transformation, and histogram analysis**. It includes a **Next.js frontend** and a **FastAPI backend**.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [Notes](#notes)

---

## Features

- Upload and preview images
- Apply real-time image transformations
- View original and edited histograms
- Undo/Redo image edits
- Download edited images
- Toast notifications for actions and errors

---

## Tech Stack

- **Frontend:** Next.js 16, TypeScript, TailwindCSS, React Hooks
- **Backend:** FastAPI, Python 3.11+, Pillow, OpenCV
- **Storage:** Local uploads folder (`/uploads` or `/tmp`)
- **Communication:** REST API

---

## Project Structure

```
.
├── app/                    # Next.js pages / routes
├── components/             # React components
├── hooks/                  # Custom React hooks
├── lib/                    # API services
├── public/                 # Public static assets
├── backend/                # FastAPI server code
│   ├── main.py            # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── uploads/           # Uploaded images (backend storage)
├── .next/                  # Next.js build folder
├── package.json            # Frontend dependencies
└── README.md               # Project documentation
```

---

## Setup & Installation

### Backend

1. Navigate to the backend folder:

```bash
cd backend
```

2. Create and activate a Python virtual environment:

```bash
python -m venv venv

# Linux/Mac
source venv/bin/activate

# Windows
venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Run the FastAPI server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be accessible at: **http://localhost:8000**

---

### Frontend

1. Navigate to the frontend folder (project root if Next.js is there):

```bash
cd frontend
```

2. Install dependencies:

```bash
pnpm install
# or
npm install
```

3. Run the Next.js development server:

```bash
pnpm dev
# or
npm run dev
```

The frontend will be accessible at: **http://localhost:3000**

---

## Usage

1. Go to **http://localhost:3000** in your browser
2. Upload an image to the editor
3. Apply transformations and preview edits in real-time
4. View histograms for original and processed images
5. Save and download your edited images

---

## Environment Variables

Create a `.env.local` file in the frontend and backend if needed:

### Frontend example:

```ini
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Backend example:

```ini
API_BASE_URL=http://localhost:8000
UPLOADS_DIR=uploads
```

---

## Notes

- Uploaded images are stored in the `/uploads` folder in the backend
- To reset uploads, you can delete files in `/uploads` or `/tmp`
- Make sure the backend is running before starting the frontend to avoid broken API calls
- For API documentation, visit **http://localhost:8000/docs** (FastAPI auto-generated docs)

---

## License

This project is licensed under the MIT License.

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## Contact

For questions or support, please open an issue in this repository.
