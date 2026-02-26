# Todo API

[![CI](https://github.com/LuaPanic/todo-api-node/actions/workflows/ci.yml/badge.svg)](https://github.com/LuaPanic/todo-api-node/actions/workflows/ci.yml)
[![CD](https://github.com/LuaPanic/todo-api-node/actions/workflows/cd.yml/badge.svg)](https://github.com/LuaPanic/todo-api-node/actions/workflows/cd.yml)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=LuaPanic_todo-api-node&metric=coverage)](https://sonarcloud.io/summary/new_code?id=LuaPanic_todo-api-node)
[![Uptime](https://img.shields.io/uptimerobot/ratio/m799999999-placeholder?label=Uptime&logo=uptimerobot)](https://stats.uptimerobot.com/placeholder)
[![Node.js](https://img.shields.io/badge/Node.js-24-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-black?logo=express)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A simple RESTful CRUD Todo API built with Express 5 and an in-process SQLite database ([sql.js](https://sql.js.org/)). Includes Swagger UI, a full CI pipeline (format, lint, tests, health check), and continuous deployment to GitHub Container Registry.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Running Tests](#running-tests)
- [Docker](#docker)
- [API Reference](#api-reference)
- [CI / CD](#ci--cd)

---

## Prerequisites

- [Node.js](https://nodejs.org/) >= 24
- npm >= 10

---

## Getting Started

```bash
git clone https://github.com/LuaPanic/todo-api-node.git
cd todo-api-node
npm install
```

---

## Environment Variables

Create a `.env` file at the root of the project (optional — the app runs without it):

```env
PORT=3000
NODE_ENV=development
SECRET_KEY=your-secret-key
API_KEY=your-api-key
```

| Variable     | Default   | Description                             |
| ------------ | --------- | --------------------------------------- |
| `PORT`       | `3000`    | Port the server listens on              |
| `NODE_ENV`   | _(unset)_ | Set to `development` to enable `/debug` |
| `SECRET_KEY` | _(unset)_ | Exposed by the `/debug` endpoint        |
| `API_KEY`    | _(unset)_ | Exposed by the `/debug` endpoint        |

---

## Running the App

```bash
# Start the server
npm start

# Server will be available at http://localhost:3000
# Swagger UI at        http://localhost:3000/api-docs
```

---

## Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Linting & formatting checks
npm run eslint
npm run format
```

---

## Docker

The image is published to GitHub Container Registry on every push to `main` or `dev`.

```bash
# Pull the latest image
docker pull ghcr.io/luapanic/todo-api-node:main

# Run it
docker run -p 3000:3000 ghcr.io/luapanic/todo-api-node:main
```

To build locally:

```bash
docker build -t todo-api-node .
docker run -p 3000:3000 todo-api-node
```

---

## API Reference

Interactive documentation is available at **`/api-docs`** (Swagger UI) when the server is running.

### Base URL

```
http://localhost:3000
```

### Endpoints

#### System

| Method | Path      | Description     |
| ------ | --------- | --------------- |
| GET    | `/`       | Welcome message |
| GET    | `/health` | Health check    |

#### Todos

| Method | Path                | Description                |
| ------ | ------------------- | -------------------------- |
| GET    | `/todos`            | List all todos (paginated) |
| POST   | `/todos`            | Create a new todo          |
| GET    | `/todos/:id`        | Get a single todo by ID    |
| PUT    | `/todos/:id`        | Update a todo by ID        |
| DELETE | `/todos/:id`        | Delete a todo by ID        |
| GET    | `/todos/search/all` | Search todos by title      |

---

### `GET /todos`

Returns a paginated list of todos.

**Query parameters**

| Parameter | Type    | Default | Description             |
| --------- | ------- | ------- | ----------------------- |
| `skip`    | integer | `0`     | Number of items to skip |
| `limit`   | integer | `10`    | Maximum items to return |

**Response `200`**

```json
[
  {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "status": "pending"
  }
]
```

---

### `POST /todos`

Creates a new todo.

**Request body** (`application/json`)

```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "pending"
}
```

| Field         | Type   | Required | Description           |
| ------------- | ------ | -------- | --------------------- |
| `title`       | string | Yes      | Title of the todo     |
| `description` | string | No       | Optional description  |
| `status`      | string | No       | Defaults to `pending` |

**Response `201`** — the created todo object.

**Response `422`** — `title` is missing.

```json
{ "detail": "title is required" }
```

---

### `GET /todos/:id`

Returns a single todo.

**Response `200`** — the todo object.

**Response `404`**

```json
{ "detail": "Todo not found" }
```

---

### `PUT /todos/:id`

Updates an existing todo. All fields are optional; omitted fields keep their current value.

**Request body** (`application/json`)

```json
{
  "title": "Updated title",
  "status": "done"
}
```

**Response `200`** — the updated todo object.

**Response `404`** — todo not found.

---

### `DELETE /todos/:id`

Deletes a todo.

**Response `200`**

```json
{ "detail": "Todo deleted" }
```

**Response `404`** — todo not found.

---

### `GET /todos/search/all`

Searches todos whose title contains the query string (case-insensitive `LIKE`).

**Query parameters**

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `q`       | string | Search term |

**Response `200`** — array of matching todo objects.

---

## CI / CD

### CI — on pull requests to `main` / `dev`

1. Format check (`prettier`)
2. Lint (`eslint`)
3. Tests with coverage (`vitest`)
4. Health check (starts the server and hits `/health`)

### CD — on push to `main` / `dev`

1. Builds a Docker image
2. Pushes it to [GitHub Container Registry](https://ghcr.io/luapanic/todo-api-node)
3. Generates a signed build provenance attestation
