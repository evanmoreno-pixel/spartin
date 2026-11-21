|     |                     |                         |
|-----|---------------------|-------------------------|
|     | **Document Number** | **SAD-CMPE-131 Sec 05** |
|     | **Version**         | **2.0**                 |
|     | **Status**          | **Final Draft**         |
|     | **Created By**      | **Evan Moreno**         |

**\[SpartIn\]**

**System Architecture Document**

**Reviewers**

|                                  |                    |
|----------------------------------|--------------------|
| **Department**                   | **Name/Title**     |
| Project Manager (PM)             | Kabir Khan         |
| Product Marketing Manager (PMM)  | Brandon Tu         |
| System Architect (SA)            | Evan Moreno        |
| Developers (DEV)                 | Asfi Khan          |
| Developers (DEV)                 | Alex Sanchez       |
| Quality Assurance Engineers (QA) | Cristhian Galo     |
| Quality Assurance Engineers (QA) | Sean Luke Holscher |

**Team Member Contribution Record**

**Project Team:** LOBOS  
**Deliverable:** System Archeticture Document

Each team member must participate in the development of this deliverable. As a team, review and agree on each member's contribution level and complete the table below before submission.

| **Team Member**    | **Contribution Level**                                              | **Brief Description of Contribution**                                                                                                          |
|--------------------|---------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| Kabir Khan         | <span class="mark">☐</span> Full (100%) ☐ Partial (50%) ☐ None (0%) | Revisions for V 2.0 final by adding priority level for project scope and use case diagrams for waitlist functionality, small grammatical fixes |
| Brandon Tu         | ☐ Full (100%) <span class="mark">☐</span> Partial (50%) ☐ None (0%) | List of Tables, small appendices fix, small format fix                                                                                         |
| Evan Moreno        | <span class="mark">☐</span> Full (100%) ☐ Partial (50%) ☐ None (0%) | V 1.0 initial draft                                                                                                                            |
| Asfi Khan          | ☐ Full (100%) <span class="mark">☐</span> Partial (50%) ☐ None (0%) | Minor additions and changes                                                                                                                    |
| Cristhian Galo     | <span class="mark">☐</span> Full (100%) ☐ Partial (50%) ☐ None (0%) | Minor changes and revisions regarding section 5                                                                                                |
| Alex Sanchez       | ☐ Full (100%) <span class="mark">☐</span> Partial (50%) ☐ None (0%) | Formatting adjustments and proof reading                                                                                                       |
| Sean Luke Holscher | ☐ Full (100%) <span class="mark">☐</span> Partial (50%) ☐ None (0%) | GitHub brainstorming and minor revisions                                                                                                       |

**Contribution Levels**

**Full Contribution (100%)** – Fully participated and contributed to the deliverable; receives 100% of the team score.  
**Partial Contribution (50%)** – Partially participated or contributed to the deliverable; receives 50% of the team score.  
**No Contribution (0%)** – Did not participate or contribute to the deliverable; receives 0% of the team score.

**Team Confirmation:**  
By submitting this document, the team confirms that the contribution levels reported above have been reviewed and agreed upon by the team members.

# **Table of Contents**

