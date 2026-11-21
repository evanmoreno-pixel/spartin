|     |                     |                         |
|-----|---------------------|-------------------------|
|     | **Document Number** | **SFS-CMPE-131 Sec 05** |
|     | **Version**         | **2.0**                 |
|     | **Status**          | **Final**               |
|     | **Created By**      | **Asfi Khan**           |

**SpartIN**

**Software Functional Design Specification**

**Reviewers**

|                                   |                     |
|-----------------------------------|---------------------|
| **Department**                    | **Name/Title**      |
| Project Manager (PM)              | Kabir Khan          |
| Product Marketing Manager (PMM)   | Brandon Tu          |
| System Architect (SA)             | Evan Moreno         |
| Developers (DEV)                  | Asfi Khan           |
| Developers (DEV)                  | Alex Sanchez        |
| Quality Assurance Engineers (QA)  | Cristhian Galo      |
| Quality Assurance Engineers (QA)  | Sean Luke Holscher  |

**Team Member Contribution Record**

**Project Team:** LOBOS  
**Deliverable:** Software Functional Design Specification

Each team member must participate in the development of this deliverable. As a team, review and agree on each member's contribution level and complete the table below before submission.

| **Team Member**     | **Contribution Level**                                              | **Brief Description of Contribution**                                                                                                           |
|---------------------|---------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| Kabir Khan          | <span class="mark">☐ Full (100%)</span> ☐ Partial (50%) ☐ None (0%) | Section 5 UML class diagram, section 8, and brief introduction in section 7, entire section 12; appendix, glossary, additional diagrams, AI PIC |
| Brandon Tu          | <span class="mark">☐ Full (100%)</span> ☐ Partial (50%) ☐ None (0%) | Section 2, List of Tables                                                                                                                       |
| Evan Moreno         | <span class="mark">☐ Full (100%)</span> ☐ Partial (50%) ☐ None (0%) | Section 11, Figure 3.1, 3.2 table, 4.2 table, 5.1 algos                                                                                         |
| Asfi Khan           | <span class="mark">☐ Full (100%)</span> ☐ Partial (50%) ☐ None (0%) | Section 6 + formatting fixes                                                                                                                    |
| Cristhian Galo      | <span class="mark">☐ Full (100%)</span> ☐ Partial (50%) ☐ None (0%) | Section 7                                                                                                                                       |
| Alex Sanchez        | <span class="mark">☐ Full (100%)</span> ☐ Partial (50%) ☐ None (0%) | Sections 1 & 4                                                                                                                                  |
| Sean Luke Holscher  | <span class="mark">☐ Full (100%)</span> ☐ Partial (50%) ☐ None (0%) | Section 10, revision comments                                                                                                                   |

**Contribution Levels**

**Full Contribution (100%)** – Fully participated and contributed to the deliverable; receives 100% of the team score.  
**Partial Contribution (50%)** – Partially participated or contributed to the deliverable; receives 50% of the team score.  
**No Contribution (0%)** – Did not participate or contribute to the deliverable; receives 0% of the team score.

**Team Confirmation:**  
By submitting this document, the team confirms that the contribution levels reported above have been reviewed and agreed upon by the team members.

# **Table of Contents**

