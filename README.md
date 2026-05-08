# @universal-crud/next: Policy-Driven Backend API Layer for Next.js and Node.js
@universal-crud/next provides a robust and flexible backend API layer for your Next.js and Node.js applications. It emphasizes a policy-driven approach, allowing you to define and enforce rules for your API endpoints, ensuring data integrity and security.

Features
Policy-Driven API: Define granular policies for each API endpoint, controlling access, data validation, and response formatting.
Registry-Based Dispatching: Automatically generates and utilizes a registry of your API modules, ensuring efficient and organized request handling.
Pluggable Integrations: Seamlessly integrate with your existing authentication (e.g., NextAuth), rate limiting, and logging solutions.
Backend-First Design: Primarily focused on the server-side logic, ensuring a secure and scalable API foundation.
Optional Frontend Hooks: Provides lightweight, zero-dependency React hooks for consuming your API from the frontend, mimicking the experience of libraries like TanStack React Query.
Full Next.js App Router Support: Designed to work seamlessly with the latest Next.js App Router paradigm.
Standalone Node.js API: Can also be used as a standalone API layer with frameworks like Express or Fastify.
Core Concepts (Backend)
Models & Modules
These are files containing your business logic, such as database operations, data transformations, and custom business rules. They typically reside in a directory like lib/crud/models/.

CrudMeta
An object associated with each model that defines its API behavior. This includes:

allowedActions: Specifies which CRUD operations are permitted.
protectedFields: Fields that should be excluded from API requests and responses.
restricted: Defines role-based access control, specifying which roles can perform which actions.
Registry (CrudRegistry)
The CrudRegistry is a central, auto-generated mapping that links your API modules (models) to their corresponding metadata (CrudMeta). This registry is crucial for the dispatcher to understand and route incoming requests.

Generation: The registry is generated at build time using a CLI script (e.g., generate-registry.js). This script scans your model files, compiles their modules and metadata, and creates the lib/crud/registry.ts file.

Handler (createCrudHandler)
The core function for setting up your API endpoints. createCrudHandler utilizes the CrudRegistry and your configurations to:

Wrap a dispatch function.
Handle success and error responses.
Set up the API endpoint logic.
The dispatch Function (Dispatcher)
The dispatch function, located in lib/api/dispatcher.ts, is the heart of the request processing pipeline. It orchestrates the following:

Registry Lookup: Verifies that the requested action is whitelisted and exists in the CrudRegistry.
Authentication & Authorization: Integrates with NextAuth (using getServerSession) to perform authentication and role-based authorization checks based on meta.restricted (Page 1, Line 28).
Rate Limiting: Enforces rate limits to protect your API from abuse.
Input Sanitization: Cleans incoming request arguments, removing any protectedFields.
Middleware Execution: Runs global and per-model middleware for request processing.
Handler Resolution & Execution: Calls the appropriate handler function based on the request.
Response Sanitization: Formats both success and error responses, ensuring sensitive data is not leaked and consistent response structures are maintained (Page 2, Line 12).
The dispatch function acts as a critical pipeline, ensuring that all policies are applied before a request is fulfilled.

Pluggable Interfaces
@universal-crud/next is designed for flexibility, allowing you to plug in your preferred solutions for common backend concerns:

resolveAuth: Implement your authentication strategy. The default integration uses NextAuth (getServerSession).
RateLimiter: Configure your rate limiting mechanism.
logger: Define your logging strategy for tracking API activity and errors.
Client-Side Hooks (Optional)
For frontend consumption, @universal-crud/next offers a set of lightweight, zero-dependency hooks:

SimpleQueryClient: A basic client for making API requests.
useCrudQuery: A hook for fetching data, similar to TanStack React Query’s useQuery.
useCrudMutation: A hook for performing mutations (POST, PUT, DELETE), analogous to TanStack React Query’s useMutation.
These hooks provide a convenient way to interact with your backend API from a React frontend without introducing heavy dependencies.

Architecture & Use Cases
Next.js App Router: Ideal for building server-side APIs within your Next.js application.
Standalone Node.js APIs: Can be used with frameworks like Express or Fastify for building independent backend services.
Frontend Consumption: Can be consumed by any React frontend, whether it’s part of your Next.js app or a separate client.
Getting Started
Installation:
bash
    npm install @universal-crud/next
    # or
    yarn add @universal-crud/next
Define Models: Create your model files (e.g., lib/crud/models/user.ts) containing your business logic.
Define Metadata: Add CrudMeta to your models to specify allowed actions, protected fields, and role restrictions.
Generate Registry: Run the build-time script (e.g., generate-registry.ts) to create lib/crud/registry.ts.
Create API Handler: Use createCrudHandler in your Next.js API routes or Node.js server to set up your endpoints.
Implement Integrations: Configure authentication, rate limiting, and logging as needed.
Architectural Choice for Data Fetching
When it comes to client-side data fetching, @universal-crud/next supports multiple approaches:

Optional TanStack Query Integration: If you’re already using TanStack Query, you can integrate it with our API.
Built-in Lightweight Layer: Use the provided useCrudQuery and useCrudMutation hooks for a zero-dependency solution. This is the current default and recommended approach for simplicity and minimal bundle size.
Support Both: The architecture allows for flexibility, enabling you to use either approach or even a hybrid.