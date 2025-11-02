# Image Preprocessing Platform - Frontend Setup Guide

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Backend running at `http://localhost:8000`

## Installation Steps

### 1. Install Dependencies
\`\`\`bash
cd image-preprocessing-platform
npm install --legacy-peer-deps
\`\`\`

### 2. Configure Environment Variables
Create a `.env.local` file in the project root:
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:8000
\`\`\`

### 3. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

The app will be available at `http://localhost:3000`

## Features Implementation Status

### ✅ Image Upload & Gallery
- Upload images via drag-and-drop
- Browse all images in gallery
- Click to open editor

### ✅ Image Editor with Split-View
- Original vs processed image comparison
- Draggable divider to compare transformations
- Real-time preview of changes

### ✅ Transformations
- **Basic**: Grayscale, Normalize
- **Filters**: Blur, Threshold
- **Rotation & Flip**: Rotate, Flip horizontal/vertical
- **Resize**: Width and height input
- **Channel Split**: Extract Red, Green, or Blue channel as grayscale
- **Advanced**: Histogram Equalization

### ✅ Histogram Analysis
- RGB histogram with Red, Green, Blue separate bars
- Grayscale histogram
- Toggle between bar chart and line chart
- Real-time updates

### ✅ Detection / ROI
- Contour detection overlay
- Face detection overlay
- Toggle between detection and processed image
- Dropdown to select detection method

### ✅ History Tracking
- View all applied transformations
- Timestamps for each transformation
- Collapsible history panel

### ✅ Undo/Redo
- Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y (redo)
- Visual toolbar buttons
- Full transformation history management

### ✅ Download
- Download processed images
- Automatic filename with "processed-" prefix

## Troubleshooting

### "Failed to load images" error
1. Check if backend is running: `http://localhost:8000/images`
2. Verify `.env.local` has correct API URL
3. Restart the dev server: `npm run dev`

### Histogram not showing
- Ensure backend `/images/{id}/histogram` endpoint returns JSON with `red`, `green`, `blue`, `grayscale` arrays
- Check browser console for API errors (F12 → Console)

### Resize not working
- Enter both width AND height values
- Values must be positive integers
- Hit Enter or click another control to apply

### Detection overlay not showing
- Verify backend has `/images/{id}/detect` endpoint implemented
- Check if detection method is supported (contour or face)
- Ensure returned image is valid base64

## API Endpoints Required

Backend should provide:
- `POST /images` - Upload image
- `GET /images` - List all images
- `GET /images/{id}` - Get specific image
- `POST /images/{id}/preview` - Preview transformation
- `POST /images/{id}/transform` - Apply & save transformation
- `GET /images/{id}/histogram` - Get histogram data
- `GET /images/{id}/history` - Get transformation history
- `POST /images/{id}/detect?method={method}` - Detection/ROI

All endpoints should return images as base64 in JSON format.

## Development Notes

- Built with Next.js 16 and React 19
- Styling with Tailwind CSS v4
- Charts with Recharts
- API service in `lib/api-service.ts`
- Components organized in `components/` directory
- Key hook: `use-history.ts` for undo/redo functionality

## Build for Production

\`\`\`bash
npm run build
npm start
\`\`\`

The production build will be optimized and ready for deployment.