[1 Introduction [3](#introduction)](#introduction)

[1.1 Purpose of the Document [4](#purpose-of-the-document)](#purpose-of-the-document)

[1.2 Scope [4](#scope)](#scope)

[1.3 References [4](#references)](#references)

[2 Design Goals [4](#design-goals)](#design-goals)

[3 System Architecture [5](#system-architecture)](#system-architecture)

[3.1 High-Level Architecture [5](#high-level-architecture)](#high-level-architecture)

[3.2 Component Breakdown [6](#component-breakdown)](#component-breakdown)

[4 Component Design [7](#component-design)](#component-design)

[4.1 Component Descriptions [7](#component-descriptions)](#component-descriptions)

[4.2 Component Interfaces [8](#component-interfaces)](#component-interfaces)

[4.3 Data Structures [9](#data-structures)](#data-structures)

[5 Detailed Design [10](#detailed-design)](#detailed-design)

[5.1 Algorithms [10](#algorithms)](#algorithms)

[5.2 Class Design [11](#class-design)](#class-design)

[6 User Interface Design [12](#user-interface-design)](#user-interface-design)

[6.1 Mockups [12](#mockups)](#mockups)

[6.2 UI Component Specifications [14](#ui-component-specifications)](#ui-component-specifications)

[7 Database Design [15](#database-design)](#database-design)

[7.1 Database Schema [15](#database-schema)](#database-schema)

[7.2 Queries [16](#queries)](#queries)

[8 Coding and Development Standards [17](#coding-and-development-standards)](#coding-and-development-standards)

[9 Error Handling and Logging [17](#error-handling-and-logging)](#error-handling-and-logging)

[10 Security Considerations [17](#security-considerations)](#security-considerations)

[11 Test Design [18](#test-design)](#test-design)

[11.1 Unit Tests [18](#unit-tests)](#unit-tests)

[12 Appendices [18](#appendices)](#appendices)

**List of Tables**

[<u>Table 1, Section 3.2: Components Breakdown Table</u>](#Bookmark1)

[<u>Table 2, Section 4.2: Component Interfaces Table</u>](#Bookmark2)

[Table 3, Section 7.1: User Information Table](#Bookmark3)

[Table 4, Section 7.1: Event Information Table](#Bookmark4)

[Table 5, Section 7.1: Participation Information Table](#Bookmark5)

[Table 6, Section 12: Appendices Table](#appendices)

# Introduction

## Purpose of the Document

This document is intended for project stakeholders, developers, QA engineers, and System Architect. While the System Architecture Document (SAD) establishes the macro-level structure of SpartIN, this Software Functional Design Specification (SFDS) defines the low-level functional behavior, internal module interactions, data structures, algorithmic logic, UI specifications, and database schemas. It serves as an actionable blueprint for implementing the system, translating the architectural components defined in the SAD and the user requirements from the Product Requirements Document (PRD) into clear specifications that developers can code and testers can validate.

## Scope

- Describe the functionality being addressed in this design specification.

- Describe how this specification relates to the **System Functional Specification** (**SFS**)

This SFDS defines the technical implementation and low-level design for SpartIN, focusing on the system modules, algorithms, interfaces, and database models detailed in the sections below. Specifically, this scope covers:

- Component Design (Section 4): Low-level specifications, interfaces, and data structures.

- Detailed Design (Section 5): Step-by-step logical workflows and procedural logic, such as card swipe handling and event joining/waitlist evaluation, alongside object-oriented class specifications

- User Interface Design (Section 6): Behavioral specifications and layout details for main application views such as the Home swipe interface, interactive Calendar filtering, and the Create Event form

- Database design (Section 7): Relational schema definitions covering User Information, Event Lists, and Participation records along with sample operational queries

##  References

[System Architecture Design](https://sjsu0-my.sharepoint.com/:w:/g/personal/kabir_khan_sjsu_edu/IQAM9xCOdvsmQarW_K_xjgMjAaLQX53nSPwjlE8bPkoZhGs)

[Product Requirements Document](https://sjsu0-my.sharepoint.com/:w:/g/personal/rene_e_moreno_sjsu_edu/IQAmmudNxKL_Trzyswd8QJv6AXPUSIx79_U5wSPv4sSrYrg)

# Design Goals

- Usability: Explain how the design ensures an intuitive user experience. The design that we are implementing is meant to be easy and simple so that it may be intuitive to new users. Basing it off using a Tinder’s user interface, accepting and viewing events become a lot easier, allowing users to see what interests them as well as hosting events, checking event location and dates as well as user information.

- Performance: Define design choices that optimize speed and efficiency. Some design choices that we have taken to optimize the program are displaying images using compression and using API calls to keep it lightweight for mobile devices.

- Scalability: Highlight provisions for handling increased workloads. We plan to rely on the handle of increased workloads by handling user information, event information, and booking separately.

- Maintainability: Describe how the design facilitates future updates. SpartIn will have each component independent, so changes in account information won’t affect the events components to have compartmentalization.

- Security: Outline design principles to protect data and system integrity. By using school login, which is authenticated with DUO Mobile, login only needs to be verified to have worked successfully. This will also be used to edit already published events, so only the owner may modify the event.

# System Architecture

## High-Level Architecture

SpartIN uses a layered client-server architecture. The presentation layer handles user interactions. The application API layer contains authentication, event, participation, and recommendation logic. The data access layer isolates database-specific operations. The integration adapters isolate external email, map/navigation, calendar, and sharing services.

<img src="./media/image1.png" style="width:6.5in;height:3.95833in" />Figure 3.1: SpartIN High-Level Software Architecture

This separation supports independent testing and reduces the effect of future changes. Core event browsing should remain usable even if non-core external services fail.

## Component Breakdown

| <span id="Bookmark1" class="anchor"></span>**Component** | **Primary Responsibility**                                                                                  | **Key Interactions**                    |
|----------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|-----------------------------------------|
| Presentation Layer                                       | Displays event cards, details, forms, maps, and status messages; captures swipe/click/keyboard actions.     | Application/API Layer                   |
| Authentication/User Component                            | Verifies accounts and sessions; maintains user role/profile context; supports authorization.                | User data; email verification service   |
| Event Component                                          | Creates, retrieves, updates, reschedules/postpones, deletes, and validates events and capacity information. | Authentication context; Event data      |
| Participation Component                                  | Handles join, pass, leave, duplicate prevention, capacity checks, and waitlist state.                       | Event Component; Participation data     |
| Recommendation Component                                 | Ranks or filters events using available profile attributes such as interests, skills, or major.             | User profile; Event data                |
| Integration Adapters                                     | Isolate map/navigation, email, calendar, and sharing integrations from core business logic.                 | External services/platform capabilities |
| Data Access Layer                                        | Provides repository/data-access functions and keeps database-specific logic out of business components.     | Persistent data store                   |
| Persistent Data Store                                    | Stores Users, Events, and Event Participation records.                                                      | Data Access Layer                       |

# Component Design

## Component Descriptions

- Authentication Service that handles user’s sign in before viewing events, stores their email and gives them unique identifier

  - Component Name: Authentication Service

  - Responsibilities: User login, password recovery

  - Inputs: University email, create password

  - Outputs: session token

  - Dependencies: Database, external APIs

- Event Management helps authorized organizers create and manage events

  - Component Name: Event Manager

  - Responsibilities: Create events with descriptions and location details, set participants capacity, waitlist toggle, delete events created by them

  - Inputs: Event title, description, start/end time, location, capacity, waitlist toggle, organizer ID

  - Outputs: Created/updated event objects (event ID, metadata, capacity states), operation confirmation statuses, or validation error messages

  - Dependencies: Event data store, Authorization Service

- Event discovery service

  - Component Name: Event Discovery

  - Responsibilities: Retrieve available events, serve event card attributes, and process swipe/pass actions

  - Inputs: User ID, filter parameters

  - Outputs: Array of event objects, next event card

  - Dependencies: Event data store

- Participation and waitlist service

  - Component Name: Participation Tracker

  - Responsibilities: Track user-to-event relationships, prevent duplicate joins, evaluate capacity limits, and manage automated waitlist queues

  - Inputs: User ID, Event ID, join/leave action trigger

  - Outputs: Updated participation status (Joined, Waitlisted, Passed, Left)

  - Dependencies: Event Management component, Participation data store

- Recommendation service

  - Component Name: Recommendation Allocator

  - Responsibilities: Ranks and filters available events for users based on active profile attributes, such as major, technical skills, and user interests, to display relevant campus activities on the Home discovery queue.

  - Inputs: Active user profile attributes (user ID, major, skills, interests) and upcoming event metadata (event ID, tags, start time)

  - Outputs: A prioritized, sorted list of event IDs representing the customized card queue for the user’s Home swipe interface

  - Dependencies: User profile data store, event data store

- Sharing & calendar service

  - Component Name: Sharing & Calendar Service

  - Responsibilities: Generate deep links for social distribution and format payloads for native calendar app integration

  - Inputs: Event title, description, time range, location

  - Outputs: Native OS share sheet, device calendar intent

  - Dependencies: Native device share/calendar service adapter

- Location & navigation service

  - Component Name: Location & Navigation Service

  - Responsibilities: Map geographic event data onto the in-app campus map and handle handoffs to external navigation apps

  - Inputs: Event location string/coordinates, device GPS permissions

  - Outputs: Rendered map pin, deep link to Apple/Google Maps

  - Dependencies: Campus Map API, device location services

  - 

- Data access service

  - Component Name: Data Access Service

  - Responsibilities: Provide centralized repository and database query functions, abstracting persistent data operations outside business logic components

  - Inputs: Raw data queries, record mutations (Create, Read, Update, Delete requests), and transaction parameters from the business logic layer

  - Outputs: Queried dataset records, persistence confirmation flags, or database error/exception responses

  - Dependencies: Persistence data store

## Component Interfaces

| <span id="Bookmark2" class="anchor"></span>**Interface** | **Type**                    | **Design Specification**                                                                                                                                                      |
|----------------------------------------------------------|-----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Client, Application API                                  | Internal HTTPS              | Structured request/response interface for authentication, profiles, events, participation, and recommendations. Use consistent payloads and standard success/error responses. |
| Application API, Data Access                             | Internal service/repository | Business components call repository/data-access functions for Users, Events, and Participation rather than embedding database-specific queries.                               |
| Join Event operation                                     | Internal HTTPS              | The SAD sequence model uses POST /events/{id}/join. The operation validates session, event, duplicate participation, and capacity before committing a state.                  |
| Email Verification Service                               | External                    | Sends or validates university email verification and authentication-related notifications. Failure returns a user-visible retry/error state.                                  |
| Campus Map / Navigation                                  | External                    | Accepts event location information for in-app display or navigation handoff. Core event browsing remains available if the service fails.                                      |
| Calendar Integration                                     | External / platform         | Passes title, date/time, location, and description to a supported calendar flow. The user confirms the external action.                                                       |
| Sharing Integration                                      | External / platform         | Provides a shareable event link using supported device, messaging, or social sharing mechanisms.                                                                              |

- Internal Interfaces: Data passed between components, including authentication tokens and role contexts from the Authentication Service, prioritized event IDs from the Recommendation Allocator to the Event Discovery Queue, event mutation payloads from the Event Manager, real-time participation status updates (Joined, Waitlisted, Passed, Left) from the Participation Tracker, and Create, Read, Update, Delete (CRUD) query requests passed through the Data Access Service

- External Interfaces: REST API endpoints for institutional email authentication and verification, Campus Map API endpoints for rendering campus locations, device-level GPS location services, and native OS adapters for triggering device calendar intents, calendar file export, and system share sheets.

## Data Structures

This system uses the following data structures and object models across its components and database layers:

- User Object/Profile Model:

  - Represents authenticated user accounts and profile attributes used by the Authentication Service and Recommendation Allocator.

  - Attributes:

    - Unique Identifier

    - Full Name

    - Display Username

    - Password Credentials

    - System Role

    - Interests

- Event Object Model:

  - Represents individual campus events managed by organizers and appears through the discovery queue.

  - Attributes:

    - Unique Event Identifier

    - Organizer Reference

    - Event Title

    - Event Description

    - Location Information

    - Event Data & Time

    - Capacity Limit

    - Waitlist Toggle

    - Event Image

- Participation Record Model:

  - Manages the relational state between users and events, updated by the Participation Tracker component.

  - Attributes:

    - Participation Identifier

    - User Reference

    - Event Reference

    - Participation Status

# 

# Detailed Design

## Algorithms

Join Event / Capacity Check

Inputs: authenticated user/session, event ID, join request. Output: Joined, Waitlisted/full, existing participation state, or validation/authorization error.

1.  Validate the user session and confirm the event exists and is open.

2.  Read the current event capacity and the user's existing participation state.

3.  If the user is already Joined or Waitlisted, return the existing state; do not create a duplicate record.

4.  If joined count is below capacity, create or update the participation state to Joined.

5.  Else, if waitlisting is enabled and available, assign Waitlisted status and return the user's waitlist position.

6.  Otherwise return an event-full state/error without modifying participation data.

7.  Return the resulting participation status to the client.

Organizer Create / Update Event

Inputs: authenticated organizer, requested action, title, description, start/end time, location, capacity. Output: stored event data/confirmation or field-specific validation/authorization error

1.  Validate the session and verify organizer authorization.

2.  Validate required event fields and reject empty/invalid entries.

3.  If creating, store a new Event record.

4.  If editing or rescheduling/postponing, verify the organizer's own/is authorized for the event, then update valid values.

5.  If deleting, verify authorization and delete/cancel according to the implemented event-management rule.

6.  Return updated event data or a clear error response.

Event Discovery / Swipe Flow

Inputs: authenticated participants and available event catalog. Output: event card/detail, passed state, Joined/Waitlisted state, or next eligible event.

1.  Retrieve an eligible set of events.

2.  Present the current event card and allow details to be opened.

3.  On Pass, record or locally maintain Passed state and advance to another eligible event.

4.  On Join, execute the Join Event / Capacity Check algorithm.

5.  If recommendation matching is enabled, use available profile/event attributes to prioritize the returned set.

## Class Design

<img src="./media/image2.png" style="width:4.47314in;height:5.28644in" />

Figure 5.2: Logical Class / Service Design

# User Interface Design 

## Mockups 

> <img src="./media/image3.png" style="width:1.56in;height:3.37792in" />
>
> Figure 1: Mockup of SpartIN Home Page with Event card. Bottom taskbar has icons for the home page, calendar of events and other important SJSU dates, a button to create an event, a map, and a personal account page.
>
> <img src="./media/image4.png" style="width:1.56in;height:3.37792in" />
>
> Figure 2: Mockup of the Calendar page, where users can view a calendar with various categories of events. Users can toggle between viewing by day/week/month/year, use the arrow buttons to move between time periods, and filter categories of events.
>
> <img src="./media/image5.png" style="width:1.56in;height:3.37792in" />
>
> Figure 3: Mockup of the Create Event page, which provides organizers with relevant fields to complete.
>
> <img src="./media/image6.png" style="width:1.56in;height:3.37792in" />
>
> Figure 4: Mockup of the Map page, which gives users a map with a search bar and a list of nearby locations.
>
> <img src="./media/image7.png" style="width:1.56in;height:3.37792in" />
>
> Figure 5: Mockup of the Account page with options to change account attributes and app settings, view events user is organizing or attending, and view a changelog of the app.

## UI Component Specifications 

- Detail the behavior of individual UI elements (e.g., buttons, forms).

- Home

  - Main UI displays event cards to the user

  - User swipes left to pass the event and move on to the next one

  - User swipes right to join the event. They will be added to the appropriate list (event attendees or waitlist) and the app will display another event.

  - “My Events” button will take user to a list of events they are hosting or attending.

    - Organizers can change event data or delete the event.

    - Participants can drop out of an event, share a link, or navigate to the event

- Calendar

  - Toggle between viewing the calendar by day, month, week, or year

  - Filter button allows user to choose which categories of events they want to see on calendar

  - Move between \[day/week/month/year\] using left and right arrow buttons

  - Easily move back to Today with the touch of a button

- Create Event

  - Choose a title for the event that will show up on the event card

  - Clicking the date field pulls up a calendar to allow the organizer to choose a date

  - Clicking the time field gives users scroll wheels to set the time in 12-hour format (AM/PM)

  - Location field allows users to enter an address or location name on or off-campus

  - Add an image to appear on the event card

  - A description of the event that can be seen if participants want to learn more

  - Define event capacity (accept numbers only) and toggle whether or not new participants will be moved to the waitlist if the event is full

- Map

  - Based on user’s location settings

  - Display a campus map with location markers for user’s events

  - Clicking a marker allows user to navigate to the event using GPS

  - Display a list of nearby events or relevant locations.

    - Search bar entry replaces the list with results that satisfy the search prompt

- Account

  - Displays full name, username, major, biography

  - Account button allows users to make edits to username, password, etc.

  - Settings button allows users to manage settings for notifications, location services

  - My Events button shows users a list of events they are participating in, as well as events they are hosting.

  - Changelog shows a list of updates to the app and the changes made.

# Database Design 

## Database Schema 

The database consists of 3 categories that store user’s data:

1.  Users = Information of users like email

2.  Events = List of different events that were selected and created

3.  Participation = List of members showing up, added the event

**Table: Users**

| <span id="Bookmark3" class="anchor"></span>**Column** | **Data Type** | **Description**                                         |
|-------------------------------------------------------|---------------|---------------------------------------------------------|
| name                                                  | Char(100)     | User’s display name                                     |
| university_email                                      | char(255)     | University email of users contains symbols “@”, “.”     |
| display_name                                          | varchar(100)  | User’s display username                                 |
| password_hash                                         | varchar(255)  | Hashed password for security, never store in plain text |
| role                                                  | varchar(20)   | “Participant" or “organizer”                            |
| interests                                             | text\[\]      | Used by recommendation allocator                        |
| created_at                                            | timestamp     | Account creation time                                   |

<span id="Bookmark4" class="anchor"></span>**Table: Events**

| **Column**       | **Data Type**             | **Description**                             |
|------------------|---------------------------|---------------------------------------------|
| event_id         | UUID(PK)                  | Unique identifier for the event             |
| organizer_id     | UUID (FK-\>Users.user_id) | Creator of the event                        |
| title            | varchar(150)              | Event title shown on the card               |
| description      | text                      | Full event description                      |
| location         | varchar(255)              | Address or on-campus location               |
| event_date       | date                      | Event date                                  |
| event_time       | time                      | Event start time                            |
| capacity         | int                       | Max number of participants(null = no limit) |
| waitlist_enabled | boolean                   | Whether overflows joins go to waitlist      |
| image_url        | varchar(255)              | Optional event image                        |
| created_at       | timestamp                 | Row creation time                           |
| updated_at       | timestamp                 | Last edit time                              |

<span id="Bookmark5" class="anchor"></span>**Table: Participation**

| **Column**       | **Data Type**              | **Description**                          |
|------------------|----------------------------|------------------------------------------|
| Participation_id | UUID(PK)                   | Unique identifier for the record         |
| user_id          | UUID (FK-\>Users.user_id)  | Participant                              |
| event_id         | UUID(FK-\>Events.event_id) | Event joined/passed                      |
| status           | varchar(20)                | "joined”, “waitlisted”, “passed”, “left” |
| updated_at       | timestamp                  | Last status change                       |

## Queries

-- Create a new user

INSERT INTO Users (name, university_email, display_name, password_hash, role) VALUES ('Cristhian Galo’, ‘cristhian.galo@sjsu.edu’, cris, 'hashed_password', 'participant');

Create a new event

INSERT INTO Events (organizer_id, title, description, location, event_date, event_time, capacity, waitlist_enabled) VALUES ('organizer_id', 'Career Fair', 'Meet employers on campus', 'Event Center', '2026-10-15', '10:00', 100, true);

Join an event

INSERT INTO Participation (user_id, event_id, status) VALUES ('user_id', 'event_id', 'joined');

Check how many people have joined an event

SELECT COUNT(\*) AS joined_count FROM Participation WHERE event_id = 'event_id' AND status = 'joined';

Get all events a user has joined SELECT

e.title, e.event_date, e.location FROM Events e JOIN Participation p ON e.event_id = p.event_id WHERE p.user_id = 'user_id' AND p.status = 'joined';

Get all events created by an organizer

SELECT \* FROM Events WHERE organizer_id = 'organizer_id';

Update participation status (move from waitlisted to joined)

UPDATE Participation SET status = 'joined', updated_at = now() WHERE participation_id = 'participation_id';

# Coding and Development Standards 

- Coding standards and conventions

  - Use consistent camel case naming conventions for variable names, functions, methods; use pascal case for components

  - Utilize 3<sup>rd</sup> party libraries like Prettier to identify code formatting issues, use ESLint to identify unsafe low quality code before pushing

- Tools and Frameworks

  - Use a browser-accessible web frontend with TypeScript or JavaScript, following the layered architecture defined for SpartIN. Confirm the exact framework against the implementation before final release.

  - The team can select their desired choice for IDE like VSCode, eclipse, IntelliJ along with helpful extensions

- Version Control Practices

  - Use Git with separate feature branches such as event creation, joining events, and waitlist sessions

  - Require pull requests by developers to be reviewed by QA team and other team members before merging changes into main branch

# Error Handling and Logging 

- **Presentation Layer**: Validate user input and display clear messages for missing fields, invalid event details, full events, or failed registration

- **API Application Layer**: Return consistent HTTP status codes for error messages and invalid requests

- **Error Recovery**: Prevent duplicate queries and records of events

- **Logging Standards**: Use DEBUG for development status, INFO for successful operations, WARN for recoverable issues, and ERROR for failed and invalid requests

- **Security**: Do not log passwords, API keys, private emails, or other sensitive user information

- **Monitoring:** Include timestamps, request or user ids, operations and error descriptions

#  Security Considerations

- Data encryption

  - Encryption key management using services such as AES

  - Secure protocols for all data transit across public networks

  - Sensitive field masking to encrypt highly sensitive data

- Authentication and authorization mechanisms

  - Token-based authentication through DUO Mobile

  - Two-factor authentication to secure access for students only

- Prevention of common vulnerabilities

  - Parameterized queries to prevent SQL injection attacks

  - Content security policies to prevent cross-site scripting attacks

  - Rate limiting and throttling to prevent brute-force and DDoS attacks

# Test Design

## Unit Tests 

| **Unit**                | **Test**                                                                | **Expected Outcome**                                                                                             |
|-------------------------|-------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| Authentication - User   | Validate a valid session and an invalid/missing session.                | Valid session returns user/role context; invalid session is rejected without protected data changes.             |
| Event Validation        | Submit missing/invalid required event data.                             | Validation fails, and no event record is created/updated.                                                        |
| Event Service           | Create, edit/reschedule, and delete using an authorized organizer.      | Valid changes persist, and the returned event data reflects the operation.                                       |
| Authorization           | Attempt organizer-only operation as participant/unauthenticated client. | Request is rejected, and protected event data is unchanged.                                                      |
| Participation           | Join an open event under capacity.                                      | Exactly one participation record/state is Joined.                                                                |
| Participation Duplicate | Repeat the same join request.                                           | Existing state is returned; a duplicate participation record is not created.                                     |
| Capacity - Waitlist     | Attempt to join after capacity is reached.                              | No over-capacity Joined state is created; waitlist/full behavior is returned according to enabled functionality. |
| Pass                    | Pass an event.                                                          | Passed state is recorded or locally maintained, and the next eligible event can be presented.                    |
| Recommendation          | Provide different available profile attributes.                         | Results reflect the implemented matching rules; exact ranking behavior follows the rule set chosen by DEV.       |
| Integration Adapter     | Simulate map/calendar/share/email failure.                              | Adapter returns a controlled error/fallback state without modifying core event/participation records.            |

# Appendices

- Glossary of terms used in the specification.

| **Term**             | **Definition**                                                                                                        |
|----------------------|-----------------------------------------------------------------------------------------------------------------------|
| API                  | A defined interface that allows the SpartIN application to communicate with backend services and external systems     |
| Authentication       | The process of verifying a user’s identity before allowing access to SpartIN                                          |
| Client               | The user-facing SpartIN mobile application used to view, create, join, and manage events                              |
| RSVP                 | A user’s response indicating whether they intend to participate in an event                                           |
| Google Maps API      | An external service used to display event locations, map markers, and navigation directions within SpartIN            |
| Repository           | A component responsible for communicating with the database while keeping database logic separate from business logic |
| Skeleton Loader      | A temporary visual placeholder displayed while event or profile information is loading                                |
| Foreign Key          | A column that connects a record in one database table to a record in another table                                    |
| Primary Key          | A column that uniquely identifies each record in a database table                                                     |
| UUID                 | A unique identifier used to distinguish users, events, and participation records                                      |
| Layered Architecture | An architecture that separates the presentation, application/API, data-access, and integration layers                 |

- Additional Diagrams: Any supplementary diagrams that support the design

  - **Figure A.1**: SpartIN System Context Diagram, showing the relationship between users, the SpartIN application, the database, Google Maps, calendar services, and sharing platforms

  - **Figure A.2**: SpartIN Use Case Diagram, showing major user actions such as creating events, swiping through events, joining events, joining waitlists, and viewing maps

  - **Figure A.3**: Join Event Sequence Diagram, showing the interaction between the user, mobile application, API, database, and waitlist during the event-joining process

  - **Figure A.4**: Event Participation State Diagram, showing possible participation states such as passed, joined, waitlisted, left, and cancelled

Review meeting minutes:

- Date and Time: September 15 - 20, 2026

- Location: BBC 322, and discord communication

- Attendees: Kabir Khan, Brandon Tu, Evan Moreno, Cristhian Galo, Asfi Khan, Alex Sanchez, and Sean Luke Holscher.

- Document Reviewed: SpartIN Software Framework Design Specification, Sections 4–7.

Discussion Summary:

- The team reviewed the component design for event management, authentication, event swiping, and Google Maps integration.

- The Event Library Service was proposed to process left and right swipes and update event participation records.

- The Authentication component was discussed as responsible for user login, profile information, and session management.

- The team discussed using APIs to retrieve event location information from Google Maps.

Discussion/Considerations:

- The team will separate frontend components, backend services, database operations, and external Google Maps integrations.

- Database technologies discussed during the meeting are possible alternatives and are not yet final decisions.

- The final database selection must support users, events, participation records, waitlists, event locations, and timestamps.

Action Items:

- Developers begin collaborating together on SFDS and finish the draft, Sep 19, (Asfi Khan, Alex Sanchez)

- Begin adding feedback reviews in the draft, Sep 17 - 20, (everyone)

- Check up on progress and resources/help the developers need for the drafting process of SFDS, Sep 18, (Kabir Khan)

# Coordinated Revision Notes — Team Review Draft

Status: Proposed corrections for team review. These notes are not proof of implementation, execution, or team approval.

## Implementation and simulation scope

The core implemented flow for the course is organizer Event CRUD, exercised from a browser UI through API calls to a persistent event store. Other detailed designs (swipe, joining, waitlist, maps, calendar, and recommendations) may be implemented, simulated, or deferred; record their verified status in the project feature-status matrix. A detailed algorithm description alone does not establish that code exists.

## Minimum API and persistence contract

Proposed behavior (route names to be reconciled with actual code): create event, list/get event, update event, delete event. Event record should have stable ID, organizer identifier, title, description, start/end timestamp, location, and capacity as supported by actual schema. Reject invalid inputs and unauthorized write attempts. Verify that a created/updated/deleted event changes the persistent repository, not just the client display.

## Technology and authentication checkpoints

Use a browser-accessible TypeScript or JavaScript interface for the course web target. Select the database and backend implementation based on the actual repository before treating this description as final. Institutional SSO/Duo must not be represented as implemented unless integrated; a mock must be labeled Simulated.

## Open decisions and sign-off

• Confirm the actual implementation stack and database against the repository.

• Verify each simulated, implemented, and deferred feature against working code.

• Review affected PRD/SAD/SFDS/TP cross-references and record the outcome in GitHub meeting minutes.

• Approve any changed requirements, update the version history, and record revisions using Word Track Changes if required for submission.
