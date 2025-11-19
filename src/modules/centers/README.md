# Centers Module

**Phase**: 7
**Status**: 🔲 TODO
**Priority**: LOW (After Flutter MVP)

## Purpose
Manage English learning centers (organizations) that own branches and manage teachers.

## Features
- [ ] CRUD operations for centers
- [ ] Center status management (active/inactive/suspended)
- [ ] Business license validation
- [ ] List branches for a center
- [ ] List teachers for a center
- [ ] Center analytics and reporting
- [ ] Center profile management

## Entities
- **Center**: Organization/center details

## Dependencies
- Users module (for agency association)
- Branches module
- Teachers module

## Implementation Order
1. Create entities and DTOs
2. Implement centers service with CRUD
3. Add validation for business license
4. Create status management logic
5. Implement analytics queries
6. Add REST endpoints with role guards

## API Endpoints

### Agency Endpoints (Super Admin)
- `GET /agency/centers` - List all centers
- `POST /agency/centers` - Create new center
- `GET /agency/centers/:id` - Get center details
- `PATCH /agency/centers/:id` - Update center
- `DELETE /agency/centers/:id` - Delete/suspend center

### Center Endpoints (Own Data)
- `GET /center/profile` - Get own center profile
- `PATCH /center/profile` - Update own center profile

## Access Control
- **AGENCY role**: Full CRUD access to all centers
- **CENTER role**: Read/Update own center only (no delete)

## Validation Rules
- Unique center name
- Valid business license format
- Valid email and phone format
- Logo URL validation (if provided)

## Testing
- [ ] Unit tests for centers service
- [ ] Test role-based access control
- [ ] Integration tests for CRUD operations
- [ ] Test business license validation
- [ ] E2E tests for center management
