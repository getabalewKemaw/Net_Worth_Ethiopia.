# AGENTS.md — AI Engineering Rules

## 1. Purpose

This file defines the rules and working behavior for AI coding agents working in this repository.

The goal is to produce code that is:

* Correct
* Maintainable
* Secure
* Simple
* Consistent with the existing architecture
* Cost-efficient
* Testable
* Production-ready

The agent should work autonomously whenever the requirements are clear and should avoid unnecessary questions, code, files, dependencies, refactors, and API calls.

---

# 2. Core Principles

Follow these principles in order:

1. Understand before modifying.
2. Reuse before creating.
3. Prefer simplicity over complexity.
4. Make the smallest change that correctly solves the problem.
5. Preserve working code.
6. Follow existing project conventions.
7. Validate changes before declaring them complete.
8. Never trade security for convenience.
9. Avoid unnecessary dependencies and external services.
10. Do not over-engineer.

When a requirement can be solved in multiple ways, prefer the solution that introduces the least unnecessary complexity.

---

# 3. Repository Inspection

Before modifying code:

1. Inspect the relevant directory structure.
2. Read the files directly related to the task.
3. Search for existing implementations that solve similar problems.
4. Identify existing types, utilities, services, hooks, components, validation schemas, and helpers that can be reused.
5. Understand how the affected code is connected to the rest of the system.
6. Check existing tests when they are relevant.
7. Check existing project configuration before changing configuration.

Do not immediately create new files or rewrite existing code.

---

# 4. Reuse Existing Code

Always search for reusable code before creating something new.

Before creating a:

* Component
* Hook
* Service
* Utility
* Helper
* Type
* Interface
* Validation schema
* API client
* Database helper
* State-management store
* Middleware
* Configuration
* Test utility

check whether an existing implementation can be reused or extended.

Prefer:

```text
reuse existing → extend existing → refactor existing → create new
```

Do not duplicate functionality that already exists.

If two implementations perform essentially the same job, prefer consolidating them when doing so is safe and relevant to the task.

---

# 5. Minimal Changes

Make the smallest safe change necessary to satisfy the requirement.

Do not:

* Rewrite unrelated files.
* Reformat unrelated code.
* Rename unrelated variables.
* Change unrelated architecture.
* Upgrade dependencies without a reason.
* Refactor working code without justification.
* Introduce new abstractions unnecessarily.
* Modify unrelated configuration.
* Change behavior that was not part of the task.

A task that requires 5 lines of code should not become a 500-line refactor.

---

# 6. Preserve Working Code

Do not rewrite working code merely because you prefer another coding style.

Refactor existing code only when:

* The current implementation causes a real problem.
* The requested feature requires the refactor.
* There is a meaningful security, correctness, performance, or maintainability benefit.
* The user explicitly requests the refactor.

If existing code works and is consistent with the project architecture, preserve it.

---

# 7. Architecture

Follow the existing project architecture.

Do not introduce a new architectural pattern unless:

1. The current architecture cannot reasonably support the requirement, or
2. The new pattern provides a clear and measurable benefit.

Before introducing a new layer, ask:

> Does this project actually need another abstraction?

Avoid unnecessary:

* Wrappers
* Managers
* Factories
* Providers
* Repositories
* Adapters
* Base classes
* Generic abstractions
* Utility layers

Prefer straightforward code when it is sufficient.

---

# 8. TypeScript Rules

When TypeScript is used:

* Prefer strong typing.
* Avoid `any`.
* Do not use `any` simply to silence TypeScript errors.
* Use `unknown` when the type is genuinely unknown.
* Narrow types safely.
* Reuse existing types where possible.
* Avoid duplicate type definitions.
* Keep types close to the domain they represent unless the project already follows another convention.
* Do not unnecessarily make everything optional.
* Do not unnecessarily make everything required.

Use TypeScript's type system to prevent invalid states where practical.

Do not use type assertions to bypass a problem without understanding the underlying issue.

Avoid:

```ts
const value = something as any;
```

unless there is a documented and justified reason.

---

# 9. API Design

When working with APIs:

* Follow existing endpoint conventions.
* Reuse existing API clients and services.
* Validate input at the API boundary.
* Return consistent response structures.
* Handle expected errors explicitly.
* Do not expose internal implementation details.
* Do not expose secrets or sensitive information.
* Do not create duplicate endpoints when an existing endpoint can reasonably support the requirement.

API changes should consider:

* Authentication
* Authorization
* Validation
* Error handling
* Pagination where appropriate
* Filtering where appropriate
* Performance
* Backward compatibility

Do not introduce breaking API changes without explicit justification.

---

# 10. Database Rules

Treat the database as a critical system.

Before changing the database:

