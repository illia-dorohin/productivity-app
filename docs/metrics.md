# Metrics & Rating System

## Overview

The app uses a hierarchical rating system where users score themselves daily on various metrics (1–5 scale). Scores are aggregated upward through groups using weighted averages.

## Hierarchy

```
Overall Score (weighted average of top-level groups)
│
├── Productivity (group, weight: 1)
│   ├── Work (rating)
│   └── Additional Activities (group)
│       ├── Drone Factory (rating)
│       ├── Glass (rating)
│       ├── Creativity (rating)
│       └── Other Activities (rating)
│
├── Brain Rot (group, weight: 1)
│   ├── Computer Games (rating, "5 = didn't play")
│   └── Other Destructive Activities (rating, "5 = no time wasted")
│
├── Health (group, weight: 1)
│   └── Sport (rating)
│
├── Mental Health (rating, weight: 1)
│
└── Relationships (group, weight: 1)
    ├── Communication with Partner (rating)
    └── Actions towards Partner (rating)
```

## Metric Types

| Type | Description |
|------|-------------|
| `rating` | Leaf node. User assigns a score from 1 to 5. |
| `group` | Container node. Score is computed as the weighted average of its children. |

A top-level item can be either type. For example, "Mental Health" is a `rating` (scored directly), while "Productivity" is a `group` (computed from children).

## Score Calculation

### Step 1: Leaf scores

The user provides 1–5 scores for each leaf metric (`type: 'rating'`). Unrated metrics are skipped entirely — they don't count as 0.

### Step 2: Group averages (recursive)

For each group, compute the weighted average of its children:

```
group_score = Σ(child_score × child_weight) / Σ(child_weight)
```

Only children that have data are included. If a group has no children with scores, the group's score is `null` (excluded from parent calculation).

### Step 3: Overall Score

The overall score is the weighted average of top-level groups/metrics:

```
overall = Σ(top_level_score × weight) / Σ(weight)
```

Again, only groups/metrics with data are included.

### Example

Given scores: Work=4, Drone Factory=3, Sport=5, Mental Health=4

```
Additional Activities = 3/1 = 3.0    (only Drone Factory has data)
Productivity = (4×1 + 3×1) / 2 = 3.5   (Work + Additional Activities)
Health = 5/1 = 5.0                    (Sport)
Mental Health = 4                      (direct rating)

Brain Rot = null                       (no scores)
Relationships = null                   (no scores)

Overall = (3.5 + 5.0 + 4.0) / 3 = 4.17
```

Brain Rot and Relationships are excluded because they have no data.

## Weight System

- Each metric/group has a `weight` property (default: 1)
- Weights are relative within a parent group
- Example: if Work has weight 2 and Additional Activities has weight 1, Work counts twice as much in the Productivity average

## Data Storage

Scores are stored in the `ratings` collection, one document per user per day:

```json
{
  "userId": "ObjectId",
  "date": "2026-03-29",
  "scores": [
    { "metricId": "ObjectId (leaf metric)", "value": 4 },
    { "metricId": "ObjectId (leaf metric)", "value": 3 }
  ]
}
```

Only leaf-level scores are stored. Group scores are always computed on-the-fly.

## Customization

Users can manage the hierarchy from the Settings page:

- **Add** new metrics or groups at any level
- **Delete** a metric (soft-delete: sets `isActive: false`, historical data preserved)
- **Reorder** metrics within their parent
- **Change weights** to adjust how much each metric contributes

### Slug Convention

Each metric has a unique slug per user (e.g., `computer-games`, `work`). Slugs are auto-generated from the name and used for:
- Trend data keys in reports
- Stable identifiers across API calls

## Weekly & Monthly Reports

Reports aggregate daily scores over a date range:

1. Fetch all ratings in the range
2. For each day, compute group averages using the current metrics tree
3. Average each group's daily scores across the range
4. Compute overall average from group averages

Only days with data are counted — missing days don't drag down averages.
