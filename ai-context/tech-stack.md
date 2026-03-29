# Tech Stack

## Frontend

| Technology | Purpose |
|-----------|---------|
| Angular 21 | SPA framework |
| Angular Router | Routing, lazy loading |
| Angular Signals | Reactive state management |
| Angular HttpClient | API communication |
| Chart.js (ng2-charts) | Line charts, radar charts |
| CSS Variables + SCSS | Styling, theming |

### Frontend Principles
- Standalone components (no NgModules for features)
- Signals for state management (no RxJS where signals suffice)
- Lazy-loaded feature routes
- Responsive/mobile-first design
- Bundle size monitoring — avoid heavy libraries

## Backend

| Technology | Purpose |
|-----------|---------|
| NestJS | API framework |
| Mongoose (via @nestjs/mongoose) | MongoDB ODM |
| Passport + @nestjs/passport | Authentication |
| passport-google-oauth20 | Google OAuth 2.0 |
| @nestjs/jwt | JWT tokens for session |
| class-validator + class-transformer | DTO validation |

### Backend Principles
- RESTful API design
- JWT-based auth (Google OAuth for login, JWT for session)
- Validation via DTOs with class-validator
- MongoDB aggregation pipelines for reports
- Each module is self-contained

## Database

- **MongoDB** via MongoDB Atlas (Free Tier M0, 512MB)
- Region: AWS EU (Frankfurt)
- ODM: Mongoose

## Deployment

- **Docker** containers for both frontend and backend
- **Railway** for hosting (EU region, Docker-first, $5 free credit/month)
- **MongoDB Atlas** for database (separate, free tier)

## Development

- **docker-compose.yml** for local dev (frontend + backend + local MongoDB)
- Node.js 22 LTS