1. Inspect the existing schema.
2. Understand relationships.
3. Search for existing queries and usages.
4. Consider existing data.
5. Consider migration requirements.
6. Consider indexes and performance where relevant.

Never casually destroy or modify existing data.

Do not make a field required simply because it is convenient for implementation.

A field should be required only when the business/domain rules genuinely require it.

Prefer nullable or optional data when missing information is a valid real-world state.

Do not duplicate data when it can safely and reliably be derived from existing data.

Avoid unnecessary database queries.

Prefer efficient queries over fetching large amounts of data and filtering it unnecessarily in application code.

---

# 11. Validation

Validate untrusted input at system boundaries.

Validation should be appropriate to the domain.

Do not:

* Trust client-side validation alone.
* Assume request data is valid.
* Duplicate validation unnecessarily across unrelated layers.
* Make fields required when the business logic does not require them.

Where a validation library already exists in the project, reuse it.

---

# 12. Authentication and Authorization

Security-sensitive operations must verify authorization on the server.

Never rely solely on:

* Hidden UI elements
* Client-side checks
* Client-provided roles
* Client-provided permissions
* Request parameters claiming ownership

Users must not be able to access resources simply by changing IDs or request values.

Follow least-privilege principles.

---

# 13. Security

Never hardcode:

* Passwords
* API keys
* Authentication tokens
* Private keys
* Database credentials
* Encryption secrets
* Other sensitive credentials

Use environment variables or the project's existing secret-management mechanism.

Never commit secrets to Git.

Do not expose sensitive information in:

* Logs
* API responses
* Error messages
* Client-side bundles
* URLs
* Public configuration

Do not weaken authentication, authorization, CSP, validation, rate limiting, or other security controls merely to make development easier.

---

# 14. Error Handling

Handle errors intentionally.

Do not silently swallow errors.

Avoid:

```ts
try {
  ...
} catch {
}
```

unless there is a clear reason.

Use the project's existing error-handling conventions.

User-facing errors should be understandable without exposing:

* Stack traces
* Database details
* Internal paths
* Secrets
* Infrastructure information
* Sensitive implementation details

Preserve useful technical information in appropriate server-side logs when the project's logging system supports it.

---

# 15. Performance

Do not optimize prematurely.

First ensure correctness.

When performance is relevant:

* Avoid unnecessary API requests.
* Avoid duplicate database queries.
* Avoid unnecessary renders.
* Avoid loading large resources unnecessarily.
* Use pagination for potentially large datasets.
* Avoid unnecessary client-side JavaScript.
* Optimize images and assets appropriately.
* Reuse cached data where appropriate.
* Prefer server-side operations when appropriate to the architecture.

Do not introduce complicated caching unless there is a clear reason.

Measure or inspect performance before making major performance claims.

---

# 16. AI / External API Cost Control

Minimize unnecessary AI and external API usage.

Before introducing an AI/API call, determine whether normal deterministic application logic can solve the problem.

Prefer:

```text
local deterministic logic
        ↓
existing cached result
        ↓
existing internal API
        ↓
external API
        ↓
AI API
```

Only use an AI or external API when it provides meaningful value.

Avoid:

* Duplicate API requests.
* Repeated identical AI requests.
* Sending unnecessary context.
* Sending unnecessary fields.
* Calling AI for simple transformations.
* Calling an external API when existing local data is sufficient.
* Introducing paid services without justification.

When AI calls are necessary:

* Minimize the input payload.
* Request only the required output.
* Avoid repeated context that can be stored or referenced elsewhere.
* Cache results where appropriate.
* Handle rate limits and failures.
* Do not expose API keys to clients.

---

# 17. Dependencies

Do not install a new package automatically.

Before adding a dependency:

1. Check whether the project already has a dependency that solves the problem.
2. Check whether the functionality is simple enough to implement without a dependency.
3. Consider bundle size.
4. Consider maintenance.
5. Consider security.
6. Consider licensing.
7. Consider whether the dependency is actually necessary.

Do not upgrade unrelated dependencies while implementing a feature.

Do not replace an existing library merely because another library is more popular.

---

# 18. Frontend/mobile Rules

When working on frontend code:

* Reuse existing components.
* Reuse existing design-system primitives.
* Follow existing spacing, typography, colors, and responsive behavior.
* Follow existing accessibility conventions.
* Avoid duplicated UI logic.
* Keep components focused.
* Avoid unnecessarily large components.
* Do not introduce a new UI library without justification.

Do not create a new component for a tiny piece of markup unless reuse or maintainability justifies it.

Interactive elements must remain accessible.

Forms should provide appropriate validation and error states.

---

# 19. State Management

When state management is already established:

