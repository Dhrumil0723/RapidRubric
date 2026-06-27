# RapidRubric — Live API Evidence (auto-captured)

Captured 2026-06-27T19:48:01.220Z against `http://localhost:3001` running on a local Supabase stack (Auth + PostgREST + Storage).

## Security endpoints — Authentication

### Login as instructor (success)

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "instructor@test.com",
  "password": "Password123!"
}
```

**Response — HTTP 200  ✅ (expected 200)**

```json
{
  "access_token": "eyJhbGciOiJFUzI1NiIsImtp…(truncated)",
  "refresh_token": "…(truncated)",
  "expires_in": 3600,
  "user": {
    "id": "f280d92c-a256-44a7-8a67-98a79b0d7fda",
    "email": "instructor@test.com",
    "full_name": "Test Instructor",
    "role": "instructor"
  }
}
```

### Login with wrong password (auth failure)

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "instructor@test.com",
  "password": "wrongpass"
}
```

**Response — HTTP 401  ✅ (expected 401)**

```json
{
  "message": "Invalid credentials"
}
```


## FEATURE 2 — Rubric Builder (implemented & deployed endpoints)

### GET /api/rubrics — list before create (persistence baseline: 1)

```http
GET /api/rubrics
```

**Response — HTTP 200  ✅ (expected 200)**

```json
[
  {
    "id": "1163de17-7175-4b31-bf48-555754edc48e",
    "instructor_id": "f280d92c-a256-44a7-8a67-98a79b0d7fda",
    "title": "Essay Rubric",
    "criteria": [
      {
        "id": "c1",
        "name": "Thesis & Argument",
        "max_score": 25,
        "description": "Clear, defensible thesis"
      },
      {
        "id": "c2",
        "name": "Structure",
        "max_score": 25,
        "description": "Logical organization"
      },
      {
        "id": "c3",
        "name": "Evidence",
        "max_score": 25,
        "description": "Use of sources/citations"
      },
      {
        "id": "c4",
        "name": "Grammar & Style",
        "max_score": 25,
        "description": "Mechanics and clarity"
      }
    ],
    "locked": false,
    "created_at": "2026-06-27T19:48:00.577362+00:00",
    "updated_at": "2026-06-27T19:48:00.577362+00:00"
  }
]
```

### POST /api/rubrics — create rubric (success)

```http
POST /api/rubrics
Content-Type: application/json

{
  "title": "Research Paper Rubric",
  "criteria": [
    {
      "name": "Originality",
      "description": "Novelty of the contribution",
      "max_score": 30
    },
    {
      "name": "Methodology",
      "description": "Soundness of methods",
      "max_score": 40
    },
    {
      "name": "Clarity",
      "description": "Writing and presentation",
      "max_score": 30
    }
  ]
}
```

**Response — HTTP 201  ✅ (expected 201)**

```json
{
  "id": "200b39e4-5ca5-45c8-96bb-08fc619d7d3c",
  "instructor_id": "f280d92c-a256-44a7-8a67-98a79b0d7fda",
  "title": "Research Paper Rubric",
  "criteria": [
    {
      "id": "c1",
      "name": "Originality",
      "max_score": 30,
      "description": "Novelty of the contribution"
    },
    {
      "id": "c2",
      "name": "Methodology",
      "max_score": 40,
      "description": "Soundness of methods"
    },
    {
      "id": "c3",
      "name": "Clarity",
      "max_score": 30,
      "description": "Writing and presentation"
    }
  ],
  "locked": false,
  "created_at": "2026-06-27T19:48:02.499327+00:00",
  "updated_at": "2026-06-27T19:48:02.499327+00:00"
}
```

### GET /api/rubrics — list after create (now 2; proves persistence)

```http
GET /api/rubrics
```

**Response — HTTP 200  ✅ (expected 200)**

```json
[
  {
    "id": "200b39e4-5ca5-45c8-96bb-08fc619d7d3c",
    "instructor_id": "f280d92c-a256-44a7-8a67-98a79b0d7fda",
    "title": "Research Paper Rubric",
    "criteria": [
      {
        "id": "c1",
        "name": "Originality",
        "max_score": 30,
        "description": "Novelty of the contribution"
      },
      {
        "id": "c2",
        "name": "Methodology",
        "max_score": 40,
        "description": "Soundness of methods"
      },
      {
        "id": "c3",
        "name": "Clarity",
        "max_score": 30,
        "description": "Writing and presentation"
      }
    ],
    "locked": false,
    "created_at": "2026-06-27T19:48:02.499327+00:00",
    "updated_at": "2026-06-27T19:48:02.499327+00:00"
  },
  {
    "id": "1163de17-7175-4b31-bf48-555754edc48e",
    "instructor_id": "f280d92c-a256-44a7-8a67-98a79b0d7fda",
    "title": "Essay Rubric",
    "criteria": [
      {
        "id": "c1",
        "name": "Thesis & Argument",
        "max_score": 25,
        "description": "Clear, defensible thesis"
      },
      {
        "id": "c2",
        "name": "Structure",
        "max_score": 25,
        "description": "Logical organization"
      },
      {
        "id": "c3",
        "name": "Evidence",
        "max_score": 25,
        "description": "Use of sources/citations"
      },
      {
        "id": "c4",
        "name": "Grammar & Style",
        "max_score": 25,
        "description": "Mechanics and clarity"
      }
    ],
    "locked": false,
    "created_at": "2026-06-27T19:48:00.577362+00:00",
    "updated_at": "2026-06-27T19:48:00.577362+00:00"
  }
]
```

