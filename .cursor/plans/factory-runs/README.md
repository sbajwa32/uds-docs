# Factory runs — Phase A model archive

This directory holds **committed copies** of `generate-uds-figma-component`
Phase A model proposals so they survive past the cloud-agent VM that
generated them.

The skill's canonical home for these files is `.cursor/state/component-factory/<id>.md`,
which is gitignored per the skill description ("proposals are runtime state,
not committed history"). That assumption holds for designer-initiated
local sessions. It does NOT hold for cloud-agent sessions, where the VM
hosting the runtime state is ephemeral and the user can only review the
proposals once the work is pushed.

The fix for cloud-agent runs is to mirror the model into this
non-gitignored directory at the same time as writing to `.cursor/state/`.
Both files have identical contents; the gitignored one remains the
resume-state file the skill expects.

## Status of each model

| File | Status | Notes |
|---|---|---|
| `calendar.md` | Awaiting approval | Foundational primitive — depends on no other new components |
| `date-picker.md` | Awaiting approval | Collision with existing `date-picker` placeholder; reuses `udc-calendar` |
| `time-picker.md` | Awaiting approval | Introduces `_udc-time-picker-segment` subcomponent |
| `date-time-picker.md` | Awaiting approval | Composes `udc-calendar` + `_udc-time-picker-segment` |

Approval format per the skill:
- Literal `approved` (case-insensitive) — proceed to Phase B as-is
- `approved with: <change list>` — apply changes, then proceed to Phase B
- `not yet` / `rework this` — return to Phase A research

Phase B Figma writes target the `UDS Components` file (`1XJoUJgtNpw4R0IIT3VjoK`),
on brand-new `🟠 <Title> {Cursor}{Ignore}` pages — write-safety scope #4.