[1 Introduction [4](#introduction)](#introduction)

[1.1 Purpose of the Document [4](#purpose-of-the-document)](#purpose-of-the-document)

[1.2 Scope [4](#scope)](#scope)

[1.3 Assumptions and Dependencies [4](#assumptions-and-dependencies)](#assumptions-and-dependencies)

[2 Functional Overview [4](#functional-overview)](#functional-overview)

[2.1 System Context [4](#system-context)](#system-context)

[2.2 Functional Modules [5](#functional-modules)](#functional-modules)

[3 System Models [5](#system-models)](#system-models)

[3.1 Use Case Models [5](#use-case-models)](#use-case-models)

[3.2 Sequence Diagrams [5](#sequence-diagrams)](#sequence-diagrams)

[3.3 State Diagrams [5](#state-diagrams)](#state-diagrams)

[3.4 Data Flow Diagrams [5](#data-flow-diagrams)](#data-flow-diagrams)

[4 Architectural Design [6](#architectural-design)](#architectural-design)

[4.1 System Architecture [6](#system-architecture)](#system-architecture)

[4.2 Component Descriptions [6](#component-descriptions)](#component-descriptions)

[5 Functional Specifications [6](#functional-specifications)](#functional-specifications)

[5.1 Detailed Functional Requirements [6](#detailed-functional-requirements)](#detailed-functional-requirements)

[5.2 Interface Specifications [6](#interface-specifications)](#interface-specifications)

[6 System Behavior [6](#system-behavior)](#system-behavior)

[6.1 Event Handling [6](#event-handling)](#event-handling)

[6.2 Performance Constraints [7](#performance-constraints)](#performance-constraints)

[7 Non-Functional Specifications [7](#non-functional-specifications)](#non-functional-specifications)

[7.1 Performance Requirements [7](#performance-requirements)](#performance-requirements)

[7.2 Security Requirements [7](#security-requirements)](#security-requirements)

[7.3 Reliability Requirements [7](#reliability-requirements)](#reliability-requirements)

[8 System Models for Validation [7](#system-models-for-validation)](#system-models-for-validation)

[9 Appendices [7](#appendices)](#appendices)

**List of Tables**

[Table 2.2 Functional Models Table](#functional-modules)

[Table 3.1 Use Case Table](#Bookmark2)

[Table 4.2 Component Descriptions Table](#Bookmark3)

[Table 5.1 Detailed Functional Requirements Table](#Bookmark4)

[Table 5.2 Interface Specifications Table](#Bookmark5)

[Table 6.1 Event Handling Table](#Bookmark6)

[Table 8.1 Systems Models for Validation Table](#Bookmark7)

# Introduction

## Purpose of the Document

This document is intended for stakeholders, developers for reference about system design, QA engineers, and System Architect.This System Architecture Document (SAD) defines the proposed functional structure, system models, major architectural components, interfaces, and behavioral expectations for SpartIN. It translates the requirements identified in the Product Requirements Document (PRD) into a design that developers, testers, and architects can use during implementation and validation.

## Scope

SpartIN is intended to help San Jose State University transfer students discover and participate in organized events. The system supports two primary roles: participants who discover and join events, and organizers who create and manage events.

The SAD covers the architecture and design for the following capabilities along with the priority level:

MVP = Crucial to implement to match project requirement

Optional (Op) = Good to implement but isn’t the main priority

Future Enhancements (FE) = Scalable features to be implemented in the future updates

- Browser events using a swipe-oriented interface and view event details. (MVP feature)

- Join or pass on events and maintain participation status. (MVP)

- Create, edit, reschedule/postpone, and delete events for authorized organizers. (MVP)

- Display event location on an in-app campus map and optionally open an external navigation service. (MVP/Op)

- Share event links and add events to a device calendar. (Op)

- Support waitlist behavior when an event reaches capacity. (MVP)

- Support event recommendations using user profile attributes such as interests, skills, and major. (FE)

##  Assumptions and Dependencies

- Users have a modern smartphone or tablet with internet access.

- Users can access SpartIN through a web-based interface.

- University email access is available for account verification and authentication-related notifications.

- Location-based features require user permission. The rest of the application remains usable if location permission is denied.

- Calendar and social/message sharing features depend on the device's capabilities.

- Mapping/navigation behavior depends on a campus map source and may optionally integrate with services such as Google Maps or Apple Maps.

- External services may be temporary unavailable; SpartIN should fail normally and keep core event browsing and participation usable when possible.

# Functional Overview

## System Context

SpartIN sits between users and several supporting external services. Participants use the system to discover, inspect, join, pass, navigate to, and share events. Organizers use the same system to create and manage events. External services provide email verification, map/navigation functions, and calendar or sharing integration.

<img src="./media/image1.png" style="width:6.5in;height:2.79167in" />Figure 2.1: SpartIN System Context Diagram

The internal database is not shown as an external entity in Figure 2.1 because it is part of the SpartIN system boundary. The external services are dependencies and are accessed through clearly separated integration interfaces.

## Functional Modules

| **Module**                      | **Purpose**                                                                                                                                                                            |
|---------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Authentication and User Profile | Verifies user identity, maintains user role/profile information, and provides authorization context to protected features.                                                             |
| Event Discovery and Swipe       | Retrieves available events created by organizers, presents event cards/details, and processes pass/join actions from the participant interface.                                        |
| Event Management                | Allows authorized organizers to create, edit, reschedule/postpone, and delete events, with full control over attributes such as title, description, date/time, location, and capacity. |
| Participation and Waitlist      | Stores participation state, prevents duplicate joins, checks capacity, and manages waitlist placement when the waitlist feature is enabled.                                            |
| Location and Navigation         | Displays the event location on a campus map and provides a handoff to an external navigation service when requested.                                                                   |
| Sharing and Calendar            | Creates shareable event links and passes event details to supported calendar/share functions.                                                                                          |
| Event Matching                  | Uses selected user attributes such as interests, skills, or major to prioritize or recommend relevant events. This is a low-priority module.                                           |

#  3 System Models 

## 3.1 Use Case Models

Figure 3.1 summarizes the main user interactions defined by the PRD. Participant-oriented use cases focus on event discovery and participation, while organizer-oriented use cases focus on event administration.

<img src="./media/image2.png" style="width:5.00026in;height:4.26411in" />

Figure 3.1: SpartIN Use Case Diagram

<table>
<colgroup>
<col style="width: 15%" />
<col style="width: 12%" />
<col style="width: 21%" />
<col style="width: 23%" />
<col style="width: 27%" />
</colgroup>
<thead>
<tr class="header">
<th><span id="Bookmark2" class="anchor"></span><strong>Use Case</strong></th>
<th><strong>Actor</strong></th>
<th><strong>Preconditions</strong></th>
<th><strong>Postconditions</strong></th>
<th><strong>Primary Flow</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>UC-01 Browse/Swipe Events</td>
<td>Participant</td>
<td>User is authenticated; event catalog is available.</td>
<td>A next event is displayed, or the current event is marked passed/joined.</td>
<td>System retrieves eligible events; participant views an event card; participant swipes/passes/joins or opens details; system records the resulting action when required.</td>
</tr>
<tr class="even">
<td>UC-02 Join Event</td>
<td>Participant</td>
<td>User is authenticated; event exists and is open.</td>
<td>Participation is recorded as Joined, or the user is offered/placed on a waitlist when the event is full.</td>
<td>Participant selects Join; system validates user and event; system checks existing participation and capacity; system creates/updates participation; UI confirms status.</td>
</tr>
<tr class="odd">
<td>UC-03 Create Event</td>
<td>Organizer</td>
<td>User is authenticated and authorized as an organizer.</td>
<td>A new event record is stored and becomes available according to its publication status.</td>
<td>Organizer opens event form; enters required event data; system validates fields; organizer submits; API stores event and returns confirmation.</td>
</tr>
<tr class="even">
<td>UC-04 Manage Event</td>
<td>Organizer</td>
<td>Organizer owns or is authorized to manage the event.</td>
<td>Event is updated, rescheduled/postponed, or deleted.</td>
<td>Organizer opens event management; selects an action; system validates authorization and inputs; system updates event data; participants receive updated data on refresh.</td>
</tr>
<tr class="odd">
<td>UC-05 Navigate to Event</td>
<td>Participant</td>
<td>Event has a valid location.</td>
<td>User sees the event location and may open external turn-by-turn navigation.</td>
<td>Participant opens event details; system loads mapped location; participant selects Navigate; system passes the destination to a supported navigation service.</td>
</tr>
<tr class="even">
<td>UC-06 Share/Add to Calendar</td>
<td>Participant</td>
<td>Event exists and contains date/time information.</td>
<td>A share intent or calendar entry is prepared.</td>
<td>Participant selects Share or Add to Calendar; system formats event data; supported platform interface is opened; user confirms the external action.</td>
</tr>
<tr class="odd">
<td><p>UC-07</p>
<p>Waitlist Management</p></td>
<td>Participant</td>
<td>Participant is authenticated and the event allow set number of waitlist when the event is full based on waitlist capacity</td>
<td>Particiapant is assigned a position based on priority in first come first serve basis and waitlist status is displayed</td>
<td>Participant selects Join for a full event, system verifies the participant’s authentication and eligibility; system checks that the event is full and waitlisting is enabled; system displays a confirmation message and the participant’s waitlist position.</td>
</tr>
</tbody>
</table>

## 

## 3.2 Sequence Diagrams

Figure 3.2 models the primary Join Event interaction. It shows the logical order of operations rather than a framework-specific implementation. Capacity checking and duplicate-participation checks occur before a new participation record is committed.

<img src="./media/image3.png" style="width:6.00031in;height:3.83353in" />

Figure 3.2: Join Event Sequence Diagram

If capacity is available, the API records the user as joined. If the event is full and waitlisting is enabled, the API returns a waitlist status or option instead. Error responses are returned if authentication, authorization, event availability, or validation checks fail.

## 3.3 State Diagrams 

Figure 3.3 represents the participant's state relative to an event. The model separates a user who has not interacted with the event from a user who passed, joined, or entered a waitlist.

<img src="./media/image4.png" style="width:6.15309in;height:1.88899in" />

Figure 3.3: Event Participation State Diagram

The exact waitlist transition logic is low priority and may be simplified in the initial implementation. The state model is retained so the data design can support the feature without changing the core participation concept.

## 3.4 Data Flow Diagrams

Figure 3.4 shows a Level-1 data flow view. User requests are processed by account/authentication, discovery/participation, event management, and integration processes. Persistent data is separated into user, event, and participation stores at the logical level.

<img src="./media/image5.png" style="width:6.34755in;height:1.76398in" />

Figure 3.4: SpartIN Level-1 Data Flow Diagram

# 4 Architectural Design

## 4.1 System Architecture

SpartIN uses a layered client-server architecture. The presentation layer handles user interaction, the application/API layer contains business rules, the data access layer isolates database operations, and external-service adapters isolate third-party dependencies. This architecture was selected to separate concerns, support independent testing, and reduce the impact of future changes to the client's UI or external services.

<img src="./media/image6.png" style="width:6.20865in;height:4.56968in" />

Figure 4.1: SpartIN High-Level System Architecture

## 4.2 Component Descriptions

| <span id="Bookmark3" class="anchor"></span>Component | Purpose                                                                                                                                               | Dependencies                                |
|------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------|
| Presentation Layer                                   | Displays event cards, forms, event details, maps, and status messages. Captures swipe/click/keyboard actions and sends validated requests to the API. | Application/API Layer                       |
| Authentication/User Component                        | Handles verified accounts, sessions/tokens, user role, and profile attributes used by matching.                                                       | User data store; email verification service |
| Event Component                                      | Owns event creation, retrieval, update, rescheduling, deletion, validation, and capacity information.                                                 | Event data store; authorization context     |
| Participation Component                              | Handles join/pass/leave operations, duplicate prevention, capacity checks, and waitlist state.                                                        | Event component; participation data store   |
| Recommendation Component                             | Ranks or filters events based on available user profile attributes.                                                                                   | User profile; event data                    |
| Integration Adapters                                 | Provides a stable boundary for map/navigation, email, calendar, and sharing functions.                                                                | External services/platform capabilities     |
| Data Access Layer                                    | Provides repository/data-access functions and keeps database-specific logic outside business components.                                              | Persistent data store                       |

# 5 Functional Specifications

## 5.1 Detailed Functional Requirements

The following specifications refine the functional requirements from the PRD into implementation-oriented inputs, outputs, and dependencies. Requirement identifiers are preserved for traceability.

| <span id="Bookmark4" class="anchor"></span>**Req. ID** | **Function**                                                                 | **Inputs**                                                                                     | **Outputs**                                                            | **Dependencies**                                           |
|--------------------------------------------------------|------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|------------------------------------------------------------------------|------------------------------------------------------------|
| FR-01                                                  | Swipe/pass/join/view event                                                   | Swipe/click/keyboard action; event ID                                                          | Next event, event detail, or participation status                      | Event Discovery; Participation; Event data                 |
| FR-02                                                  | Organizer creates, edits, reschedules/postpones, or deletes an event         | Authorized organizer; title; description; start/end time; location; capacity; requested action | Created/updated/deleted event confirmation or validation error         | Authentication/Authorization; Event Management; Event data |
| FR-03                                                  | Participant views events and joins or passes                                 | User ID/session; event ID; join/pass action                                                    | Event details and updated participation state                          | Event Discovery; Participation                             |
| FR-04                                                  | Display event location on in-app map and optionally open external navigation | Event location; navigation request                                                             | Mapped event location or external navigation handoff                   | Location/Navigation adapter; Event data                    |
| FR-05                                                  | Share event as a link through supported social or messaging functions        | Event ID; share action                                                                         | Shareable event link / platform share intent                           | Sharing adapter; Event data                                |
| FR-06                                                  | Show approximate user location on campus when permission is granted          | Location permission; device location                                                           | Approximate user marker relative to campus/event location              | Client location capability; map service                    |
| FR-07                                                  | Support waitlist behavior when event is full                                 | User ID; event ID; join request; event capacity                                                | Waitlist status/position or joined status when space becomes available | Participation; Event capacity; optional Waitlist data      |
| FR-08                                                  | Add event to Apple/Google or supported device calendar                       | Event title, start/end time, location, description                                             | Prepared calendar event / calendar handoff                             | Calendar adapter                                           |
| FR-09                                                  | Direct users to matched events using profile attributes                      | User profile attributes; event attributes                                                      | Ranked/recommended event set                                           | Recommendation component; User/Event data                  |

## 5.2 Interface Specifications

| <span id="Bookmark5" class="anchor"></span>**Interface** | **Type**          | **Specification**                                                                                                                                                                              |
|----------------------------------------------------------|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Client \<-\> Application API                             | Internal          | HTTPS request/response interface for authentication, events, participation, profiles, and recommendations. Payloads should use consistent structured data and standard status/error responses. |
| Application API \<-\> Data Access                        | Internal          | Repository/service calls for users, events, and participation. Business rules should not directly depend on database-specific queries.                                                         |
| Email Verification Service                               | External          | Sends or validates university email verification and authentication-related notifications. Failure must return a user-visible retry/error state.                                               |
| Campus Map / Navigation Service                          | External          | Accepts event location information for display or external navigation handoff. Core event browsing should remain available if this service fails.                                              |
| Calendar Integration                                     | External/Platform | Passes title, date/time, location, and description to a supported calendar flow. User confirms the final external action.                                                                      |
| Sharing Integration                                      | External/Platform | Provides a shareable event link through supported device, messaging, or social sharing mechanisms.                                                                                             |

# 6 System Behavior

## 6.1 Event Handling

| <span id="Bookmark6" class="anchor"></span>**Event / Condition** | **Expected System Response**                                                                                                                       |
|------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| Participant selects Join                                         | Validate sessions, event existence, duplicate participation, and capacity. Store Joined state if valid; otherwise provide waitlist or error state. |
| Participant selects Pass                                         | Record or locally maintain Passed state and advance to another eligible event.                                                                     |
| Organizer submits invalid event data                             | Reject the request and return field-specific validation messages; do not create/update an invalid record.                                          |
| Organizer modifies an event                                      | Verify organizer authorization, validate new values, update the event, and return the updated event data.                                          |
| Event reaches capacity                                           | Reject additional direct joins or route the user to waitlist behavior when enabled.                                                                |
| Location permission denied                                       | Do not access user location. Continue to show event location/map when possible and allow non-location features.                                    |
| External map/calendar/share service unavailable                  | Show a concise error/fallback message and keep the user in SpartIN without losing the event state.                                                 |
| Duplicate join request                                           | Return to the existing participation state instead of creating a duplicate participation record.                                                   |
| Authentication/authorization failure                             | Return an authentication or permission error and prevent protected actions.                                                                        |

## 6.2 Performance Constraints

The system behavior must remain responsive under expected course-project usage. The following constraints are derived from the current PRD and should be validated in a controlled test environment:

- User-facing pages should load within 1.5 seconds under normal traffic when required data and external services are available.

- Under a test load of 100 concurrent users and a database containing at least 1,000 events, 95% of API requests shall return a response within 2 seconds.

- Performance tests should distinguish SpartIN API/database time from delays caused by third-party mapping, email, calendar, or sharing services.

# 7 Non-Functional Specifications

## 7.1 Performance Requirements

The application shall meet the performance targets in Section 3.5. Event listing and event-detail queries should support pagination or bounded result sets so response size does not grow without limit. Frequently requested, non-sensitive event data may be cached if the implementation maintains acceptable freshness after organizer updates.

## 7.2 Security Requirements

- Use university email verification before granting full account access.

- Protect organizer-only actions with server-side authorization; hiding controls in the UI alone is not sufficient.

- Use encrypted transport (HTTPS/TLS) for network communication in deployed environments.

- Apply rate limiting or equivalent request controls to reduce abuse of authentication and high-frequency API endpoints.

- Do not publicly display sensitive user information such as student ID, phone number, private email address, or home address.

- Validate and sanitize client inputs before database operations.

## 7.3 Reliability Requirements

- Core event and participation records must remain consistent if a request is retried or interrupted.

- Duplicate join operations should be idempotent from the user perspective and must not create duplicate participation records.

- External service failures should not corrupt core SpartIN data. The application should return a clear fallback or retry state.

- Errors should be logged with enough context for debugging without logging sensitive credentials or unnecessary personal information.

- 

For the initial SpartIN release, reliability will be evaluated by ensuring that interrupted or retried requests do not corrupt event or participation data, duplicate participation records are not created, and failures of external services do not affect the integrity of core SpartIN data. The system should return a clear error or retry state when an operation cannot be completed.

# 8 System Models for Validation

Validation links requirements to observable system behavior. Functional scenarios are derived from the use cases in Section 3, while performance and security scenarios validate non-functional requirements.

| <span id="Bookmark7" class="anchor"></span>**Validation ID** | **Requirement** | **Scenario**                      | **Procedure**                                                                          | **Expected Result**                                                                                             |
|--------------------------------------------------------------|-----------------|-----------------------------------|----------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| VAL-01                                                       | FR-01 / FR-03   | Event discovery and participation | Open event feed; swipe/pass one event; join a second event; open details.              | Passed event advances; joined event records participation; details display correct event data.                  |
| VAL-02                                                       | FR-02           | Organizer event management        | Authorized organizer creates an event, edits time/location, then deletes it.           | Valid changes persist; unauthorized users cannot perform organizer actions.                                     |
| VAL-03                                                       | FR-04 / FR-06   | Location behavior                 | Open event map with location permission granted, then repeat with permission denied.   | Event location remains visible; user marker appears only with permission; denial does not block core functions. |
| VAL-04                                                       | FR-07           | Capacity and waitlist             | Fill an event to capacity, then attempt another join.                                  | User is prevented from exceeding capacity and receives waitlist behavior when enabled.                          |
| VAL-05                                                       | FR-05 / FR-08   | External sharing/calendar         | Share an event and add it to a supported calendar.                                     | Correct event link/data is prepared; cancellation of external action does not alter participation.              |
| VAL-06                                                       | FR-09           | Recommendation matching           | Use profiles with different interests/majors against tagged events.                    | Recommended/ranked results reflect available matching attributes according to implemented rules.                |
| VAL-07                                                       | NFR Performance | Load test                         | Run at least 100 concurrent virtual users against a database of at least 1,000 events. | At least 95% of measured API responses are completed within 2 seconds.                                          |
| VAL-08                                                       | NFR Security    | Authorization test                | Attempt organizer-only endpoints as a participant or unauthenticated client.           | Server rejects the action, and no protected data is modified.                                                   |
| VAL-09                                                       | NFR Reliability | Duplicate/retry test              | Send duplicate join requests and simulate an external map/calendar failure.            | Only one participation record exists; external failure does not corrupt event/participation data.               |

Performance validation will use a load-test model with 100 concurrent virtual users and at least 1,000 event records. Detailed tooling and scripts are implementation decisions and will be documented by the QA/DEV team when the test environment is established.

#  9 Appendices

| **Term**      | **Definition**                                                                                                       |
|---------------|----------------------------------------------------------------------------------------------------------------------|
| API           | Application Programming Interface; a defined interface used by clients or services to request system functions/data. |
| Client        | The user-facing SpartIN application runs in a browser or compatible device environment.                              |
| Participant   | A user who discovers, views, joins, passes, or shares events.                                                        |
| Organizer     | An authorized user who creates or manages events.                                                                    |
| Rate Limiting | A control that restricts the number or frequency of requests from a client or account.                               |
| Waitlist      | A queue of users who want to join an event that has reached capacity.                                                |

| **Figure** | **Title**                              | **Location** |
|------------|----------------------------------------|--------------|
| Figure 2.1 | SpartIN System Context Diagram         | Section 2.1  |
| Figure 3.1 | SpartIN Use Case Diagram               | Section 3.1  |
| Figure 3.2 | Join Event Sequence Diagram            | Section 3.2  |
| Figure 3.3 | Event Participation State Diagram      | Section 3.3  |
| Figure 3.4 | SpartIN Level-1 Data Flow Diagram      | Section 3.4  |
| Figure 4.1 | SpartIN High-Level System Architecture | Section 4.1  |

<table>
<colgroup>
<col style="width: 34%" />
<col style="width: 65%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Field</strong></th>
<th><strong>Entry</strong></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>Date/Time</td>
<td>9/13/2026 5PM PST</td>
</tr>
<tr class="even">
<td>Attendees</td>
<td>Evan Moreno, Kabir Khan, Brandon Tu, Asfi Khan, Alex Sanchez, Cristhian Galo, Sean Luke Holscher</td>
</tr>
<tr class="odd">
<td>Document Reviewed</td>
<td>SpartIN System Architecture Document v1.0 Draft</td>
</tr>
<tr class="even">
<td>Reviewer Comments</td>
<td><p>The Reliability Requirements section contains a TBD statement for uptime and disaster recovery. The team should either define measurable reliability targets or clearly state that formal uptime and disaster-recovery objectives are outside the scope of the initial SpartIN release.</p>
<p>Revised the system context description to clearly explain how participants, organizers, SpartIN, and external services interact. Used external dependencies into university email, mapping/navigation, calendar, and sharing services. Furter constraints consist of event capacity, duplicate participation, waitlists, and external-service failures as important module behaviors.</p></td>
</tr>
<tr class="odd">
<td>Action Items</td>
<td>Revise Section 7.3 to remove the TBD statement and clarify the reliability expectations for the initial release.</td>
</tr>
<tr class="even">
<td>PIC</td>
<td>PIC: SA / QA</td>
</tr>
<tr class="odd">
<td>Due Date</td>
<td>Before final SAD submission</td>
</tr>
</tbody>
</table>

# Coordinated Revision Notes — Team Review Draft

Status: Proposed corrections for team review. These notes are not proof of implementation, execution, or team approval.

## Implementation architecture baseline

Proposed course-delivery target: responsive browser UI → backend API → persistent event repository. Exact frontend/backend framework and SQL database are pending agreement with the team; the runtime technology must be recorded consistently in PP, SFDS, and TP. External university SSO, maps, calendar, and sharing adapters may be simulated only if clearly labeled.

## Minimal implemented vertical slice

The minimum working slice is authorized organizer Event CRUD with browser UI, API, and actual data persistence. At minimum demonstrate create, view, update, delete; validate required fields and prevent unauthorized updates. The full architecture additionally describes possible participation, waitlist, and recommendation components but those are not automatically commitments to implement.

## Architecture verification

Match the SAD interfaces and component names to endpoints and storage used in code. Keep a decision log for changes discovered during implementation. Retain diagrams as conceptual architecture until the runtime implementation has been checked.

## Open decisions and sign-off

• Confirm the actual implementation stack and database against the repository.

• Verify each simulated, implemented, and deferred feature against working code.

• Review affected PRD/SAD/SFDS/TP cross-references and record the outcome in GitHub meeting minutes.

• Approve any changed requirements, update the version history, and record revisions using Word Track Changes if required for submission.
