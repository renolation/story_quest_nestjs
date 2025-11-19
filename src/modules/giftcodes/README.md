# Giftcodes Module

**Phase**: 7
**Status**: 🔲 TODO
**Priority**: LOW (After Flutter MVP)

## Purpose
Manage trial codes, discount codes, and access management for student accounts.

## Features
- [ ] Create/generate giftcodes
- [ ] Validate giftcode redemption
- [ ] Track giftcode usage
- [ ] Manage expiration and max uses
- [ ] Bulk code generation
- [ ] Usage analytics and reporting
- [ ] Code activation/deactivation

## Entities
- **Giftcode**: Code details with validity period
- **GiftcodeUsage**: Redemption tracking

## Dependencies
- Centers module
- Users module (students)

## Implementation Order
1. Create entities and DTOs
2. Implement giftcode service with CRUD
3. Add code generation utility (random alphanumeric)
4. Implement redemption validation logic
5. Create usage tracking service
6. Add bulk generation endpoint
7. Create REST endpoints with role guards

## API Endpoints

### Center Endpoints
- `GET /center/giftcodes` - List own center's giftcodes
- `POST /center/giftcodes` - Create giftcode
- `POST /center/giftcodes/bulk` - Bulk generate giftcodes
- `PATCH /center/giftcodes/:id` - Update giftcode
- `DELETE /center/giftcodes/:id` - Deactivate giftcode
- `GET /center/giftcodes/:id/usage` - View redemption history

### Agency Endpoints
- `GET /agency/giftcodes` - List all giftcodes across centers
- `GET /agency/giftcodes/analytics` - System-wide usage analytics

### Student Endpoints (Public)
- `POST /giftcodes/redeem` - Redeem a giftcode
- `GET /giftcodes/validate/:code` - Check if code is valid

## Code Types
- `trial` - Free trial access (e.g., 7 days)
- `discount` - Discount on subscription
- `full_access` - Full access for duration

## Redemption Validation Rules
- Code must exist and be active
- Code must not be expired (check valid_from/valid_to)
- Code must have remaining uses (used_count < max_uses)
- Student cannot redeem same code twice
- Grant access duration to student account

## Code Generation
```typescript
// Example: Generate 100 trial codes
POST /center/giftcodes/bulk
{
  "quantity": 100,
  "codeType": "trial",
  "durationDays": 7,
  "validFrom": "2024-01-01",
  "validTo": "2024-12-31",
  "maxUses": 1
}
```

## Business Logic
- Auto-increment `usedCount` on redemption
- Prevent duplicate redemption (check GiftcodeUsage table)
- Validate expiration dates before redemption
- Update student account with access duration

## Testing
- [ ] Unit tests for giftcode service
- [ ] Test redemption validation logic
- [ ] Test bulk code generation
- [ ] Test expiration date handling
- [ ] Test max uses enforcement
- [ ] E2E tests for complete redemption flow
