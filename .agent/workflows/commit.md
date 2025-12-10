---
description: How to commit changes with proper versioning
---

# Git Version Control Workflow

This workflow ensures consistent versioning and commit practices for the LLS project.

## Quick Commit (No Version Change)

For small fixes or improvements that don't warrant a version bump:

// turbo
1. Stage your changes:
```bash
git add .
```

2. Commit with a descriptive message using conventional commits:
```bash
git commit -m "type(scope): description"
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

// turbo
3. Push to GitHub:
```bash
git push origin main
```

---

## Version Release (Feature/Fix Complete)

For changes that warrant a version update:

### 1. Determine Version Type

- **PATCH** (1.0.X): Bug fixes, minor improvements
- **MINOR** (1.X.0): New features, backwards compatible
- **MAJOR** (X.0.0): Breaking changes

### 2. Update VERSION file

Edit `/VERSION` with the new version number.

### 3. Update CHANGELOG.md

Add a new section at the top of CHANGELOG.md:
```markdown
## [X.X.X] - YYYY-MM-DD

### Added
- New features

### Changed
- Modified features

### Fixed
- Bug fixes

### Removed
- Removed features
```

// turbo
### 4. Stage and commit version bump:
```bash
git add .
git commit -m "chore(release): bump version to X.X.X"
```

// turbo
### 5. Create a git tag:
```bash
git tag -a vX.X.X -m "Version X.X.X - Brief description"
```

// turbo
### 6. Push with tags:
```bash
git push origin main --tags
```

---

## Commit Message Examples

```bash
# Features
git commit -m "feat(quiz): add multiple choice question support"
git commit -m "feat(auth): implement JWT token refresh"

# Bug Fixes
git commit -m "fix(modal): resolve quiz modal not opening on click"
git commit -m "fix(api): handle empty response in course fetch"

# Documentation
git commit -m "docs(readme): add deployment instructions"

# Refactoring
git commit -m "refactor(routes): split learning routes into modules"

# Maintenance
git commit -m "chore(deps): update React to v19"
```

---

## View Version History

// turbo
```bash
git log --oneline -10
```

// turbo
```bash
git tag -l
```
