|     |                     |                         |
|-----|---------------------|-------------------------|
|     | **Document Number** | **PRD-CMPE-131 Sec 05** |
|     | **Version**         | **1.0**                 |
|     | **Status**          | **Draft**               |
|     | **Created By**      | **Brandon Tu**          |

**SpartIN**

**Product Requirements Document**

**Reviewers**

|                                  |                                    |
|----------------------------------|------------------------------------|
| **Department**                   | **Name/Title**                     |
| Project Manager (PM)             | Kabir Khan                         |
| Product Marketing Manager (PMM)  | Brandon Tu                         |
| System Architect (SA)            | Evan Moreno                        |
| Developers (DEV)                 | Asfi Khan, Alex Sanchez            |
| Quality Assurance Engineers (QA) | Cristhian Galo, Sean Luke Holscher |

**Team Member Contribution Record**

**Project Team:** \_\_\_\_\_\_\_<u>LOBOS</u>\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Deliverable:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Each team member must participate in the development of this deliverable. As a team, review and agree on each member's contribution level and complete the table below before submission.

| **Team Member**    | **Contribution Level**                                              | **Brief Description of Contribution**                                                                                                                        |
|--------------------|---------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Kabir Khan         | <span class="mark">☐</span> Full (100%) ☐ Partial (50%) ☐ None (0%) | Completed section 5.1 to 5.2 tables for FR and NFR and section 6.2 for anticipated changes. Also, added a diagram for section 5 and section 8 Function index |
| Brandon Tu         | <span class="mark">☐</span> Full (100%) ☐ Partial (50%) ☐ None (0%) | Created initial doc, completed section 2.1 alignment, 4.3 process standards, 2.1 product goals, 8 Alphabetic and Diagram Index                               |
| Evan Moreno        | <span class="mark">☐</span> Full (100%) ☐ Partial (50%) ☐ None (0%) | Worked on Section 4 and 7, Managed Table of Contents, Section 5 Table Items Labels, Proper Doc Table Formatting, Diagram 4.1                                 |
| Asfi Khan          | <span class="mark">☐</span> Full (100%) ☐ Partial (50%) ☐ None (0%) | Section 2.1 problem statement and purpose + minor fixes                                                                                                      |
| Cristhian Galo     | <span class="mark">☐</span> Full (100%) ☐ Partial (50%) ☐ None (0%) | Completed section 4.1 and 4.2 and added new member Sean to Team Member contribution                                                                          |
| Alex Sanchez       | <span class="mark">☐</span> Full (100%) ☐ Partial (50%) ☐ None (0%) | Completed Section 5.3, section 3 Glossary, Section 6.1 Assumptions                                                                                           |
| Sean Luke Holscher | <span class="mark">☐</span> Full (100%) ☐ Partial (50%) ☐ None (0%) | Edited table of contents and reviewers' section, Comple section 2.2 and 2.3, 2.1 product goals                                                               |

**Contribution Levels**

**Full Contribution (100%)** – Fully participated and contributed to the deliverable; receives 100% of the team score.

**Partial Contribution (50%)** – Partially participated or contributed to the deliverable; receives 50% of the team score.

**No Contribution (0%)** – Did not participate or contribute to the deliverable; receives 0% of the team score.

**Team Confirmation:**

By submitting this document, the team confirms that the contribution levels reported above have been reviewed and agreed upon by the team members.

**Table of Contents**

