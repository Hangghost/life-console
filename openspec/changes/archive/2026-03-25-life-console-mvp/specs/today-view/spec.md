## ADDED Requirements

### Requirement: Display tasks sorted by weighted score
The Today View SHALL display all task objects with status "todo" or "in_progress", sorted by a composite score: score = urgency_score + priority_score + staleness_score.

#### Scenario: Tasks sorted by score descending
- **WHEN** user navigates to Today View
- **THEN** tasks are displayed in descending order of their composite score

### Requirement: Urgency score based on due date
The system SHALL calculate urgency_score as: overdue=100, due today=80, due tomorrow=60, due within 3 days=40, due within 7 days=20, no due date=10.

#### Scenario: Overdue task scores highest urgency
- **WHEN** a task has due_date before today
- **THEN** its urgency_score is 100

#### Scenario: Task with no due date
- **WHEN** a task has no due_date
- **THEN** its urgency_score is 10

### Requirement: Priority score based on priority level
The system SHALL calculate priority_score as: urgent=40, high=30, medium=20, low=10.

#### Scenario: Urgent priority task
- **WHEN** a task has priority="urgent"
- **THEN** its priority_score is 40

### Requirement: Staleness score for old tasks
The system SHALL calculate staleness_score as: created over 7 days ago and still todo=15, created over 3 days ago and still todo=5, otherwise=0.

#### Scenario: Week-old unfinished task
- **WHEN** a task was created 8 days ago and status is still "todo"
- **THEN** its staleness_score is 15

### Requirement: Display estimated daily total time
The Today View SHALL display the sum of estimated_minutes for all visible tasks as "今日預估總耗時". Tasks without estimated_minutes are excluded from the sum.

#### Scenario: Total time calculation
- **WHEN** Today View shows 3 tasks with estimated_minutes of 30, 60, and null
- **THEN** the displayed total is 90 minutes (1.5 hours)

### Requirement: Task status actions
The Today View SHALL allow users to change a task's status (todo → in_progress → done) directly from the list.

#### Scenario: Mark task as done
- **WHEN** user marks a task as "done" in Today View
- **THEN** the task's status is updated to "done" and it disappears from the list
