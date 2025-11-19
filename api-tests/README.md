# API Testing Collection

This directory contains REST Client files for testing the Story Quest API.

## Prerequisites

1. **Install REST Client Extension** for VS Code:
   - Open VS Code
   - Go to Extensions (Cmd+Shift+X)
   - Search for "REST Client"
   - Install by Huachao Mao

2. **Start the API Server**:
   ```bash
   npm run start:dev
   ```

3. **Seed the Database** (if not already done):
   ```bash
   npm run seed:reset
   ```

## Test Files

### 1. `auth.http` - Authentication Tests
Tests for user authentication and authorization:
- Health check
- User registration (all roles)
- Login (all roles)
- Get current user
- Change password
- Token extraction and reuse

**Start Here**: Run this file first to get authentication tokens for other tests.

### 2. `content.http` - Content Management Tests
Tests for chapters, units, levels, and questions:
- CRUD operations for all content types
- Authorization checks (teacher vs student)
- Validation tests
- Error handling

**Prerequisites**: Run `auth.http` first and copy tokens.

### 3. `progress.http` - Progress Tracking Tests
Tests for student learning progress:
- Get progress summary
- Start level attempts
- Submit answers
- Complete levels
- Full workflow tests

**Prerequisites**: Run `auth.http` first and use student token.

## How to Use

### Method 1: VS Code REST Client (Recommended)

1. Open any `.http` file in VS Code
2. Click "Send Request" above each request
3. View response in the right panel
4. Tokens are automatically extracted and reused

**Example**:
```http
### Login as Student
# @name studentLogin
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "identifier": "student1@test.com",
  "password": "Password123"
}

### Use the token
@studentToken = {{studentLogin.response.body.accessToken}}

### Get current user
GET http://localhost:3000/api/v1/auth/me
Authorization: Bearer {{studentToken}}
```

### Method 2: cURL (Manual)

Convert HTTP requests to cURL:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "student1@test.com",
    "password": "Password123"
  }'
```

### Method 3: Postman

Import the `.http` files:
1. Open Postman
2. File → Import
3. Select `.http` files
4. Postman will auto-convert them

## Test Credentials

All users have password: **Password123**

### Administrative Accounts
- **Agency**: `agency@storyquest.com`
- **Centers**: `center1@storyquest.com`, `center2@storyquest.com`, `center3@storyquest.com`
- **Teachers**: `teacher1@storyquest.com` through `teacher5@storyquest.com`
- **Reviewers**: `reviewer1@storyquest.com`, `reviewer2@storyquest.com`

### Student Accounts
- `student1@test.com` through `student20@test.com`

## Expected Response Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | No token or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable Entity | Business logic error |
| 500 | Internal Server Error | Server error |

## Testing Checklist

### Authentication (`auth.http`)
- [ ] Health check returns 200
- [ ] Register new student succeeds
- [ ] Register with invalid email fails (400)
- [ ] Register with weak password fails (400)
- [ ] Login with correct credentials succeeds
- [ ] Login with wrong password fails (401)
- [ ] Get current user with token succeeds
- [ ] Get current user without token fails (401)
- [ ] Change password succeeds
- [ ] Change password with wrong current password fails

### Content Management (`content.http`)
- [ ] Get all chapters returns array
- [ ] Get chapter by ID returns object
- [ ] Get chapter with invalid ID fails (404)
- [ ] Create chapter as teacher succeeds
- [ ] Create chapter as student fails (403)
- [ ] Create chapter without token fails (401)
- [ ] Update chapter succeeds
- [ ] Same tests for units, levels, questions

### Progress Tracking (`progress.http`)
- [ ] Get progress summary returns data
- [ ] Start level creates new attempt
- [ ] Submit answer returns immediate feedback
- [ ] Submit answer with invalid attempt fails
- [ ] Complete level updates progress
- [ ] Complete level with score > 100 fails (400)
- [ ] Progress reflects completed levels
- [ ] Chapter/unit progress calculated correctly

## Seeded Data Overview

The database is seeded with:
- **31 users**: 1 agency, 3 centers, 5 teachers, 2 reviewers, 20 students
- **10 chapters**: Educational topics (Greetings, Numbers, etc.)
- **45 units**: 3-5 units per chapter
- **135 levels**: 3 difficulty levels per unit (Easy, Medium, Hard)
- **999 questions**: 5-10 questions per level
- **~3996 answer options**: 4 options per question
- **Progress data**: Various student progress scenarios

## Tips

1. **Token Management**:
   - Use `# @name` to save responses
   - Extract tokens with `@token = {{response.body.accessToken}}`
   - Tokens are valid for 90 days

2. **Sequential Testing**:
   - Run `auth.http` first
   - Copy tokens to other files
   - Or use variables: `{{studentToken}}`

3. **Error Testing**:
   - Each file includes negative test cases
   - Check error messages and codes
   - Verify validation works

4. **Workflow Testing**:
   - `progress.http` includes complete workflow
   - Start → Answer → Complete → Check Progress

5. **Debugging**:
   - Check server logs in terminal
   - View request/response in VS Code panel
   - Use network inspector if needed

## Troubleshooting

### "Connection Refused"
- Server not running: `npm run start:dev`
- Check port 3000 is not in use: `lsof -ti:3000`

### "401 Unauthorized"
- Token expired or invalid
- Run `auth.http` again to get new token
- Check Authorization header format

### "404 Not Found"
- Check URL and endpoint path
- Verify ID exists in database
- Check seeded data

### "422 Unprocessable Entity"
- Business logic error
- Check request body matches expected format
- Verify foreign key relationships

## Next Steps

After completing API tests:
1. Document any bugs or issues found
2. Create automated test suite (Jest/Supertest)
3. Add more edge case tests
4. Test with different user roles
5. Performance testing with large datasets

## Related Documentation

- [API Design Guidelines](../docs/API_DESIGN_GUIDELINES.md)
- [Authentication System](../docs/AUTH_README.md)
- [Progress Tracking](../docs/PROGRESS_TRACKING_IMPLEMENTATION.md)
- [Day 2 Plan](../docs/plans/DAY_2_PLAN.md)

---

**Created**: 2025-11-19
**Version**: 1.0
**Status**: Ready for Testing
