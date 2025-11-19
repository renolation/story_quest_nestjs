# Branches Module

**Phase**: 7
**Status**: 🔲 TODO
**Priority**: LOW (After Flutter MVP)

## Purpose
Manage physical branch locations for centers.

## Features
- [ ] CRUD operations for branches
- [ ] List branches by center
- [ ] Branch activation/deactivation
- [ ] List classes for a branch
- [ ] Branch-level analytics

## Entities
- **Branch**: Branch location details

## Dependencies
- Centers module
- Classes module

## Implementation Order
1. Create entities and DTOs
2. Implement branches service with CRUD
3. Add center-based filtering
4. Create activation/deactivation logic
5. Add REST endpoints with role guards

## API Endpoints

### Center Endpoints
- `GET /center/branches` - List own center's branches
- `POST /center/branches` - Create new branch
- `GET /center/branches/:id` - Get branch details
- `PATCH /center/branches/:id` - Update branch
- `DELETE /center/branches/:id` - Delete branch

### Agency Endpoints
- `GET /agency/branches` - List all branches across all centers

## Access Control
- **AGENCY role**: Full access to all branches
- **CENTER role**: CRUD on own center's branches only

## Validation Rules
- Branch must belong to a valid center
- Unique branch name within a center
- Valid contact information

## Testing
- [ ] Unit tests for branches service
- [ ] Test role-based filtering (center-specific)
- [ ] Integration tests for CRUD operations
- [ ] E2E tests for branch management
