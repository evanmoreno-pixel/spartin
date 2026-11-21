|     |                     |                                        |
|-----|---------------------|----------------------------------------|
|     | **Document Number** | **TP-CMPE-131 Sec 05**                 |
|     | **Version**         | **1.0**                                |
|     | **Status**          | **Draft**                              |
|     | **Created By**      | **Cristhian Galo, Sean Luke Holscher** |

**Lobos**

**Test Plan Document**

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
**Deliverable:** Test Plan Document

Each team member must participate in the development of this deliverable. As a team, review and agree on each member's contribution level and complete the table below before submission.

| **Team Member**    | **Contribution Level**                                              | **Brief Description of Contribution**                             |
|--------------------|---------------------------------------------------------------------|-------------------------------------------------------------------|
| Kabir Khan         | <span class="mark">☐ Full (100%)</span> ☐ Partial (50%) ☐ None (0%) | Sections 8, 9, 10 tables, defining terms                          |
| Evan Moreno        | <span class="mark">☐</span> Full (100%) ☐ Partial (50%) ☐ None (0%) | Coverage, Test Environment, Glossary                              |
| Alex Sanchez       | ☐ Full (100%) ☐ Partial (50%) ☐ None (0%)                           |                                                                   |
| Cristhian Galo     | ☐ <span class="mark">Full (100%)</span> ☐ Partial (50%) ☐ None (0%) | Sections 1.3 and 1.4                                              |
| Brandon Tu         | <span class="mark">☐ Full (100%)</span> ☐ Partial (50%) ☐ None (0%) | List of Tables, Section 4.1, minor format fixes, timeline changes |
| Asfi Khan          | <span class="mark">☐ Full (100%)</span> ☐ Partial (50%) ☐ None (0%) | Sections 1.1, 1.2, 3.1, other minor changes                       |
| Sean Luke Holscher | ☐ Full (100%) ☐ Partial (50%) ☐ None (0%)                           |                                                                   |

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