* Follow the existing state-management pattern.
* Reuse existing stores/hooks.
* Keep server state separate from local UI state when appropriate.
* Avoid putting every piece of state into global state.
* Do not create a store for state that belongs locally to a component.
* Avoid duplicate sources of truth.

Do not introduce another state-management library without a strong reason.

---

# 20. Testing

When making a change, determine what level of testing is appropriate.

Prefer:

```text
focused test
→ relevant test suite
→ typecheck
→ lint
→ build
```

Do not add tests that merely duplicate implementation details.

Tests should verify behavior and important edge cases.

When fixing a bug, add or update a regression test when practical.

Do not modify tests simply to make failing tests pass unless the expected behavior has genuinely changed.

Never remove a failing test just because it is inconvenient.

---

# 21. Git Rules

Keep changes focused.

Do not:

* Commit generated files unnecessarily.
* Commit secrets.
* Modify unrelated files.
* Rewrite Git history unless explicitly requested.
* Force-push unless explicitly requested.
* Delete branches or tags without confirmation.
* Mix unrelated features into one change.

Before committing, inspect the changed files.

A clean diff is preferred over a large noisy diff.

Commit messages should describe the actual change clearly.

---

# 22. Generated Files

Do not manually edit generated files unless the task specifically requires it.

Prefer modifying the source/configuration that generates them and then regenerating the output.

Examples may include:

* Build artifacts
* Generated clients
* Generated types
* ORM-generated files
* Lockfiles when not intentionally changed

Do not commit build output unless the repository explicitly requires it.

---

# 23. Configuration

Before changing configuration:

1. Inspect the existing configuration.
2. Understand why it exists.
3. Determine whether the change is actually required.
4. Preserve existing behavior unless the task requires changing it.

Do not modify unrelated configuration.

Do not remove configuration simply because it appears unused without verifying its purpose.

---

# 24. Documentation

Update documentation when a change affects:

* Public APIs
* Setup instructions
* Environment variables
* Architecture
* Important workflows
* Developer commands
* User-facing behavior

Do not create documentation for trivial internal implementation details unless requested.

Keep documentation accurate and concise.

Never document behavior that has not been verified.

---

# 25. When Requirements Are Ambiguous

Do not ask unnecessary questions.

If the intended behavior can be reasonably inferred from:

* Existing code
* Existing architecture
* Existing naming
* Existing documentation
* Existing patterns

use that information and proceed.

Ask the user only when ambiguity could materially change:

* Business behavior
* Data integrity
* Security
* Architecture
* API contracts
* User experience
* Cost
* Destructive operations

When asking a question, explain the decision that depends on the answer.

---

# 26. Autonomous Work

The agent is encouraged to act autonomously for normal development tasks.

The agent may independently:

* Inspect files.
* Search the repository.
* Reuse existing code.
* Implement straightforward changes.
* Fix obvious bugs.
* Add appropriate tests.
* Run validation commands.
* Improve small local issues discovered while implementing the requested task.

The agent should NOT independently perform high-risk actions such as:

* Destructive database operations.
* Deleting important project data.
* Exposing secrets.
* Making major breaking API changes.
* Changing authentication/security architecture.
* Force-pushing Git history.
* Removing major project infrastructure.

Ask for confirmation before such actions.

---

# 27. Change Scope

Stay within the scope of the requested task.

If you discover an unrelated issue:

1. Do not silently perform a large refactor.
2. Mention the issue.
3. Fix it only if it is small, directly related, and safe.
4. Otherwise leave it unchanged.

Do not turn a feature request into an unrelated cleanup project.

---

# 28. Definition of Done

A task is considered complete only when:

* The requested behavior is implemented.
* Existing functionality has not been unnecessarily broken.
* The implementation follows the project's architecture.
* Types are correct.
* Validation is appropriate.
* Relevant tests pass or appropriate tests have been added.
* Relevant lint/typecheck/build validation has been performed when applicable.
* No unnecessary dependencies were introduced.
* No secrets were exposed.
* No unrelated files were unnecessarily modified.
* The final diff is focused and understandable.

---

# 29. Final Response Format

After completing a task, provide a concise summary containing:

### Changes

What was changed.

### Files

Important files created or modified.

### Validation

Commands/tests that were run and their results.

### Notes

Important limitations, assumptions, or remaining issues.

Do not claim tests, builds, or commands passed unless they were actually run.

---

# 30. Final Rule

Think like a senior engineer working inside an existing production codebase.

Before writing code, understand the system.

Before creating something, search for something reusable.

Before adding complexity, prove that it is necessary.

Before changing behavior, understand the existing behavior.

Before declaring success, verify the result.

**Build only what is necessary, reuse what already exists, protect existing functionality, and keep the codebase simple.**
