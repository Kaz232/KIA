# GAG Core Security Specification & ABAC Test Suite

## 1. Data Invariants
1. **User Identity Invariant**: A user document at `/users/{userId}` can only be created or modified by the authenticated user whose `request.auth.uid == userId`. Standard users cannot escalate their own `role` to `SUPER_ADMIN` or `ADMIN`.
2. **Task Ownership & RBAC Invariant**: A task can only be created if `request.auth.uid != null` and `incoming().createdBy == request.auth.uid`. Editors and assignees can update task workflow status, but cannot mutate immutable fields like `id`, `createdBy`, and `createdAt`.
3. **Audit Log Immutability Invariant**: Audit log documents at `/audit_logs/{logId}` can only be appended (created). No update or delete operations are ever allowed.
4. **Document & Knowledge Base Invariant**: Scanned documents and Knowledge items enforce verified author matching on creation (`uploadedBy`/`authorId == request.auth.uid`) and string boundary enforcement on all text payloads.

## 2. The "Dirty Dozen" Threat Payloads (Must Return PERMISSION_DENIED)
1. **Ghost Field Shadow Injection**: Attempting to inject `isSuperUser: true` on user document update.
2. **Identity Spoofing in Tasks**: User A attempting to create a task setting `createdBy: "user-victim-B"`.
3. **Role Escalation**: Regular user attempting to update their own `role` from `VIEWER` to `SUPER_ADMIN`.
4. **Audit Trail Tampering (Update)**: Attempting to `UPDATE` an existing audit log entry to erase trace.
5. **Audit Trail Erasure (Delete)**: Attempting to `DELETE` an audit log record.
6. **Task ID Poisoning**: Attempting to create a task with an ID exceeding 128 chars with injection characters.
7. **Jumbo Payload Denial-of-Wallet**: Attempting to send a 2MB string in task `title` (violating `maxLength: 300`).
8. **Unauthenticated Read on Private Data**: Anonymous/unauthenticated client attempting to list `/users`.
9. **Knowledge Base Author Spoofing**: User A attempting to write a Knowledge document setting `authorId: "user-B"`.
10. **Terminal State Break**: Attempting to alter a `CANCELLED` or `DONE` task into unapproved arbitrary states without authority.
11. **Immutable Field Mutate (createdAt)**: Altering the initial `createdAt` timestamp of a task on update.
12. **Blanket Query Scraping**: Attempting to run a collection-wide query across user private records without owning the resources.