### GET /api/rubrics/:id — fetch the persisted rubric by id

```http
GET /api/rubrics/200b39e4-5ca5-45c8-96bb-08fc619d7d3c
```

**Response — HTTP 200  ✅ (expected 200)**

```json
{
  "id": "200b39e4-5ca5-45c8-96bb-08fc619d7d3c",
  "instructor_id": "f280d92c-a256-44a7-8a67-98a79b0d7fda",
  "title": "Research Paper Rubric",
  "criteria": [
    {
      "id": "c1",
      "name": "Originality",
      "max_score": 30,
      "description": "Novelty of the contribution"
    },
    {
      "id": "c2",
      "name": "Methodology",
      "max_score": 40,
      "description": "Soundness of methods"
    },
    {
      "id": "c3",
      "name": "Clarity",
      "max_score": 30,
      "description": "Writing and presentation"
    }
  ],
  "locked": false,
  "created_at": "2026-06-27T19:48:02.499327+00:00",
  "updated_at": "2026-06-27T19:48:02.499327+00:00"
}
```


## FEATURE 2 — Rubric Builder: error & authorization cases

### POST /api/rubrics — NO token (401 Unauthorized)

```http
POST /api/rubrics
Content-Type: application/json

{
  "title": "Research Paper Rubric",
  "criteria": [
    {
      "name": "Originality",
      "description": "Novelty of the contribution",
      "max_score": 30
    },
    {
      "name": "Methodology",
      "description": "Soundness of methods",
      "max_score": 40
    },
    {
      "name": "Clarity",
      "description": "Writing and presentation",
      "max_score": 30
    }
  ]
}
```

**Response — HTTP 401  ✅ (expected 401)**

```json
{
  "message": "Missing auth token"
}
```

### POST /api/rubrics — student token (403 Forbidden / RBAC)

```http
POST /api/rubrics
Content-Type: application/json

{
  "title": "Research Paper Rubric",
  "criteria": [
    {
      "name": "Originality",
      "description": "Novelty of the contribution",
      "max_score": 30
    },
    {
      "name": "Methodology",
      "description": "Soundness of methods",
      "max_score": 40
    },
    {
      "name": "Clarity",
      "description": "Writing and presentation",
      "max_score": 30
    }
  ]
}
```

**Response — HTTP 403  ✅ (expected 403)**

```json
{
  "message": "Insufficient permissions"
}
```

### POST /api/rubrics — invalid body (400 validation)

```http
POST /api/rubrics
Content-Type: application/json

{
  "title": "",
  "criteria": []
}
```

**Response — HTTP 400  ✅ (expected 400)**

```json
{
  "message": "title is required and must be a non-empty string"
}
```


## FEATURE 1 — Draft Submission & File Upload

### GET /api/assignments — open assignments for the student

```http
GET /api/assignments
```

**Response — HTTP 200  ✅ (expected 200)**

```json
[
  {
    "id": "61e54514-bd85-4f64-94ac-a9dd2493ec55",
    "title": "Essay 1: Argumentative Writing",
    "description": "Submit a 1000-word argumentative essay as a PDF.",
    "due_at": "2026-07-11T19:48:00.582+00:00",
    "allow_resubmission": true,
    "course_id": "a3d8ee59-914d-4a52-a0e0-51da45260ee4"
  }
]
```

### POST /api/submissions/:assignmentId — upload PDF (success)

```http
POST /api/submissions/61e54514-bd85-4f64-94ac-a9dd2493ec55
Content-Type: multipart/form-data  (file=essay.pdf, comments=...)
```

**Response — HTTP 201  ✅ (expected 201)**

```json
{
  "id": "3da7b9de-fb81-46da-870f-851782c4b935",
  "status": "ai_processing",
  "version_no": 1
}
```

### POST /api/submissions/:assignmentId — non-PDF upload (400)

```http
POST /api/submissions/61e54514-bd85-4f64-94ac-a9dd2493ec55
Content-Type: multipart/form-data  (file=essay.pdf, comments=...)
```

**Response — HTTP 400  ✅ (expected 400)**

```json
{
  "message": "A PDF file is required"
}
```


## FEATURE 3 — TA Review & Approval Queue

### GET /api/ta/queue — TA review queue

```http
GET /api/ta/queue
```

**Response — HTTP 200  ✅ (expected 200)**

```json
[
  {
    "id": "3da7b9de-fb81-46da-870f-851782c4b935",
    "status": "pending_ta_review",
    "version_no": 1,
    "assignment_title": "Essay 1: Argumentative Writing",
    "student_name": "Test Student 1",
    "submitted_at": "2026-06-27T19:48:02.826672+00:00"
  }
]
```

### GET /api/ta/:submissionId — submission + AI feedback for review