[1 Preface [4](#preface)](#preface)

[1.1 Expected Readership [4](#expected-readership)](#expected-readership)

[1.2 Version History [4](#version-history)](#version-history)

[2 Introduction [5](#introduction)](#introduction)

[2.1 Need for the System [5](#need-for-the-system)](#need-for-the-system)

[2.2 Overview of the System [5](#overview-of-the-system)](#overview-of-the-system)

[2.3 Integration [5](#integration)](#integration)

[3 Glossary [6](#glossary)](#glossary)

[4 User Requirements Definition [7](#user-requirements-definition)](#user-requirements-definition)

[4.1 Service Provided [7](#service-provided)](#service-provided)

[4.2 Non-Functional Requirements [7](#non-functional-requirements)](#non-functional-requirements)

[4.3 Standards [8](#standards)](#standards)

[5 System Requirements Specification [8](#system-requirements-specification)](#system-requirements-specification)

[5.1 Functional Requirements [8](#functional-requirements)](#functional-requirements)

[5.2 Non-Functional Requirements [10](#non-functional-requirements-1)](#non-functional-requirements-1)

[5.3 Interfaces [10](#interfaces)](#interfaces)

[6 System Evolution [11](#system-evolution)](#system-evolution)

[6.1 Assumptions [11](#assumptions)](#assumptions)

[6.2 Anticipated Changes [11](#anticipated-changes)](#anticipated-changes)

[7 Appendices [11](#appendices)](#appendices)

[8 Index [12](#index)](#index)

**List of Tables**

[<u>Table 1.2: Version History</u>](#version-history)

[<u>Table 3: Glossary</u>](#glossary)

[<u>Table 5.1: Functional Requirements</u>](#functional-requirements)

[<u>Table 5.2: Non-Functional Requirements</u>](#_Non-Functional_Requirements)

# Preface

## Expected Readership

This document is intended for the following audience:

- 

- **Stakeholders**: To understand SpartIn’s purpose, scope, priorities and requirements. These stakeholders are transfer students looking for a service that helps them organize events and meet people, company sponsors looking to host professional events for transfer students, and other individuals looking for this service. **Developers** **(Dev)**: To use as a reference for system implementation, e.g., system architect.

- **Quality Assurance (QA) Teams**: To validate and verify the system based on specified requirements.

## Version History

|         |                                     |                                                                                                  |                                                                    |                                                         |
|---------|-------------------------------------|--------------------------------------------------------------------------------------------------|--------------------------------------------------------------------|---------------------------------------------------------|
| Version | 2.0 — proposed coordinated revision | Author(s)                                                                                        | Changes                                                            | Rationale                                               |
| 1.0     | 8/25/26                             | Kabir Khan, Brandon Tu, Evan Moreno, Asfi Khan, Cristhian Galo, Alex Sanchez, Sean Luke Holscher | Initial draft created.                                             | Baseline document for requirements behind SpartIN.      |
| 2.0     | 8/30/26                             | Kabir Khan, Brandon Tu, Evan Moreno, Asfi Khan, Cristhian Galo, Alex Sanchez, Sean Luke Holscher | Completed PRD, reviewed Expected Readership and Section 5 diagrams | Filled out any missing parts of the PRD for submission. |

# Introduction

## Need for the System

- **Problem Statement**: San Jose State University’s transfer students, i.e., students completing a portion of their undergraduate journey at a different higher educational institution before attending San Jose State University, often struggle with making new friends. Because of them joining later in their journey compared to their peers who started at San Jose State, they may find it hard to fit into existing friend groups or create new ones.

- **Purpose**: SpartIN aims to provide a network that allows transfer students to connect with each other through organized events tailored specifically toward transfer students.

- **Alignment**: SpartIN connects with who we are here as Lobos where our team is also composed of a few transfer students with the goal of creating an opportunity for other transfer students to bond with one another.

The new product is aimed to:

- Create opportunities for transfer students to meet.

- Improve the ability for students to network and meet with other students with similar interests.

- Support scalability for future growth.

## Overview of the System

The system provides the following key functionalities:

- The system can create, organize, or remove events created by event organizers, which includes important info about the event such as the location, time, and general info

- Includes the feature to share events to other users or invite them to private events if applicable through social media or direct messaging platforms with a link

- The user can RSVP to or reject events and use their GPS location to navigate to the event with detailed directions

## Integration

**Integration with Other Systems**:

- This system will work seamlessly with:

  - When sharing events with other users, external links are available to share the event info through other platforms such as social media or direct messaging applications

  - The built-in GPS navigator is dependent on the SJSU campus map to navigate to event locations

- Data exchange will occur via APIs to ensure compatibility and reliability.

# Glossary

|                                         |                                                                                                                                                                                     |
|-----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Term                                    | Definition                                                                                                                                                                          |
| API (Application Programming Interface) | A set of protocols and tools that allows different software applications to communicate with each other                                                                             |
| Containerization                        | The packaging of software code with all necessary files and libraries into an executable package called a container                                                                 |
| Deep Link                               | A specialized URL scheme that points to a specific piece of content inside a mobile application, sending a user directly to it rather than launching to the home page upon clicking |
| Rate Limiting                           | A security feature used to control the number of requests a client can make to a server within a certain amount of time to prevent brute-force attacks and DDoS attempts            |
| React Native                            | An open-source mobile application framework that allows developers to build iOS and Android apps using a single codebase                                                            |
| Skeleton Loader                         | A user interface design pattern used as a placeholder element to mimic a page’s layout while content loads                                                                          |
| Swipe-to-(Join)                         | A gesture-based user interface mechanic which allows users to swipe right to commit to an event or swipe left to dismiss it                                                         |

# User Requirements Definition

## Service Provided

<img src="./media/image1.png" style="width:6.0625in;height:4.5in" />

Figure 4.1: SpartIN User Interaction Diagram

Functional Requirements:

- **Ability to create events on campus**: Our app is tailored towards transferred students who can use the app to create any casual events; for example, users can create events such as: “dinner hangout”, “getting coffee on Tuesday 9 am”

- **Tinder-style UI**: Users can swipe right to join an event or left to reveal more events. Swiping rights will automatically add a user to the participants list for the event.

- **Campus/Off campus map for easy navigation:** A visual campus map will allow users to find events; off-campus locations are also available easily

- **Clean UI:** Include features like skeleton loaders to make UI cleaner

## Non-Functional Requirements

- **Performance**: Pages must load within 1.5 seconds under normal traffic

- **Security:** Rate limit for more security and encryption for user login information. Implement an email system that prompts users to verify email for more security.

- **Scalability**: Develop an app to be able to handle at least 100 users and expand as the app becomes more popular using containerization

- **Usability:** Simple and straightforward UI to avoid user confusion

## Standards

Product and process standards.

Product Standard:

- SpartIn must be easy and intuitive to use for both organizers and attendees.

- The application should support commonly used modern web browsers for desktop and mobile devices.

- The application should maintain consistent navigation, terminology, buttons, forms, and visual elements throughout the user interface to provide predictable user experience.

- The application should protect users’ information and limit access to private information based on user permissions. Sensitive information is not displayed publicly.

- The application should follow common web practices to ensure that major functions can be used by users with different accessibility needs. Functions such as readable text, adequate contrast, and descriptive labels.

- Dates will follow a mm-dd-yyyy format

- Times will be dependent on region

Process Standards:

- GitHub will be used as the primary repository for SpartIN as a means to retain versions and collaborate.

- Code must be compiled before getting implemented into GitHub to ensure that it functions with already established code.

- Newly implemented code will be tested afterwards by the QA team for any potential oversight by the Dev team.

- Major project documents shall undergo team review before final submission. Review comments, action items, and responsibility shall be documented. Document modifications will be recorded using Microsoft Word Track Changes.

- Functional and non-functional requirements shall be verified through documented test cases with expected and actual results.

- Issues throughout the development must be tracked and listed in priority of urgency in its need for getting resolved.

- User information access will need to be authenticated to be able to ensure that any unauthorized users do not get a hold of private information

# System Requirements Specification

## Functional Requirements

The priorities are divided as follows.

HIGH: The item must be delivered on the product at production. If the item cannot be delivered, then approval is required from PMM.

MEDIUM: This item is highly desired and should be delivered on the product at production. By delivering this item as requested, we are improving the overall value proposition of the product and also improving our chance of winning against the competition.

LOW: This is not an important feature but considered nice to have.

If cost and time permit, the feature should be delivered. It will help differentiate our product from that of the competition or bring our product at par with the competition.

Diagram Functional and Non-Functional Requirement

<img src="./media/image2.png" style="width:6.03125in;height:4.02083in" />

|          |                                                                                                                                                                                        |              |
|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| **Item** | **Description**                                                                                                                                                                        | **Priority** |
| FR-01    | Users shall interact with SpartIn app’s swipe features where users can swipe left to pass on an event, swipe right to join the event, and click on the event to view its description   | HIGH         |
| FR-02    | The system shall allow an organizer to create events, delete events, postpone/reschedule events, have the option to include description, title, start-end time, location, and capacity | HIGH         |
| FR-03    | The system shall allow a participant to view different events and join/pass events                                                                                                     | HIGH         |
| FR-04    | The system shall display an event location on a campus map and may hand off to external navigation.                                                                                    | MEDIUM       |
| FR-05    | The system should have features for participants to share an event as a link to social media or messages                                                                               | LOW          |
| FR-06    | With permission, the application shall show user’s approximate location on campus map                                                                                                  | MEDIUM       |
| FR-07    | Users should have a waitlist feature in case a popular event is full and participants would like to join if space clears                                                               | LOW          |
| FR-08    | Users should be able to directly add events to their apple or google calendars based on time, day, title, and description                                                              | LOW          |
| FR-09    | Users should be directed to matched events based on their personal information like hobbies, skills, interests, major                                                                  | LOW          |
| FR-10    | If opted in, users should receive notification based on their phone number entered to remind them about an event starting in 5 minutes                                                 | LOW          |

## Non-Functional Requirements

|          |                                                                                                                                                                                  |              |
|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| **Item** | **Description**                                                                                                                                                                  | **Priority** |
| NFR-01   | System shall display error messages for invalid entries or meetups and backend shall automatically discard empty entries from the database                                       | HIGH         |
| NFR-02   | The backend shall enforce authorization for organizer-only operations and unauthorized attempts cannot modify data                                                               | HIGH         |
| NFR-03   | The system shall not expose students’ private information to public profiles like student ID, phone number, email, addresses when collecting/storing information in the database | HIGH         |
| NFR-04   | The system should auto-update availability for an event if certain users don’t show up so people so waitlist can move up                                                         | LOW          |
| NFR-05   | Under a test load of 100 concurrent users and a database containing at least 1000 events, 95% of API requests shall return a response within 2 seconds                           | HIGH         |
| NFR-06   | The system shall support its core meetup functions on the latest versions of Google Chrome and Safari on both desktop and mobile devices.                                        | MEDIUM       |
| NFR-07   | Protected operations shall require a valid authenticated user session. Requests without a valid session shall be rejected without modifying stored data.                         | HIGH         |

## Interfaces

Campus Map API: Integration with mapping services to provide campus layouts and route users to event locations off campus

Email Gateway API: Integration with the university’s official email infrastructure to handle account verification, password reset, and student authentication notifications securely using university credentials

Social Sharing Intent API: Native OS share sheets allowing users to push event deep links directly to messaging apps and social media platforms

# System Evolution

## Assumptions

Target users possess smartphones with reliable internet access and a university email address for verification

Cellular data or campus wi-fi is consistently available for real-time map tracking and swipe updates

## Anticipated Changes

The following changes to SpartIn app may occur as user needs, technical constraints, and product requirements evolve:

- Interface design: User testing may show that swipe feature requires additional controls that may not be compatible with web based devices and may need modification like keyboard compatibility, mouse interaction

- 

- Location Services: The initial design will display event locations using in-app campus map. Future versions may integrate external services, such as Google Maps or Apple Maps. Meetup Description: Initially SpartIn displays events to users based on simple filters like date and availability. Future updates may support advanced filters like major, preferred group size

- Participation Management: Initial design supports basic joining and leaving the event. Future versions may support waitlist features, confirmation, and automated status updates

# Appendices

Hardware Requirements:

Minimal configuration - a cloud server instance featuring two vCPUs, 4 GB RAM, and 30 GB SSD storage to support the baseline target of 100 concurrent users

Optimal Configuration - Scaled cloud infrastructure utilizing four vCPUs, 8 GB RAM, and containerization orchestration to manage traffic spikes and ensure high availability

Minimum Client Requirements:

- Modern Smartphone, tablet, laptop, or desktop computer

- Current version of a commonly supported web browser

- Reliable broadband, Wi-Fi, or cellular internet connection

- Location services enabled for map and navigation functionality

Database Requirements:

SpartIN requires proper data storage to maintain information about users, events, and event participation. The database supports creating, retrieving, updating, and deleting application data.

The primary logical entries are:

**User**

- User ID

- Name

- University email

- User role

- Interests

- Major

**Event**

- Event ID

- Organizer ID

- Title

- Description

- Start time

- End time

- Location

- Capacity

**Event Participation**

- Participation ID

- Event ID

- User ID

- Participation status

The primary relationships are:

- One User may create multiple Events when acting as an organizer.

- One Event is associated with one organizer.

- One User may participate in multiple events.

- One Event may contain multiple participants.

- Event Participants associated users with the events they join.

The database should distinguish between public and private information that may be displayed. Sensitive information such as student ID and email addresses should not be publicly displayed.

#  Index

**Alphabetic Index**: Terms and Definitions.

- Accessibility: Section 4.1, 4.2

- Attendees: Section 7

- Database: Section 7

- Event Hosting: Section 2.2, 7

- Hardware Requirements: Section 7

- Navigation: Section 2.2, 4.1

- Performance: Section 4.2

- Security: Section 4.3

- Standards: Section 4.3

- User Interface: Section 2.2, 4.1

- User Information: Section 4.3, 5.1

**Diagram Index**: List of diagrams.

- SpartIN Functional Use Cases: Section 5.1

- SpartIN UI Interaction Diagram: Section 4.1

**Function Index**: List of system functions.

- Contains description of system functions in section 5.1

| Browse meetups           | FR-01           |
|--------------------------|-----------------|
| Pass on a meetup         | FR-01 / FR-03   |
| Join a meetup            | FR-01 and FR-03 |
| View meetup details      | FR-01 and FR-03 |
| Create a meetup          | FR-02           |
| Update/reschedule meetup | FR-02           |
| Delete/cancel meetup     | FR-02           |
| View meetup location     | FR-04 and FR-06 |
| Join a waitlist          | FR-07           |
| Share a meetup           | FR-05           |
| Export to calendar       | FR-08           |

# Coordinated Revision Notes — Team Review Draft

Status: Proposed corrections for team review. These notes are not proof of implementation, execution, or team approval.

## Core scope

The course-required working subset is one end-to-end Event CRUD flow (browser UI → API → persistent data repository): create, view, update, and delete events. Swipe, participation, waitlist, map, calendar, recommendations, and SMS remain product requirements or proposed enhancements; whether each is implemented, simulated, or deferred must be verified against the actual build.

## Priority interpretation

For the course delivery, Event CRUD is implementation-critical. Other feature priorities in the original PRD describe product desirability, not a claim that all have been completed. Before submission, the team should ratify a feature-status matrix and avoid calling deferred features implemented.

## Authentication decision pending

An SJSU email format check is not equivalent to SJSU identity verification or official SSO/Duo authentication. Choose either an approved real identity provider or explicitly labeled simulated authentication; authorization for organizer modifications must still be tested on the implemented core flow.

## Requirements traceability

Use PRD FR-01 through FR-10 and NFR-01 through NFR-07 as the canonical IDs. Connect each implemented requirement to SAD design, SFDS behavior, a complete test case, and evidence. Do not assert coverage solely because a test ID appears in a table.

## Open decisions and sign-off

• Confirm the actual implementation stack and database against the repository.

• Verify each simulated, implemented, and deferred feature against working code.

• Review affected PRD/SAD/SFDS/TP cross-references and record the outcome in GitHub meeting minutes.

• Approve any changed requirements, update the version history, and record revisions using Word Track Changes if required for submission.