[1.3 Testing Goals [4](#testing-goals)](#testing-goals)

[1.4 Assumptions [5](#assumptions)](#assumptions)

[2 Test Items [5](#test-items)](#test-items)

[3 Testing Strategy [5](#testing-strategy)](#testing-strategy)

[3.1 Unit Testing [5](#unit-testing)](#unit-testing)

[3.2 Component Testing [5](#component-testing)](#component-testing)

[3.3 System Testing [6](#system-testing)](#system-testing)

[3.4 Release Testing [6](#release-testing)](#release-testing)

[4 Test Environment [6](#test-environment)](#test-environment)

[4.1 Hardware [6](#hardware)](#hardware)

[4.2 Software [6](#software)](#software)

[4.3 Network [6](#network)](#network)

[5 Test Cases [7](#test-cases)](#test-cases)

[5.1 Test Case Format [7](#test-case-format)](#test-case-format)

[5.2 Coverage [7](#coverage)](#coverage)

[6 Test Schedule [8](#test-schedule)](#test-schedule)

[6.1 Timeline [8](#timeline)](#timeline)

[6.2 Milestones [8](#milestones)](#milestones)

[7 Defect Management [8](#defect-management)](#defect-management)

[7.1 Defect Reporting [8](#defect-reporting)](#defect-reporting)

[7.2 Defect Triage [9](#defect-triage)](#defect-triage)

[7.3 Metrics [10](#metrics)](#metrics)

[8 Test Deliverables [10](#test-deliverables)](#test-deliverables)

[9 Risks and Mitigation [11](#risks-and-mitigation)](#risks-and-mitigation)

[10 Appendices [13](#appendices)](#appendices)

**List of Tables**

[Table 5.1: Test Case Format](#TestCaseFormatTable)

[Table 5.2: Coverage](#coverage)

[Table 8.1: Deliverables](#TestDeliverableTable)

[Table 9.1: Risks and Mitigation](#RiskMitigationTable)

# Introduction

## Purpose of the Document

- Define the objectives of the testing process.

- Ensure the system meets functional, non-functional, and user requirements.

This document is mainly intended for developers and quality assurance engineers. It outlines various testing scenarios that developers can use as a reference to implement the code for the program to function and hand off to quality assurance for testing, starting with the minimum functional requirements and later expanding to implementation and testing of additional non-functional requirements.

## Scope

- Identify the system components and features to be tested.

- Highlight what is in scope (e.g., functional testing, performance testing) and out of scope (e.g., future features, integrations not yet implemented).

At the bare minimum, the main components and features that need to be tested are the user login and authentication, event CRUD, joining/passing/waitlist, the swipe feature, the Google Maps API, and ensuring the program runs at optimal performance. In the future, the implementation of recommended events based on user profiles and releasing the app to Apple’s App Store may be considered.

##  Testing Goals

- Verify that the software:

  - Meets the functional requirements defined in the SFDS, with priority given to the authentication, event CRUD, swipe/browse, join and pass, capacity and waitlist behavior

  - Functions correctly under normal conditions are under the edge cases identified during unit and system testing, including full-capacity events, duplicate joins, and invalid form input

  - Restricts access correctly, so only users with a valid university email can authenticate and only organizers can create, edit, and delete events that they own

  - Remains reliable under load, confirmed by the 100 concurrent virtual-user acceptance test (50-user testing may be preliminary only)

  - Performs well enough to feel responsive, including swipe interactions, screen loads, and map loading

  - Degrades gracefully when a dependency like Google Maps API is unavailable, keeping events browsing and participation usable

## Assumptions

- Supported desktop and mobile browsers are available to QA throughout testing

- The backend, database, and seeded test data described in Section 4 are set up and reachable before formal testing begins.

- Developers resolve blocker and critical defects within the current testing cycle, as described in section 7.2, so later phases are not blocked

- University email is available for testing the authentication flow, consistent with the assumption inside of the Project Plan

- The Google Maps API is available for most test cases

- Test accounts (organizer, participant, and unauthorized) and seeded events, including full-capacity and waitlisted events, exist before test case execution begins.

# Test Items

- List the components, modules, or features to be tested:

  - Tinder-style swiping feature on the main page properly accepts/rejects events by the user

  - The database management functions properly to store students’ records and update queries based on user inputs

  - The authentication page properly allows only students using the permitted email address provided by the university and denies all other users with non-educational emails and other university emails

# Testing Strategy 

## Unit Testing

- Verify individual components or modules.

- Tools: unit-test framework compatible with the implemented language (confirm selection before execution)

- Event capacity check – If enough slots are open, ensure that participant is added to event roster. If event is full, ensure that participant is transferred to the waitlist, if enabled.

- Join/pass an event – Ensure that the program correctly responds to user swipe/input

- Waitlist promotion – If a space opens up on the event roster, ensure that the waitlist system correctly promotes users to the event roster on a priority basis.

- Email validation – Use students’ SJSU emails to successfully verify identity

- Date/time formatting – Ensure date is in MM/DD/YYYY format and time is in HH:MM AM/PM format

## Component Testing

- Validate interactions between components.

- Focus on data flow and module dependencies.

- Validate interactions between the Presentation Layer, Application/API services, Data Access Service, persistent Users/Events/Participation data, and external adapters for email/DUO, campus map/navigation, GPS, calendar, and sharing.

## System Testing

- Test the entire system as a whole.

- Ensure it meets functional and non-functional requirements.

- Validate PRD/SAD/SFDS non-functional behavior for performance, privacy, security, reliability, compatibility, usability/accessibility, error handling, and degradation. Load testing must include at least 100 concurrent virtual users and at least 1,000 event records, with at least 95% of API responses within 2 seconds.

- Confirm that all critical MVP workflows pass final smoke testing

## Release Testing

- Validate functionality, performance, and reliability.

- Ensure a system version is stable and ready for external use.

> An artificial load of 100 concurrent users will be used to test the performance of the app, under which the program should run at standard conditions.

# Test Environment

## Hardware

- Describe the hardware required for testing, for example,

  - **Minimal Configuration: a computer or phone with an up-to-date browser and network connectivity.**

  - **Optimal Configuration: a modern desktop browser plus a mobile browser for compatibility checks.**

## Software 

- List the software dependencies, for example,

  - Operating Systems: desktop and mobile systems with supported web browsers

  - Application Framework: browser-based frontend (specific framework pending team confirmation)

  - Programming Language: TypeScript

  - Databases: persistent SQL database (SQLite or PostgreSQL; pending team confirmation)

  - Tools: Git/GitHub, VS Code, ESLint, and Prettier

  - Testing Tools: framework-compatible unit tests, API tests, browser end-to-end tests, and k6 or equivalent load tests

  - External Services/APIs: University authentication, campus map/navigation, device GPS, calendar integration, and sharing services

  - Testing Tools: Framework-compatible unit testing tools and an API/load-testing tool capable of testing 100 concurrent users

## Network

- Use reliable broadband/Wi-Fi/cellular connectivity for normal tests. Exercise device location permission granted and denied. Simulate unavailable email/DUO, map/navigation, calendar, and sharing integrations and confirm controlled errors without corrupting core event/participation data. Separate third-party latency from SpartIN API/database measurements during performance tests.

# Test Cases 

## Test Case Format 

| <span id="TestCaseFormatTable" class="anchor"></span>**Test Case ID** | **Description**           | **Inputs**                                         | **Expected Output**                                                 | **Pass/Fail Criteria**                                                                                               |
|-----------------------------------------------------------------------|---------------------------|----------------------------------------------------|---------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| TC-001                                                                | User Login Validation     | Registered user with valid SJSU email and password | Takes to SJSU login authentication, login successful, session token | Correct credentials lead to successful login and a session token output and reaches the authorized home screen       |
| TC-002                                                                | Data Export Functionality | Query parameters                                   | CSV file generated                                                  | File is downloaded successfully                                                                                      |
| TC-003                                                                | Waitlist Functionality    | Event Accepted                                     | User is added to waitlist and removed if spaces open                | There is no overflow of participants allowed for an event                                                            |
| TC-004                                                                | Event CRUD                | Event details (time, date, location, etc.)         | Published/updated event                                             | A successfully created event is published and/or edited and visible to users when choosing events to participate in. |
|                                                                       |                           |                                                    |                                                                     |                                                                                                                      |

## Coverage 

| **Requirement**                                              | **Test Case Coverage**                                         |
|--------------------------------------------------------------|----------------------------------------------------------------|
| FR-01 / FR-03                                                | TC-004, TC-005, TC-006, TC-007                                 |
| FR-02                                                        | TC-010, TC-011, TC-012, TC-013                                 |
| FR-04                                                        | TC-016, TC-027                                                 |
| FR-05                                                        | TC-018, TC-027                                                 |
| FR-06                                                        | TC-017                                                         |
| FR-07                                                        | TC-008, TC-009                                                 |
| FR-08                                                        | TC-019, TC-027                                                 |
| FR-09                                                        | TC-020                                                         |
| FR-10                                                        | TC-021                                                         |
| NFR-01                                                       | TC-011, TC-026                                                 |
| NFR-02 / NFR-07                                              | TC-001, TC-013, TC-025 (verify complete case list)             |
| NFR-03                                                       | TC-024                                                         |
| NFR-04                                                       | TC-009                                                         |
| NFR-05                                                       | TC-033                                                         |
| NFR-06                                                       | TC-031                                                         |
| SFDS 11 Authentication-User                                  | TC-001 (additional cases to verify)                            |
| SFDS 11 Event Validation / Event Service / Authorization     | TC-010, TC-011, TC-012, TC-013                                 |
| SFDS 11 Participation / Duplicate / Capacity-Waitlist / Pass | TC-005, TC-006, TC-007, TC-008                                 |
| SFDS 11 Recommendation / Integration Adapter                 | TC-020, TC-027                                                 |
| SFDS 6 UI specifications                                     | TC-004, TC-010, TC-014, TC-015, TC-016, TC-017, TC-022, TC-031 |
| SFDS 7 Database design                                       | TC-006, TC-010, TC-023, TC-024, TC-025                         |
| SFDS 9 Error handling/logging                                | TC-011, TC-026, TC-027                                         |
| SFDS 10 Security                                             | TC-002, TC-013, TC-024, TC-028, TC-029, TC-030                 |
| SFDS 8 Development standards                                 | TC-034                                                         |
| SAD/PRD performance & reliability                            | TC-007, TC-027, TC-032, TC-033                                 |

# Test Schedule 

## Timeline 

| **Timeline**        | **Date**                        |
|---------------------|---------------------------------|
| Unit Testing        | Weeks 8–11 (during development) |
| Integration Testing | Weeks 8–11 (during development) |
| System Testing      | Weeks 12–14                     |
| Acceptance Testing  | Weeks 12–14                     |

- Provide a Gantt chart or table showing the testing schedule.

  - Unit Testing: Oct 25 - Nov 1.

  - Integration Testing: Nov 1 – 8.

  - System Testing: Nov 8 - 15.

  - Acceptance Testing: Nov 15 - 22.

## Milestones 

| **Milestone**          | **Description**                         | **Date** |
|------------------------|-----------------------------------------|----------|
| Test Plan Approval     | Testing plan is finalized and approved. | Oct 20   |
| Test Environment Setup | Testing environment is ready.           | Oct 25   |
| Unit Testing Complete  | Unit testing phase is finished.         | Nov 1    |

# Defect Management 

## Defect Reporting

The team designates GitHub Issues as the platform for logging, managing, and tracking all software bugs to remain in the GitHub ecosystem, integrating directly with code commits and pull requests.

- Issue Structure

> Each bug shall receive the following:

- Defect ID: A unique alphanumeric identifier

- Priority Level: A label to instantly communicate how badly a bug is impacting the system and how urgently it needs attention

  - Blocker: Highest severity, indicating the bug causes the system to be completely unusable

  - Critical: A core feature is broken with no workaround, but the rest of the app remains stable and functional

  - Major: A significant feature is behaving incorrectly, but a workaround exists or the core loop still functions

  - Minor: Low-impact bugs that do not affect any system logic

- Description: A descriptive title along with a detailed summary of the failure

- Environment details: Which operating system the bug was encountered on, the device type, and build version

- Reproduction Instructions: Exact step-by-step actions required to consistently reproduce the error

- Expected vs. Actual Results: A comparison of how the system should have behaved versus the actual erroneous behavior observed

## Defect Triage 

To maintain code health and accountability throughout the length of the project, the team shall enforce a structured recurring review cycle.

- Cross-Functional Triage: The PM, QA’s and developers hold a weekly sync to review all newly opened tracking items

- Prioritization & Assignment: During triage, issues are prioritize based on their severity level and specific developers are tasked with specific bug fixes

- Status Lifecycle: Issues move through the following tracking states:

  - Open

  - In Progress

  - Under Review

  - Resolved

## Metrics 

Beyond just logging bugs, quantitative metrics are actively monitored to evaluate system stability and team turnaround

- Total Defects Identified: A cumulative count of defects found across all testing phases

- Defect Density: Bug frequency across specific modules to identify unstable areas

- Bug Turnaround Time: Tracking how long it takes to resolve a ticket

# Test Deliverables 

- **Test Case**: ID, requirement/feature, preconditions, test data, steps, expected result, actual result, pass/fail, tester, date

- **Test Report**: testing cycle/date, build version, tests planned/run/passed/failed/blocked, defects opened/closed, risks, and recommendation

- **Defect Log**: GitHub Issue ID, title, severity, priority, reproduction steps

- **Test Summary Report**: total test results, requirement coverage, unresolved defects, known limitations, and QA recommendation for Alpha Release or Final Delivery

| <span id="TestDeliverableTable" class="anchor"></span>**Deliverable** | **Description**                                                                                                                                                                                                                                          | **Owner**                             | **Evidence**                                                   |
|-----------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------|----------------------------------------------------------------|
| **Test Plan Document** (this document)                                | Testing scope, strategy environment, schedule, defect process, risks, and test deliverables                                                                                                                                                              | QA Team; reviewed by PM and Dev Team  | Course submission and project repository documentation folder  |
| **Test Case Suite**                                                   | Numbered test cases for authentication, event swipe/browse, join/pass, capacity, waitlist, authorization, and integration flows. Each case includes preconditions pre-conditions, steps, test data, expected result, actual result, and pass/fail status | QA team with Dev team input           | Test-case docs or spreadsheet in repository                    |
| **Test data and test accounts**                                       | Seeded events, organizer and participant test accounts, full capacity events, waitlisted users, invalid inputs, and unauthorized-user scenarios                                                                                                          | QA team and dev team                  | Test environment setup documentation and seeded test database  |
| **Test Execution Reports**                                            | Results from each testing cycle: tests run, pass/fail totals, failed test IDs, blocked tests, defects found, and retest results.                                                                                                                         | QA Team                               | Linked to GitHub Issues and included in final QA documentation |
| **Defect Log**                                                        | Records of each defect, including issue ID, description, steps to reproduce, severity, priority, assignee, status, screenshots/logs, and resolution.                                                                                                     | QA Team; assigned to Development Team | GitHub Issues                                                  |
| **Test Summary Report**                                               | Final testing summary showing coverage of MVP requirements, test-pass rate, remaining known limitations, open defects, and QA release recommendation.                                                                                                    | QA Team; approved by PM               | Final submission package                                       |

# Risks and Mitigation

| <span id="RiskMitigationTable" class="anchor"></span>**Risk** | **Likelihood** | **Impact** | **Mitigation Strategy**                                                                                                                                                                                                        |
|---------------------------------------------------------------|----------------|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Delay in test-environment setup**                           | Medium         | High       | Prepare supported browsers, a test backend environment, test accounts, and seeded test data before formal testing begins. Maintain setup instructions so another team member can reproduce the environment.                    |
| **Unstable build during QA testing**                          | High           | High       | Require a smoke test before handing a build to QA. Use feature branches, pull requests, and peer review; pause nonessential merges during formal QA and retain a known stable build for regression testing.                    |
| **Incomplete test coverage of MVP requirements**              | Medium         | High       | Create a requirements-to-test-case traceability checklist. Prioritize authentication, event CRUD, join/pass, capacity, waitlist, and authorization tests before optional features.                                             |
| **Insufficient or inconsistent test data**                    | Medium         | Medium     | Use seeded test data containing valid events, invalid events, full-capacity events, waitlisted users, organizer accounts, participant accounts, and unauthorized accounts. Reset the test data between test cycles.            |
| **Google Maps or external-service failure**                   | Medium         | Medium     | Test map/location failure scenarios separately. If the Maps API is unavailable or exceeds quota, verify that the application can still display a validated text-based event location.                                          |
| **Defects are not fixed before the testing deadline**         | Medium         | High       | Hold regular defect triage meetings, assign each high-priority defect to an owner, and prioritize blocker and critical defects over cosmetic improvements. Defer low-priority items only when documented as known limitations. |
| **Simulator and physical-device differences**                 | Medium         | Medium     | Execute core test cases in supported desktop and mobile browsers. Record the device model and iOS version used for each test cycle.                                                                                            |
| **Automated-test failures or flaky tests**                    | Medium         | Medium     | Run automated tests repeatedly in a controlled environment, isolate unreliable tests, and confirm important failures manually until the automated test is stabilized.                                                          |

# Appendices

| **Term**                         | **Definition**                                                                                                                           |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| **MVP (Minimum Viable Product)** | The smallest complete version of SpartIN that delivers its main value: helping students discover, create, and join events or meetups     |
| **CRUD**                         | Create, Read, Update, and Delete, the four basic operations used to manage event records                                                 |
| **API**                          | Application Programming Interface; the defined way the SpartIN mobile app exchanges requests and data with the backend                   |
| **API Contract**                 | The agreed API endpoints, request fields, response fields, and error behavior used by the frontend and backend                           |
| **Authentication**               | Verification of a user’s identity before allowing access to the application                                                              |
| **Authorization**                | Rules that determine what an authenticated user is allowed to do, such as allowing only an event organizer to edit or delete their event |
| **Capacity Limit**               | The maximum number of participants allowed to join an event                                                                              |
| **Waitlist**                     | An ordered list of users who want to join an event after it has reached its capacity limit                                               |
| **Alpha Release**                | The first end-to-end working version of SpartIN that includes the core MVP features but may still require defect correction              |
| **Regression Testing**           | Re-testing existing functionality after a change or bug fix to verify that previously working features were not broken                   |
| **Test Coverage**                | A measure of how much application code or functionality is exercised by automated tests                                                  |
| **Smoke Test**                   |                                                                                                                                          |

**References:**

> [System Architecture Document](https://sjsu0-my.sharepoint.com/personal/kabir_khan_sjsu_edu/Documents/System%20Architecture%20Design.docx)
>
> [Software Functional Design Specification](../../asfi_khan_sjsu_edu/Documents/cmpe131_0506_SFDS_template-1.docx)
>
> [Project Plan Document](https://sjsu0-my.sharepoint.com/personal/kabir_khan_sjsu_edu/Documents/cmpe131_0506_PP_template-1.docx)

**Review meeting minutes (time, attendees, reviewer/review comments, action items/PICs).**

Time (when): 10:00 - 10:15 am, Sep 29

Attendee (who): Kabir Khan, Brandon Tu, Evan Moreno, Cristhian Galo, Asfi Khan, Alex Sanchez, Sean Luke Holscher

- Database management clearly stores student records and updates queries based on accept/reject of events

- 3.2 Validate Cross component interactions 3.3 Make an account, make an event, join a different event

- Users should be removed from waitlist database and placed in database for that event

<!-- -->

- Create a draft and share with the team, (Cristhian and Sean), Sep 30

- Team does review and makes changes through track changes, everyone, Saturday

- Prepare for presentation meeting minute by creating brief plan to discuss with team, Sep 31, Kabir Khan

# Coordinated Revision Notes — Team Review Draft

Status: Proposed corrections for team review. These notes are not proof of implementation, execution, or team approval.

## Test-plan baseline

The minimum release gate is a browser-based Event CRUD flow connected to a real API and persistent database. Create, read, update, and delete must be exercised with expected results and captured evidence. Any simulated feature must be clearly identified; test results must not be described as passing before execution.

## Traceability correction required

The original example TC-002 is a CSV data-export test but the coverage table also links TC-002 to authentication/security. These are not equivalent. The table references TC-005 through TC-034 even though their full procedures are not included in the four-row example table; link the actual complete test-case suite before claiming coverage. Do not silently relabel historic tests.

## Performance acceptance criteria

For NFR-05, test at least 100 concurrent virtual users against at least 1,000 event records and require at least 95% of measured backend API responses within 2 seconds. A 50-user run may be a preliminary diagnostic but is not the NFR-05 acceptance test. Report test environment, load script, sample size, results, and limitations.

## Testing execution schedule

The course schedules primary implementation in Weeks 8–11 and validation/release in Weeks 12–14. Testing may start sooner during development; the old September/October dates must be replaced by the team’s actual approved calendar schedule.

## Test environment decision

Use supported desktop and mobile browsers for the web application; choose unit/component tooling for the actual frontend/backend languages, API testing, browser end-to-end testing, and load testing. An iOS Simulator and physical iPhone are not prerequisites for the browser-based minimum implementation.

## Open decisions and sign-off

• Confirm the actual implementation stack and database against the repository.

• Verify each simulated, implemented, and deferred feature against working code.

• Review affected PRD/SAD/SFDS/TP cross-references and record the outcome in GitHub meeting minutes.

• Approve any changed requirements, update the version history, and record revisions using Word Track Changes if required for submission.
