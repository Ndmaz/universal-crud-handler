# Next.js Example

Minimal consumer application for @universal-crud/next.

Run from this directory:

    npm install
    npm run dev

Then try:

    curl "http://localhost:3000/api/User/find"
    curl -X POST "http://localhost:3000/api/User/create" -H "Content-Type: application/json" -d '{"name":"Bob","email":"bob@example.com","password":"hidden"}'

The password field exists in the model but is removed from the response by protectedFields.

Delete is configured as ADMIN-only. This minimal example intentionally has no authentication provider.
