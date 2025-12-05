# Bookstore Inventory (Assessment)

## Setup
1. `npm install`
2. Create `.env` (optional). Example:
PORT = 3000
3. Start:
- Development: `npm run dev` (requires nodemon)
- Production: `npm start`

## Endpoints
- `POST /api/inventory/upload` (form-data: file → CSV)
- `GET /api/store/:id/download-report`

CSV format:
store_name,store_address,book_name,pages,author_name,price


## Docker
- `docker compose up --build`
