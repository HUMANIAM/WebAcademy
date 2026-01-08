## Data Schema Overview

This document defines the data model behind WebAcademy.  

### 1) Identity & Access

### User
Stores the **platform user profile** and authorization status.  
This table is the source of truth for **who the user is** inside WebAcademy (independent of login method).

```json
{
  "id": "UUID (string)",
  "name": "string",
  "image_url": "string (optional)",
  "org_email": "string (unique)",
  "status": "enum('employee', 'alumni', 'disabled')",
  "has_alumni_login": "boolean", // supports offboarding visibility (“missing alumni setup”).
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Rules / Constraints**
- `org_email` must be company domain only (e.g., @company.com), enforce in app logic.
- `status` controls access:
  - disabled ⇒ cannot login / token rejected.
- `has_alumni_login` = true only when an ALUMNI login exists and `email_verified_at` is set.

### UserLogins
Stores **login methods** linked to the same platform user.
A user can have:
* one company SSO login identity
* one alumni email/password identity

```json
{
  "id": "UUID (string)",
  "user_id": "UUID (FK -> users.id)",
  "login_type": "enum('SSO', 'ALUMNI')",
  "sso_provider": "string (optional; only when login_type='SSO')",
  "sso_subject_id": "string (optional; only when login_type='SSO')",
  "sso_email": "string (optional; only when login_type='SSO')",
  "alumni_email": "string (unique, optional; only when login_type='ALUMNI')",
  "password_hash": "string (optional; only when login_type='ALUMNI')",
  "email_verified_at": "timestamp (optional)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Rules / Constraints**
- One login per type per user:
  - at most one login_type='SSO' per user_id
  - at most one login_type='ALUMNI' per user_id

- SSO identity uniqueness:
  - (`sso_provider`, `sso_subject_id`) must be unique (one IdP identity maps to one user).

- Alumni email must be unique and must be different from `users.org_email`.

- For login_type='ALUMNI':
  - `password_hash` must be set
  - `email_verified_at` must be set before allowing alumni login.

### AlumniEmailVerification
Used during alumni setup to verify the alumni email ownership via a code.

```json
{
  "id": "UUID (string)",
  "user_id": "UUID (FK -> users.id)",
  "alumni_email": "string",
  "code": "string",
  "expires_at": "timestamp",
  "consumed_at": "timestamp (optional)",
  "created_at": "timestamp"
}
```

**Rules / Constraints**
- Only one active (not consumed, not expired) verification per (`user_id`, `alumni_email`) at a time (enforced in app logic).
- Verification code must be time-limited (expires_at) and single-use (`consumed_at`).

On successful verification:
- create/update the UserLogins row (login_type='ALUMNI', set `email_verified_at`)
- set `users.has_alumni_login` = true.

### 2) Operations

### Operators
**Operators** define who is responsible for acting on workflow queues (Academy approval, Finance setup).
Each department has a Primary operator (gets email reminders) and a Delegate operator (backup).

```json
{
  "id": "UUID (string)",
  "user_id": "UUID (FK -> users.id)",
  "department": "enum('academy', 'finance')",
  "operator_level": "enum('primary', 'delegate')",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "updated_by_user_id": "UUID (FK -> users.id)"
}
```
**Rules / Constraints**
- Per `department`, there must be **at most one** operator with `operator_level = 'primary'`.
- A user can appear **at most once per department** (no duplicates).
- Swapping Primary/Delegate must be done **atomically** (update both rows together) so there is never a moment with two primaries.


### 3) Learning Content

### LearningResource
Stores **published learning resources** (courses, books, articles, videos, etc.).
Drafts and review workflow live in **ContentSubmission** (not here).

```json
{
  "id": "UUID (string)",
  "title": "string",
  "short_description": "string",
  "url": "string",
  "normalized_url": "string (optional)",
  "platform": "string", // e.g., 'Udemy', 'Coursera', 'Other'
  "resource_type": "string", // e.g., 'Course', 'Project', 'Book', 'Article', 'Video'
  "level": "string (optional)", // beginner | intermediate | advanced
  "estimated_time": "string (optional)",
  "author": "string (optional)",
  "image_url": "string",
  "default_funding_type": "string", // gift_code | reimbursement | virtual_card | org_subscription
  "is_requestable": "boolean", // true => employee can create a LearningRequest for this resource
  "created_by_user_id": "UUID (FK -> users.id)",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "provider_metadata": "json (optional)"
}
```
**Rules / Constraints**
- url should be unique in practice (recommended to enforce uniqueness on normalized_url when present).
- Only resources with is_requestable = true can be requested via the Learning Request workflow.

### LearningTrack
Stores **published learning tracks** (curated list of resources).
Drafts and review workflow live in **ContentSubmission** (not here).

```json
{
  "id": "UUID (string)",
  "title": "string",
  "short_description": "string",
  "level": "string (optional)", // beginner | intermediate | advanced
  "estimated_time": "string (optional)",
  "image_url": "string",
  "created_by_user_id": "UUID (FK -> users.id)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```
**Rules / Constraints**
- Track contents and ordering are defined via **TrackResource** (track ↔ resource relationship).

### Skill
Master list of skills used for discovery and filtering.

```json
{
  "id": "UUID (string)",
  "name": "string (unique)",
  "created_at": "timestamp"
}
```

**Rules / Constraints**
- name is unique (case-normalization recommended in application logic).

### ResourceSkill
Many-to-many relationship between published resources and skills.

```json
{
  "resource_id": "UUID (FK -> learning_resources.id)",
  "skill_id": "UUID (FK -> skills.id)"
}
```

**Rules / Constraints**
- Composite uniqueness: (resource_id, skill_id) must be unique.
- Deleting a resource or skill removes its junction rows (cascade delete).

### TrackSkill
Many-to-many relationship between published tracks and skills.

```json
{
  "track_id": "UUID (FK -> learning_tracks.id)",
  "skill_id": "UUID (FK -> skills.id)"
}
```

**Rules / Constraints**
- Composite uniqueness: (track_id, skill_id) must be unique.
- Deleting a track or skill removes its junction rows (cascade delete).

### 4) Personal Workspaces: Submissions (Publishing Workflow)

### ContentSubmission
**Submission** “header” shared by resource and track submissions.
Represents the **draft + review lifecycle** for creating or updating published content.

```json
{
  "id": "UUID (string)",

  "target_type": "enum('resource', 'track')",
  "target_id": "UUID (optional)", // null = create new, non-null = update existing published item

  "state": "enum('draft', 'under_review', 'approved', 'declined')",

  "author_user_id": "UUID (FK -> users.id)",
  "reviewer_user_id": "UUID (FK -> users.id, optional)",

  "created_at": "timestamp",
  "submitted_at": "timestamp (optional)",
  "reviewed_at": "timestamp (optional)",
  "updated_at": "timestamp"
}
```

### SubmissionMessage
Threaded messages on a submission (author <-> reviewer).

```json
{
  "id": "UUID (string)",
  "submission_id": "UUID (FK -> content_submissions.id)",
  "sender_user_id": "UUID (FK -> users.id)",
  "body": "string",
  "created_at": "timestamp"
}
```

### ResourceSubmissionDetails
Type-specific fields for resource submissions

```json
{
  "submission_id": "UUID (PK, FK -> content_submissions.id)",

  "title": "string",
  "short_description": "string",
  "url": "string",
  "platform": "string",
  "resource_type": "string",
  "level": "string (enum('beginner', 'intermediate', 'advanced'))",
  "estimated_time": "string (optional)",
  "author": "string (optional)",
  "image_url": "string (optional)",

  "default_funding_type": "string",
  "is_requestable": "boolean",

  "provider_metadata": "json (optional)"
}
```

**Rules / Constraints**
- On approval, this row is published into LearningResource.
- If ContentSubmission.target_id is set, approval updates that published resource.


### TrackSubmissionDetails
Type-specific fields for track submissions

```json
{
  "submission_id": "UUID (PK, FK -> content_submissions.id)",

  "title": "string",
  "short_description": "string",
  "level": "string (optional)",
  "estimated_time": "string (optional)",
  "image_url": "string (optional)"
}
```

**Rules / Constraints**
- On approval, this row is published into LearningTrack.
- If ContentSubmission.target_id is set, approval updates that published track.

### TrackSubmissionItem
Draft composition of a track submission (ordered items).'

```json
{
  "id": "UUID (string)",
  "track_submission_id": "UUID (FK -> content_submissions.id)",

  "position": "integer",
  "kind": "enum('published_resource', 'resource_submission')",

  "resource_id": "UUID (optional)", // when kind='published_resource'
  "resource_submission_id": "UUID (optional)" // when kind='resource_submission' (FK -> content_submissions.id where target_type='resource')
}
```

**Rules / Constraints**
- A published track may only reference published resources.
- Therefore, any resource_submission_id referenced here must be published first (or atomically) when approving the track.

### 5) Personal Workspaces: Learnings (Personal Progress)

### MyLearning
Keeps a user’s personal learning list and progress for both **resources** and **tracks**.

```json
{
  "id": "UUID (string)",
  "user_id": "UUID (FK -> users.id)",

  "target_type": "enum('resource', 'track')",
  "target_id": "UUID", // FK -> learning_resources.id OR learning_tracks.id (based on target_type)

  "status": "enum('saved', 'in_progress', 'completed', 'dropped')",

  "started_at": "timestamp (optional)",
  "completed_at": "timestamp (optional)",

  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Rules / Constraints**
- (`user_id`, `target_type`, `target_id`) should be unique (one row per user per item).
- `completed_at` is set when `status` becomes `completed`.
- started_at is set when `status` becomes `in_progress`.


### Accomplishment
Stores optional completion proof for a resource (typically courses).
Resources like books/articles can be completed without any Accomplishment record.

```json
{
  "id": "UUID (string)",
  "user_id": "UUID (FK -> users.id)",
  "resource_id": "UUID (FK -> learning_resources.id)",

  "proof_kind": "enum('certificate_file', 'certificate_link', 'other')",
  "vendor": "string (optional)",

  "file_url": "string (optional)",
  "link_url": "string (optional)",

  "created_at": "timestamp"
}
```

**Rules / Constraints**
- Create an Accomplishment only if the user has proof to attach.
- If an Accomplishment exists, it must include at least one of file_url or link_url (enforced in app logic).
- (`user_id`, `resource_id`) should be unique (one row per user per resource).
- `proof_kind` is required.


### 6) Personal Workspaces: Requests (Paid Learning Workflow)

### LearningRequest
Represents a paid resource request created by a learner and processed by Academy + Finance.

```json
{
  "id": "UUID (string)",
  "learner_user_id": "UUID (FK -> users.id)",
  "resource_id": "UUID (FK -> learning_resources.id)",

  "message": "string (optional)",

  "approval_state": "enum('waiting', 'approved', 'rejected')",
  "rejection_reason": "string (optional)",

  "approved_by_user_id": "UUID (FK -> users.id, optional)", // academy operator
  "approved_at": "timestamp (optional)",

  "finance_setup_done_at": "timestamp (optional)",
  "learner_proof_submitted_at": "timestamp (optional)",
  "finance_verified_at": "timestamp (optional)",

  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Rules / Constraints**
- Only requestable resources can be requested (learning_resources.is_requestable = true).
- (`learner_user_id`, `resource_id`) should be unique (one row per learner per resource).
- approval_state is the stable decision state (waiting/approved/rejected).
- UI lane/status is derived (not stored): WAITING_APPROVAL / WAITING_FINANCE_ACTION / WAITING_LEARNER_ACTION / VERIFIED.

### LearningRequestPaymentSetup
Stores the payment setup/instructions provided by Finance for a learning request.

```json
{
  "id": "UUID (string)",
  "learning_request_id": "UUID (FK -> learning_requests.id)",

  "method": "enum('GIFT_CODE', 'VIRTUAL_CARD')", // later: REIMBURSEMENT
  "status": "enum('ACTIVE', 'REVOKED', 'REPLACED')",

  "provided_by_user_id": "UUID (FK -> users.id)",
  "provided_at": "timestamp",

  "instructions_text": "string",

  "gift_code": "string (optional)", // store securely (encrypted)
  "vc_provider": "string (optional)",
  "vc_link": "string (optional)",

  "currency": "string (optional)",
  "amount_limit": "number (optional)",

  "created_at": "timestamp"
}
```
** Rules / Constraints**
- A request should have at most one ACTIVE setup at a time (enforced in app logic).
- When a new setup is issued, the previous one becomes REPLACED.
- When a setup is REVOKED, the request returns to WAITING_FINANCE_ACTION.

### LearningRequestProof
Stores learner-submitted proofs linked to a learning request (enrollment/payment proof).

```json
{
  "id": "UUID (string)",
  "learning_request_id": "UUID (FK -> learning_requests.id)",

  "submitted_by_user_id": "UUID (FK -> users.id)",
  "submitted_at": "timestamp",

  "amount": "number (optional)",
  "currency": "string (optional)",

  "file_url": "string" // required (stored file location / storage key)
}
```

**Rules / Constraints**
- A request can have multiple proofs over time (e.g., finance asks for clarification).
- (`learning_request_id`, `submitted_by_user_id`) should be unique (one row per learner per request).

### LearningRequestMessage
Threaded messages for clarification between learner, Academy, and Finance on a request.

```json
{
  "id": "UUID (string)",
  "learning_request_id": "UUID (FK -> learning_requests.id)",

  "sender_user_id": "UUID (FK -> users.id)",
  "body": "string",

  "created_at": "timestamp"
}
```

**Rules / Constraints**
- Used when Academy rejects with reason, Finance asks for clarification, learner responds, etc.

**Derived UI Lane (Not Stored)**

UI lane/status is computed from LearningRequest fields:
- `WAITING_APPROVAL` → approval_state='waiting'
- `VERIFIED` → finance_verified_at != null
- `WAITING_FINANCE_ACTION` (Need setup) → approved AND finance_setup_done_at == null
- `WAITING_LEARNER_ACTION` → setup done AND learner_proof_submitted_at == null
- `WAITING_FINANCE_ACTION` (Need verification) → proof submitted AND finance_verified_at == null


### 7) Community Feedback (Reviews & Comments)

### Review
Stores a user’s rating and optional review text on a resource or a track.

```json
{
  "id": "UUID (string)",
  "user_id": "UUID (FK -> users.id)",

  "target_type": "enum('resource', 'track')",
  "target_id": "UUID", // FK -> learning_resources.id OR learning_tracks.id (based on target_type)

  "rating": "integer (1..5)",
  "comment": "string (optional)",

  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Rules / Constraints**
- (`user_id`, `target_type`, `target_id`) should be unique (one row per user per item).

### Comment
Threaded discussion on a resource or a track (independent from reviews).

```json
{
  "id": "UUID (string)",

  "target_type": "enum('resource', 'track')",
  "target_id": "UUID", // FK -> learning_resources.id OR learning_tracks.id (based on target_type)
  "user_id": "UUID (FK -> users.id)",

  "parent_comment_id": "UUID (FK -> comments.id, optional)", // null = top-level comment
  "body": "string",

  "created_at": "timestamp",
  "updated_at": "timestamp",

  "deleted_by_user_id": "UUID (FK -> users.id, optional)",
  "deleted_at": "timestamp (optional)"
}
```

**Rules / Constraints**
- Threading is represented by parent_comment_id.
- Use soft-delete (deleted_at) to preserve thread structure and moderation history.

### 8) Communication (Notifications & Reminders)

### Notification
In-app notification record sent to a user when something requires attention or when an important event happens.

Notifications can be used for both in-app display and as a source to generate email reminders.

```json
{
  "id": "UUID (string)",
  "user_id": "UUID (FK -> users.id)",

  "type": "string", // e.g., 'request_submitted', 'request_approved', 'finance_setup_needed', 'proof_submitted', 'verification_needed', 'submission_reviewed'
  "payload": "json (optional)",

  "is_read": "boolean",

  "created_at": "timestamp",
  "read_at": "timestamp (optional)"
}
```

### EmailReminderLog
Audit log for emails sent by the system (to avoid duplicates and help debugging).

Prevents “email spam loops” by allowing “have we already sent this reminder for this request state?”

```json
{
  "id": "UUID (string)",
  "to_user_id": "UUID (FK -> users.id, optional)",
  "to_email": "string",

  "purpose": "string", // e.g., 'finance_setup_needed', 'verification_needed', 'academy_approval_needed'
  "reference_type": "string (optional)", // e.g., 'learning_request', 'content_submission'
  "reference_id": "UUID (optional)",     // e.g., learning_request_id

  "sent_at": "timestamp"
}
```
