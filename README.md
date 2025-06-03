# Patient API

An example, secure RESTful API for managing patient data and user authentication built with Express, TypeScript, and Prisma ORM.

## Features

- Example User authorization with role-based access control
- Patient data management with secure encryption for sensitive information
- RESTful API design following best practices
- PostgreSQL database integration via Prisma ORM
- Containerized with Docker for easy deployment
- Observability with OpenTelemetry instrumentation
- CI/CD pipeline with auto-deployment

## Tech Stack

- **Runtime**: Node.js v22.16
- **Framework**: Express 5.1.0
- **Language**: TypeScript 5.8.3
- **ORM**: Prisma 6.8.2
- **Database**: PostgreSQL
- **Logging**: Winston 3.17.0

## Prerequisites

- Node.js (v22+)
- npm (v11+)
- PostgreSQL database
- Docker (optional, for containerized deployment)
- Terraform (optional, for quick deployment to Render!)

## Getting Started

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/patient_db
```

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:gen

# Run database migrations
npm run db:migrate

# Build the application
npm run build
```

### Development

```bash
# Start development server with hot-reload
npm run dev
```

### Production

```bash
# Build and start production server
npm run build
npm start
```
## Scripts

- `npm run build` - Compiles TypeScript to JavaScript
- `npm start` - Starts the production server
- `npm run dev` - Starts the development server with hot-reload
- `npm run lint` - Lints the source code
- `npm run db:gen` - Generates Prisma client
- `npm run db:migrate` - Runs database migrations
- `npm run db:seed` - Seeds the database with initial data



## Deployment

### Docker Deployment

The application can be containerized and deployed using Docker. 

Make sure to include your database url so that Docker can migrate the database schema.

```bash
# Build the Docker image
docker build -t patient-api --build-arg DATABASE_URL="<database_connection_string>" .

# Run the container
docker run -p 3000:3000 --env-file .env patient-api
```

### Render Deployment

The application can be deployed to Render.com using either Terraform (`terraform -chdir=./terraform apply`) or the [Render Blueprint](https://render.com/docs/infrastructure-as-code) `render.yaml`.

**Note that the example app requires a paid plan to deploy due to resource restrictions on the free plan.**

## Database Schema

The application uses Prisma ORM with a PostgreSQL database. The main data models are defined in the `prisma/schema.prisma` file:

- **User**: Authorization with role-based access (Admin, Provider, Billing)
- **Patient**: Patient demographic and identification information with encryption for sensitive data

Database seeding is implemented via Prisma's seed functionality (see `prisma/seed.ts`).


## API Endpoints

The API is accessible at `/api/` and includes the following endpoints:

- GET `api/patients`: get all patients (with encrypted SSN's)
- GET `api/patients/<patientId>`: get single patient by id (with SSN decrypted)
- POST `api/patients`: create a new patient with the following data payload:
    ```json
    {
	"firstName": "test first 2",
	"lastName": "test Last 2",
	"dob": "2022-09-27",
	"ssn": "666-66-7777"
    }
  ```
  
To showcase an example of RBAC user authorization, the API calls should include a `user-id` header. A test user with each role is included in the seed script:
- User `1`: `BILLING`
- User `2`: `ADMIN`
- User `3`: `PROVIDER`

In this example, user `1` and `2` would be able to access the patient resource, but not user `3`.

```bash
curl --request GET \
  --url http://localhost:3000/api/patients/1 \
  --header 'user-id: 2'
```