```http
GET /api/ta/3da7b9de-fb81-46da-870f-851782c4b935
```

**Response — HTTP 200  ✅ (expected 200)**

```json
{
  "submission_id": "3da7b9de-fb81-46da-870f-851782c4b935",
  "assignment_title": "Essay 1: Argumentative Writing",
  "student_name": "Test Student 1",
  "storage_path": "b81cb29a-6f67-4aae-9950-cb5725752dd3/61e54514-bd85-4f64-94ac-a9dd2493ec55/1782589682778.pdf",
  "status": "pending_ta_review",
  "rubric": {
    "id": "1163de17-7175-4b31-bf48-555754edc48e",
    "title": "Essay Rubric",
    "locked": true,
    "criteria": [
      {
        "id": "c1",
        "name": "Thesis & Argument",
        "max_score": 25,
        "description": "Clear, defensible thesis"
      },
      {
        "id": "c2",
        "name": "Structure",
        "max_score": 25,
        "description": "Logical organization"
      },
      {
        "id": "c3",
        "name": "Evidence",
        "max_score": 25,
        "description": "Use of sources/citations"
      },
      {
        "id": "c4",
        "name": "Grammar & Style",
        "max_score": 25,
        "description": "Mechanics and clarity"
      }
    ],
    "created_at": "2026-06-27T19:48:00.577362+00:00",
    "updated_at": "2026-06-27T19:48:02.826672+00:00",
    "instructor_id": "f280d92c-a256-44a7-8a67-98a79b0d7fda"
  },
  "ai_feedback": {
    "id": "dec1e119-cb94-445c-b935-c7931ab6ea17",
    "submission_id": "3da7b9de-fb81-46da-870f-851782c4b935",
    "criteria": [
      {
        "id": "c1",
        "score": 20,
        "feedback": "[mock] Solid work on \"Thesis & Argument\". Tighten this section to score higher.",
        "version_diff": null
      },
      {
        "id": "c2",
        "score": 20,
        "feedback": "[mock] Solid work on \"Structure\". Tighten this section to score higher.",
        "version_diff": null
      },
      {
        "id": "c3",
        "score": 20,
        "feedback": "[mock] Solid work on \"Evidence\". Tighten this section to score higher.",
        "version_diff": null
      },
      {
        "id": "c4",
        "score": 20,
        "feedback": "[mock] Solid work on \"Grammar & Style\". Tighten this section to score higher.",
        "version_diff": null
      }
    ],
    "flagged_issues": [
      "[mock] Some claims could use stronger supporting evidence."
    ],
    "summary": "[mock] A strong draft overall. The main opportunity for improvement is adding more specific evidence and sharpening the thesis.",
    "status": "pending_ta_review",
    "created_at": "2026-06-27T19:48:02.874393+00:00"
  }
}
```

### POST /api/ta/:submissionId/release — edit & release (success)

```http
POST /api/ta/3da7b9de-fb81-46da-870f-851782c4b935/release
Content-Type: application/json

{
  "criteria": [
    {
      "id": "c1",
      "score": 21,
      "feedback": "Sharpen your thesis in the intro."
    },
    {
      "id": "c2",
      "score": 23,
      "feedback": "Good structure."
    },
    {
      "id": "c3",
      "score": 16,
      "feedback": "Add citations in paragraph 3."
    },
    {
      "id": "c4",
      "score": 24,
      "feedback": "Clean writing."
    }
  ]
}
```

**Response — HTTP 200  ✅ (expected 200)**

```json
{
  "ok": true,
  "status": "released",
  "total_score": 84
}
```

### POST /api/ta/:submissionId/release — empty criteria (400)

```http
POST /api/ta/3da7b9de-fb81-46da-870f-851782c4b935/release
Content-Type: application/json

{
  "criteria": []
}
```

**Response — HTTP 400  ✅ (expected 400)**

```json
{
  "message": "criteria array is required"
}
```


## FEATURE 1 — Student views released feedback

### GET /api/submissions/feedback/:id — released feedback (student)

```http
GET /api/submissions/feedback/3da7b9de-fb81-46da-870f-851782c4b935
```

**Response — HTTP 200  ✅ (expected 200)**

```json
{
  "submission_id": "3da7b9de-fb81-46da-870f-851782c4b935",
  "assignment_title": "Essay 1: Argumentative Writing",
  "version_no": 1,
  "total_score": 84,
  "max_score": 100,
  "summary": "[mock] A strong draft overall. The main opportunity for improvement is adding more specific evidence and sharpening the thesis.",
  "criteria": [
    {
      "id": "c1",
      "score": 21,
      "feedback": "Sharpen your thesis in the intro."
    },
    {
      "id": "c2",
      "score": 23,
      "feedback": "Good structure."
    },
    {
      "id": "c3",
      "score": 16,
      "feedback": "Add citations in paragraph 3."
    },
    {
      "id": "c4",
      "score": 24,
      "feedback": "Clean writing."
    }
  ],
  "flagged_issues": [
    "[mock] Some claims could use stronger supporting evidence."
  ]
}
```


---

**Automated checks: 17 passed, 0 failed.**
