// Static OpenAPI 3.0 specification for the Todos API
export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Todo API",
    version: "1.0.0",
    description: "A simple Express CRUD Todo API",
  },
  components: {
    schemas: {
      Todo: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          title: { type: "string", example: "Buy groceries" },
          description: {
            type: "string",
            example: "Milk, eggs, bread",
            nullable: true,
          },
          status: { type: "string", example: "pending" },
        },
      },
      TodoInput: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", example: "Buy groceries" },
          description: { type: "string", example: "Milk, eggs, bread" },
          status: { type: "string", example: "pending" },
        },
      },
      Error: {
        type: "object",
        properties: {
          detail: { type: "string", example: "Todo not found" },
        },
      },
    },
  },
  paths: {
    "/todos": {
      get: {
        summary: "List all todos",
        tags: ["Todos"],
        parameters: [
          {
            in: "query",
            name: "skip",
            schema: { type: "integer", default: 0 },
            description: "Number of todos to skip",
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", default: 10 },
            description: "Maximum number of todos to return",
          },
        ],
        responses: {
          200: {
            description: "List of todos",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Todo" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a new todo",
        tags: ["Todos"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TodoInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Todo created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Todo" },
              },
            },
          },
          422: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/todos/{id}": {
      get: {
        summary: "Get a todo by ID",
        tags: ["Todos"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Todo found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Todo" },
              },
            },
          },
          404: {
            description: "Todo not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      put: {
        summary: "Update a todo",
        tags: ["Todos"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TodoInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Todo updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Todo" },
              },
            },
          },
          404: {
            description: "Todo not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        summary: "Delete a todo",
        tags: ["Todos"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Todo deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Todo not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/todos/search/all": {
      get: {
        summary: "Search todos by title",
        tags: ["Todos"],
        parameters: [
          {
            in: "query",
            name: "q",
            schema: { type: "string" },
            description: "Search query",
          },
        ],
        responses: {
          200: {
            description: "Matching todos",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Todo" },
                },
              },
            },
          },
        },
      },
    },
    "/health": {
      get: {
        summary: "Health check",
        tags: ["System"],
        responses: {
          200: {
            description: "API is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { status: { type: "string", example: "health" } },
                },
              },
            },
          },
        },
      },
    },
  },
}
