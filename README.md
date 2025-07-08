# Text Analyzer API

A Node.js-based text analysis tool built with TypeScript, TypeORM, Redis, and Express. This service provides a RESTful API for managing texts and performing various analyses including word count, character count, sentence count, paragraph count, identifying the longest words in each paragraph, and text analysis-report.

---

## Project Architecture

This project follows **Clean Architecture** principles to ensure separation of concerns, maintainability, and testability.

### Layers
- **Domain Layer**
  - Entities: Plain TypeScript objects representing business data (e.g., `User`, `Text`)
  - Repositories: Interfaces defining data access operations

- **Application Layer**
  - Services: Business logic and use cases (e.g., `TextService`, `UserService`)
  - DTOs: Data Transfer Objects for input/output (e.g., `CreateUserInput`, `TextAnalysisReport`)

- **Infrastructure Layer**
  - Database: PostgreSQL via TypeORM
  - Cache: Redis for caching expensive analysis results
  - Logging: Winston logger
  - Auth: JWT-based authentication

- **Interface Layer**
  - Controllers: Express controllers using `routing-controllers`
  - Middlewares: Authentication, rate limiting
  - Swagger UI: Interactive API documentation

### Key Technologies Used
- **Node.js + TypeScript**
- **Express.js** with **Routing-Controllers**
- **TypeORM** for PostgreSQL ORM
- **Redis** for result caching
- **JWT** for authentication
- **Winston** for structured logging
- **Jest** for unit and integration testing
- **Swagger UI** for API documentation

---

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

| Tool | Version |
|------|---------|
| Node.js | `18.x` or higher |
| npm | `8.x` or higher |
| PostgreSQL | `14+` |
| Redis | `6.0+` |
| Git | `2.x` |

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ZulfikarAliZihan/text-analyzer
cd text-analyzer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update the values as needed:

```env
NODE_ENV=development
PORT=3000

DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=root
DATABASE_PASSWORD=example
DATABASE_NAME=text_analyzer

JWT_SECRET=default_secret_key

REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. Initialize the Database

Run migrations:

```bash
npm run migration:run
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

---

## API Documentation

The API is documented using **Swagger/OpenAPI**, available at:

```
http://localhost:3000/api-docs
```

You can view, test, and explore all endpoints interactively.

---

## Testing

### Run Unit Tests

```bash
npm run test
```

### Run Tests with Coverage

```bash
npm run test:cov
```

All services are fully tested with Jest and follow TDD best practices.

---

## Features

| Feature | Description |
|--------|-------------|
| Word Count | Count total number of words in a text |
| Character Count | Count characters excluding whitespace |
| Sentence Count | Detect and count sentences based on punctuation |
| Paragraph Count | Identify paragraphs separated by blank lines |
| Longest Words | Return the longest word from each paragraph |
| JWT Authentication | Secure endpoints with bearer token |
| Rate Limiting | Prevent abuse using Redis-based rate limiter |
| Caching | Cache expensive text analysis results in Redis |
| Log Visualization | Structured logs using Winston for debugging and monitoring |

---

## Bonus Features Implemented

- **JWT Token-Based Authorization**
- **Rate Limiting per User/IP**
- **Redis Caching for Analysis Results**
- **Interactive Swagger Docs**
- **TDD Approach with Full Test Coverage**

---

## Project Structure

```
text-analyzer/
├── src/
│   ├── config/             # Configurations
│   ├── controllers/        # API routes
│   ├── entities/           # TypeORM entities
│   ├── repositories/       # DB interaction interfaces
│   ├── services/           # Business logic
│   ├── dtos/               # Data transfer objects
│   ├── middleware/         # Auth, rate-limiting, etc.
│   └── index.ts            # App entry point
├── test/                   # Jest unit/integration tests
├── migrations/             # TypeORM migration files
├── swagger.json            # OpenAPI spec for Swagger UI
├── Dockerfile              # Docker image definition
├── docker-compose.yml      # Multi-container setup
└── README.md               # You're here!
```

---

## Example Usage

### Create a New Text

```bash
POST /texts
{
  "content": "The quick brown fox jumps over the lazy dog."
}
```

### Get Word Count

```bash
GET /texts/:id/word-count
```

### Get Longest Words in Paragraphs

```bash
GET /texts/:id/longest-words
```




