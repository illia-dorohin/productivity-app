# Data Model (MongoDB)

## Collections

### users
```json
{
  "_id": "ObjectId",
  "googleId": "string",
  "email": "string",
  "name": "string",
  "avatar": "string (URL)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### metrics (rating categories hierarchy)
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users)",
  "name": "string",
  "slug": "string (unique per user, e.g. 'computer-games')",
  "description": "string (optional, e.g. '5 = didn't play at all')",
  "parentId": "ObjectId | null (ref: metrics, null = top-level group)",
  "type": "enum: 'group' | 'rating'",
  "weight": "number (default: 1, used in weighted average)",
  "order": "number (display order within parent)",
  "isActive": "boolean (soft delete, default: true)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```
- `type: 'group'` — container, not rated directly, calculates average of children
- `type: 'rating'` — leaf node, user gives 1-5 score
- `parentId: null` — top-level group (Productivity, Brain Rot, Health, etc.)
- Deactivated metrics (`isActive: false`) are excluded from new ratings but historical data is preserved

### ratings (daily scores)
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users)",
  "date": "Date (normalized to YYYY-MM-DD, one entry per user per date)",
  "scores": [
    {
      "metricId": "ObjectId (ref: metrics, only type: 'rating')",
      "value": "number (1-5)"
    }
  ],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```
- One document per user per day
- `scores` array contains only leaf-level ratings (type: 'rating')
- Group scores are calculated on-the-fly from children
- Missing scores (not in array) are ignored in calculations

### tasks
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users)",
  "title": "string",
  "description": "string (optional)",
  "status": "enum: 'not_started' | 'in_progress' | 'done'",
  "progress": "number (0-100, optional)",
  "priority": "enum: 'high' | 'medium' | 'low' | null",
  "deadline": "Date | null",
  "tags": ["string"],
  "order": "number (display order)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### notes
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users)",
  "text": "string",
  "date": "Date (user-assigned date, can be any day)",
  "tags": ["string"],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Indexes

- `users`: unique on `googleId`, unique on `email`
- `metrics`: compound `{ userId, parentId, order }`, compound `{ userId, slug }` unique
- `ratings`: compound `{ userId, date }` unique
- `tasks`: compound `{ userId, order }`
- `notes`: compound `{ userId, date }`

## Aggregation Logic

### Daily Score Calculation
1. Fetch user's active metrics tree
2. Fetch rating document for the day
3. For each group, recursively compute weighted average of children
4. Missing scores are excluded (not counted as 0)
5. Overall Score = weighted average of top-level groups (only those with data)

### Weekly/Monthly Reports
- Aggregate daily overall/group scores across the date range
- Average only over days that have data
