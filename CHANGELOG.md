# Changelog

All notable changes to the Language Learning System (LLS) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-10

### Added
- **Backend (Flask)**
  - SQLAlchemy database models for all entities
  - Authentication routes (login, register, logout)
  - Academic routes (academic years, programs, courses)
  - Staff management routes
  - Student management routes
  - Learning routes (materials, quizzes, MCQs)
  - Submission and evaluation routes

- **Frontend (React + Vite)**
  - Login page with authentication
  - Dashboard with overview statistics
  - Academic Years management page
  - Programs management page
  - Courses management with detail view
  - Staff management page
  - Students management page
  - Assignments page
  - Results page
  - Reusable Navbar and Sidebar components
  - API service layer for backend communication

### Technical
- Flask backend with modular route structure
- React frontend with Vite build tool
- Tailwind CSS for styling
- SQLite database for development

---

## Version Guidelines

### Semantic Versioning: MAJOR.MINOR.PATCH

- **MAJOR** (1.x.x): Breaking changes, major rewrites
- **MINOR** (x.1.x): New features, backwards compatible
- **PATCH** (x.x.1): Bug fixes, small improvements

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

### Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples:
```
feat(auth): add password reset functionality
fix(courses): resolve quiz modal not opening
docs(readme): update installation instructions
refactor(api): modularize route handlers
```
