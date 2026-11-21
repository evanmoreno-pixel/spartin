|     |                     |                         |
|-----|---------------------|-------------------------|
|     | **Document Number** | **PPD-CMPE-131 Sec 05** |
|     | **Version**         | **2.0**                 |
|     | **Status**          | **Final**               |
|     | **Created By**      | **Kabir Khan**          |

**SpartIn**

**Project Plan Document**

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

**Deliverable:** Project Plan Document

Each team member must participate in the development of this deliverable. As a team, review and agree on each member's contribution level and complete the table below before submission.

| **Team Member**     | **Contribution Level**                                                                        | **Brief Description of Contribution**                                              |
|---------------------|-----------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------|
| Kabir Khan          | <span class="mark">☐ Full (100%)</span> ☐ Partial (50%) ☐ None (0%)                           | Finished draft sections 1,2,3,4, 5.1, 6.1, 8 and 9                                 |
| Brandon Tu          | <span class="mark">☐ Full (100%)</span> ☐ Partial (50%) ☐ None (0%)                           | Filled out budget Section 5.1, roles 5.2, and Section 5.3, 1.3 constraints for iOS |
| Evan Moreno         | <span class="mark">☐ Full (100%)</span> ☐ Partial (50%) ☐ None (0%)                           | Section Tables, Gantt Chart                                                        |
| Asfi Khan           | <span class="mark">☐ Full (100%)</span> <span class="mark">☐ Partial (50%)</span> ☐ None (0%) | Started 5.2, made minor edits to formatting and Table of Contents/List of Tables   |
| Alex Sanchez        | <span class="mark">☐ Full (100%)</span> ☐ Partial (50%) ☐ None (0%)                           | Sections 6.2 & 7.1                                                                 |
| Cristhian Galo      | <span class="mark">☐ Full (100%)</span> ☐ Partial (50%) ☐ None (0%)                           | Section 7.2                                                                        |
| Sean Luke Holscher  | <span class="mark">☐ Full (100%)</span> ☐ Partial (50%) ☐ None (0%)                           | Worked on sections 3.1 and 8.3 and a review with edit recommendations              |

**Contribution Levels**

**Full Contribution (100%)** – Fully participated and contributed to the deliverable; receives 100% of the team score.  
**Partial Contribution (50%)** – Partially participated or contributed to the deliverable; receives 50% of the team score.  
**No Contribution (0%)** – Did not participate or contribute to the deliverable; receives 0% of the team score.

**Team Confirmation:**  
By submitting this document, the team confirms that the contribution levels reported above have been reviewed and agreed upon by the team members.

**Table of Contents**

[1 Introduction [5](#introduction)](#introduction)

[1.1 Purpose of the Plan [5](#purpose-of-the-plan)](#purpose-of-the-plan)

[1.2 Scope of the Project [6](#scope-of-the-project)](#scope-of-the-project)

[1.3 Assumptions and Constraints [6](#assumptions-and-constraints)](#assumptions-and-constraints)

[2 Project Organization [7](#project-organization)](#project-organization)

[2.1 Roles and Responsibilities [7](#roles-and-responsibilities)](#roles-and-responsibilities)

[2.2 Organizational Structure [7](#organizational-structure)](#organizational-structure)

[3 Risk Management [8](#risk-management)](#risk-management)

[3.1 Risk Identification [8](#risk-identification)](#risk-identification)

[3.2 Risk Analysis [9](#risk-analysis)](#risk-analysis)

[3.3 Contingency Plan [9](#contingency-plan)](#contingency-plan)

[4 Project Schedule [11](#project-schedule)](#project-schedule)

[4.1 Milestones [11](#milestones)](#milestones)

[4.2 Timeline [12](#timeline)](#timeline)

[5 Resource Allocation [12](#resource-allocation)](#resource-allocation)

[5.1 Budget [12](#budget)](#budget)

[5.2 Human Resources [13](#human-resources)](#human-resources)

[5.3 Tools and Technologies [13](#tools-and-technologies)](#tools-and-technologies)

[6 Monitoring and Reporting [13](#monitoring-and-reporting)](#monitoring-and-reporting)

[6.1 Progress Monitoring [13](#progress-monitoring)](#progress-monitoring)

[6.2 Reporting [15](#reporting)](#reporting)

[7 Quality Management [15](#quality-management)](#quality-management)

[7.1 Quality Standards [15](#quality-standards)](#quality-standards)

[7.2 Testing Plan [16](#testing-plan)](#testing-plan)

[8 Project Closure [17](#project-closure)](#project-closure)

[8.1 Deliverables [17](#deliverables)](#deliverables)

[8.2 Review [17](#review)](#review)

[8.3 Post-Project Activities [18](#post-project-activities)](#post-project-activities)

[9 Appendices [18](#appendices)](#appendices)

**List of Tables**

Table 1.1: Project Scope

Table 1.2: Assumptions and Constraints

Table 2.1: Roles and Responsibilities

Table 3.1: Risk Analysis

Table 3.2: Contingency Plan

Table 4.1: Milestones

Table 5.1: Budget

Table 5.2: Human Resources

[Table 6.1: Progress Monitoring](#Table61)

# Introduction

## Purpose of the Plan

- Outline the objectives of the project and the purpose of this document.

- State how the project aligns with the organization’s goals

The studentfocused SpartIn app aims to solve the important issues that many transfer students face their universities where they struggle to find people early, navigate through the large campuses and opportunities, and miss out on important networking opportunities. The objective of the project to allow users to create, join, browse through small events and meetups to find a community when they transfer schools. The purpose of this document is to set clear milestones developing features for the browser-based web application, identifying each team member responsibilities, and potential risks to consider during the development.-at,are and tofor's

SpartIn will meet the organization's goals by delivering crucial features such as authentication, event creation/deletion, browse/filters/waitlists/join/pass, participation records, and maps for navigation.

## Scope of the Project

- Describe the boundaries of the project (what is included and excluded).

- Define the expected outcomes or deliverables.

| **In scope**                                              | **Out of scope / future consideration**                               |
|-----------------------------------------------------------|-----------------------------------------------------------------------|
| Account/session management                                | Full social-media feed                                                |
| Meetup CRUD and validation                                | Paid ticketing/payments                                               |
| Browse/filter and swipe interaction                       | Native release to the App Store                                       |
| Join, capacity, waitlist logic                            | Advanced recommendation/AI matching                                   |
| Using google maps for free session requests and API calls | Broad university-wide event management                                |
| Working database for student information, event records   | Advanced session requests for google maps that require mass API calls |

## Assumptions and Constraints

- Assumptions: List any project-specific assumptions (e.g., resource availability, technology readiness).

- Constraints: Highlight restrictions (e.g., budget, deadlines, tools).

| **Assumptions**                                                                                       | **Constraints**                                                       |
|-------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------|
| Students will provide accurate meetup details and availability                                        | Limited semester timeline and team availability                       |
| Students will verify their university email address to prevent outsiders and maintain privacy         | Platform/API access or map-service limitations                        |
| Users consent to share real time location when using the app for accurate google maps synchronization | Must choose and document one database approach before design freeze   |
| Users have a current desktop or mobile browser with network access                                    | App Store distribution is out of scope for the course web application |

# Project Organization

## Roles and Responsibilities

| **Role**                  | **Name/Department**                | **Responsibilities**                                                                                    |
|---------------------------|------------------------------------|---------------------------------------------------------------------------------------------------------|
| Project Manager           | Kabir Khan                         | Schedule, scope decisions, meetings, risk tracking, final integration/status reporting                  |
| Product Marketing Manager | Brandon Tu                         | User needs, feature priorities, usability feedback, presentation/user-facing messaging                  |
| System Architect          | Evan Moreno                        | Architecture, API/data design decisions, integration standards                                          |
| Software Developer        | Asfi Khan, Alex Sanchez            | Feature implementation, pull requests, code review participation, active communication with QA          |
| QA Engineer               | Cristhian Galo, Sean Luke Holscher | Test cases, defect tracking, regression testing, acceptance verification, active communication with Dev |

## Organizational Structure

Figure 2.2: Hierarchy of Team Roles

**Kabir Khan — Project Manager**

- Coordinates project scope, schedule, risk management, and communication among team members

**Brandon Tu — Product Marketing Manager**

- Represents user needs and supports feature prioritization.

**Evan Moreno — System Architect**

- Guides technical and architectural decisions

**Asfi Khan and Alex Sanchez — Development Team**

- Implement approved system features

**Cristhian Galo and Sean Luke Holscher — Quality Assurance Team**

- Develop test cases, verify system functionality, and report defects for resolution.

# Risk Management

## Risk Identification

**Technical Risks**: New technology adoption, system integration issues.

- **Database**: A delayed database decision or an unclear data model could delay implementation of user accounts, meetups, participation records, and waitlists.

- **Frontend to Backend integration**: Inconsistent API endpoints, data formats, or validation rules could prevent the mobile interface from correctly creating, displaying, or updating meetup data.

- **Authentication and authorization**: Incorrect session handling or insufficient authorization checks could allow users to access protected features or modify meetups they do not own.

- **Capacity and waitlist logic**: Errors in participant counting, duplicate joins, or waitlist promotion could cause inaccurate meetup availability.

- **Third-party services**: If SpartIN includes map/location functionality, API access, quota limits, or configuration issues could affect that feature.

**Business Risks**: Budget overruns, evolving customer requirements.

- **Scope creep**: Adding features beyond the agreed MVP could reduce the time available to complete and test essential functionality.

- **Schedule delays**: Dependencies between architecture, API development, UI implementation, and testing may delay later milestones when an earlier task slips.

- **Team availability**: Conflicting academic, work, or personal commitments may leave important tasks blocked or unevenly distributed.

- **Integration conflicts**: Parallel development can create merge conflicts or incompatible changes if the team does not use shared branch, review, and API practices.

**Project Risks**: Resource unavailability, timeline delays.

- **Limited user feedback**: Without early feedback from intended transfer and commuter students, the team may build an interface or workflow that is confusing or does not address the intended need.

- **Changing requirements**: Feedback from the instructor, stakeholders, or team may require changes to the MVP after implementation has started.

## Risk Analysis

| **Risk**                             | **Likelihood** | **Impact** | **Early warning sign**                          | **Mitigation Strategy**                                                   |
|--------------------------------------|----------------|------------|-------------------------------------------------|---------------------------------------------------------------------------|
| Database choice/integration delays   | Medium         | High       | Schema/API work not started by design freeze    | Select database by a fixed date; prototype one end-to-end data flow early |
| Scope creep                          | High           | High       | New features added mid-sprint                   | Maintain prioritized MVP backlog and change log                           |
| Merge conflicts/integration failures | Medium         | Medium     | Long-lived branches or incompatible API changes | Small PRs, shared API contract, frequent integration                      |
| Capacity/waitlist logic defects      | Medium         | High       | Duplicate joins or inaccurate attendee counts   | Define edge cases and test them before UI completion                      |
| Limited user testing                 | Medium         | Medium     | No feedback before final QA                     | Schedule usability tests early                                            |
| Third-party map/API issue            | Medium         | Medium     | API key/quota or integration failures           | Isolate map feature behind a module                                       |
| Team availability                    | Medium         | High       | Assigned tasks remain blocked                   | Weekly workload check and task backup ownership                           |
| Authentication/security mistake      | Low/Medium     | High       | Session or authorization test fails             | Validate protected routes and account flows                               |

## Contingency Plan

If the team faces significant risks, the Project Manager will document the issue, assess its effect on scope and schedule, assign an owner, and communicate the decision to the team. The team will prioritize completion and verification of core MVP functionality over optional enhancements.

| **Risk Trigger**                                                         | **Contingency Action**                                                                                                                                                   | **Owner**                                      | **Decision / Outcome**                                                       |
|--------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------|------------------------------------------------------------------------------|
| Database choice or integration is not complete by system design freeze   | Freeze the database decision, implement the minimum data model required for users, meetups, participation records, and waitlists, and defer nonessential data features   | System Architect and Development Team          | Preserve the core meetup workflow even if optional features are delayed      |
| A new feature is requested after MVP scope is approved                   | Record the request in the backlog, assess effort and impact, and defer it unless it is required for a core acceptance criterion                                          | Project Manager with Product Marketing Manager | Prevent scope creep and protect testing time                                 |
| Merge conflicts or incompatible API changes block integration            | Pause new feature merges, resolve the API contract and conflicts, test the affected flow, then resume development using reviewed pull requests                           | System Architect and Development Team          | Restore a stable shared codebase before additional work continues            |
| Duplicate joins, incorrect capacity counts, or waitlist errors are found | Disable or limit the affected workflow in the demo build, correct the business logic, add regression tests for the failed edge case, and retest before re-enabling it.   | Development Team and QA Team                   | Ensure inaccurate participant data is not presented as working functionality |
| Usability feedback is not obtained before final QA                       | Conduct structured internal usability testing using predefined student scenarios and document findings, limitations, and resulting fixes                                 | Product Marketing Manager and QA Team          | Obtain evidence feedback before final delivery                               |
| Map/location API fails, exceeds quota, or cannot be configured           | Disable the map display and retain meetup location as validated text, such as a campus location or meeting address                                                       | System Architect and Development Team          | Keep meetup discovery usable without relying on the external map feature     |
| A team member is unavailable and a critical task is blocked              | Reassign the task to a backup team member, reduce nonessential scope if necessary, and update the schedule and project board                                             | Project Manager                                | Keep critical-path work moving                                               |
| Authentication or authorization testing fails                            | Restrict the affected feature from release, fix the access-control issue, perform security-focused regression tests, and obtain QA approval before reopening the feature | Development Team and QA Team                   | Do not deliver known insecure account or protected-route behavior            |

# Project Schedule

## Milestones

| Milestone            | Description                                                                           | Due Date |
|----------------------|---------------------------------------------------------------------------------------|----------|
| Specification Review | Stakeholder approval of system requirements. Giving presentations and taking feedback | 10/18    |
| System Design Freeze | Final approval of system design.                                                      | 10/20    |
| Code Review          | Code review and unit test report.                                                     | 11/01    |
| Testing hand-off     | Engineering release testing.                                                          | 11/08    |
| Alpha Release        | First working version of the software.                                                | 11/15    |
| Final Delivery       | Deployment of the completed system.                                                   | 12/06    |

## Timeline

<img src="./media/image2.jpeg" style="width:6.5in;height:2.725in" />

Figure 4.2: SpartIN Project Schedule Gantt Chart

# Resource Allocation

## Budget

| Category    | Description                                 | Cost                                                   |
|-------------|---------------------------------------------|--------------------------------------------------------|
| Development | Developer salaries, tools, licenses.        | 3 Weeks to develop                                     |
| QA/Testing  | Testing resources, tools, and environments. | 2 Weeks to test                                        |
| Deployment  | Hosting, deployment tools, and training.    | 2 Weeks for Alpha release and 2 more for Final release |

## Human Resources

List team members and their roles.

| **Team Member**    | **Title**                  | **Roles**                                                                                               |
|--------------------|----------------------------|---------------------------------------------------------------------------------------------------------|
| Kabir Khan         | Project Manager            | Planning, scheduling, tracking progress and deadlines, assigning tasks on scrum backlog                 |
| Brandon Tu         | Project Marketing Manager  | Marketing research and strategy, product messaging and branding,                                        |
| Evan Moreno        | System Architect           | Defines system architecture, set technical standards, overseeing integrations of code into architecture |
| Asfi Khan          | Developer                  | Implement features, write code, fix code and code review                                                |
| Alex Sanchez       | Developer                  | Implement features, write code, fix code and code review                                                |
| Cristhian Galo     | Quality Assurance Engineer | Test plans, functional testing, fix verification, document bugs                                         |
| Sean Luke Holscher | Quality Assurance Engineer | Test plans, functional testing, fix verification, document bugs                                         |

## Tools and Technologies

- 

- Development tools: VS Code, browser-based web frontend, backend API, persistent SQL database (specific engine pending team decision), GitHubisual tudio C

- Testing tools: framework-compatible unit tests, API tests, browser end-to-end tests, and load tests (tools pending team decision)

- Deployment tools: Docker, GitHub Actions

# Monitoring and Reporting

## Progress Monitoring

Define how progress will be tracked (e.g., daily stand-ups, weekly status reports).

- Weekly meeting minutes in class discussed by PM and report tasks planner/completed

- Weekly stand-ups on decided day (most likely Friday) where each team member reports the tasks they finished, questions or roadblock, and brief plan on finishing the task

- GitHub Project board as the source of truth for task status

- Pull requests and issue tracker for code/defect visibility

**Draft of Github Backlog for Upcoming Tasks:**

<img src="./media/image3.png" style="width:5.70833in;height:2.63008in" />

Figure 6.1: GitHub backlog draft of upcoming project tasks

- Include performance metrics (e.g., tasks completed vs. planned).

| <span id="Table61" class="anchor"></span>**Metric** | **How It Is Measured**                                                  | **Target**                                                                 | **Source / Review Owner**                                  |
|-----------------------------------------------------|-------------------------------------------------------------------------|----------------------------------------------------------------------------|------------------------------------------------------------|
| **Sprint Completion Rate**                          | Completed planned tasks (divided by) total planned tasks for the sprint | At least 80% of planned tasks completed                                    | GitHub Project Board; reviewed weekly by PM                |
| **Milestone Status**                                | Compare planned milestone date with actual completion date              | No missed milestone without a documented update                            | GitHub Roadmap; reviewed by PM                             |
| **Blocked Task Age**                                | Number of days a task remains blocked                                   | No critical task blocked for more than 3 days without escalation           | GitHub Issues/Project Board; reviewed during stand-up      |
| **Pull Request Review Time**                        | Time from pull request creation to peer review                          | Review within 2 days when possible                                         | GitHub Pull Requests; reviewed by Development Team         |
| **Test Pass Rate**                                  | Passed test cases ÷ executed test cases                                 | 100% of required critical-path tests pass before final delivery            | QA test results; reviewed by QA Team                       |
| **Critical Defects**                                | Number of open blocker or critical defects                              | Zero open blocker/critical defects before Alpha Release and Final Delivery | GitHub Issues; reviewed by QA and PM                       |
| **Core Logic Test Coverage**                        | Percentage of critical business-logic code exercised by automated tests | At least 80% coverage for core logic                                       | Test coverage report; reviewed by Development and QA Teams |

## Reporting

To keep stakeholders, professors, and team members aligned on project health, timeline progression, and resource management, the team implements the following reporting structure:

- Types of reports:

  - Weekly Progress Reports: Track completed backlog items, active tasks, and current sprint velocity using the GitHub Project Board.

  - Milestone and Deliverable Updates: Summarize system design, alpha builds, and test results for stakeholder and instructor reviews.

  - Budget and Resource Tracking: Review tool utilization, developer hours, and any project resource constraints on a weekly basis.

- Reporting responsibilities:

  - Generation: The PM compiles weekly progress reports. The QA engineers contribute to defect and testing metrics, while developers provide task-completion statuses.

  - Review: Reports are reviewed collaboratively, and formal milestone reports are reviewed and approved by the course instructor/stakeholder.

# Quality Management

## Quality Standards

To ensure the SpartIN web application is maintainable and provides a reliable user experience for transfer and commuter students, the following quality goals shall be established:

- Code Quality and Style

  - All source code written for the web application must adhere to strict project linting rules (ESLint and Prettier) to maintain consistent formatting and catch syntax errors early

- Team Reviews

  - At least one peer code review for every code change, followed by a verification pass by the Quality Assurance team before completely merging the code

- Test coverage goals

  - Target a minimum of 80% test coverage for core logic, focusing on meetup capacity limits, waitlist promotion algorithms, authentication/session validation, and other critical path modules

- Defect resolution standard

  - No critical or blocker bugs will be permitted in the Alpha Release and Final Delivery builds. All major defects identified by the QA team must be logged on GitHub Issues and resolved prior to testing hand-off

- Performance Benchmarks

  - The swipe interaction, map/location loading, and other UI transitions must maintain smooth frame rates, and local database queries must execute within an appropriate amount of latency to feel fast and responsive.

## Testing Plan

- **Tools/Environment**

  - Test Target

    - Desktop and mobile browsers with a reproducible backend test environment

    - Assume users have access to a modern supported web browser

  - Unit and Component Testing

    - Jest with React Native Testing Library

  - End-to-end Test

    - Browser end-to-end automation and manual browser checks (tool pending confirmation)

  - Consistent Setup

    - Docker for the backend and a seeded test database that resets before each run

- **Types of Testing**

  - Unit **(Dev Team)**

    - Capacity checks, join and pass logic, waitlist promotion, email validation, date and time formatting

      - 80% line coverage on business logic files. At least 40 unit tests. Every waitlist and capacity function has at least one edge case test. The full site should run in under 60 seconds

  - Component **(Dev Team and QA)**

    - Login, Home swipe card, Calendar, Create Event form, Account page

      - At least 3 tests per screen covering normal use, empty state and invalid input

  - Integration **(Dev Team and QA)**

    - Frontend to backend calls and database reads and writes

      - Every API endpoint has at least one success test and one failure test. Database queries return in under 200 ms with 500 seeded events

  - End to end **(QA)**

    - Sign in, swipe and join, swipe and pass, join a waitlist, create an event, delete an event

      - Automated browser end-to-end coverage of the implemented Event CRUD flow; capture results after execution

  - Security **(QA Team)**

    - Protected routes and organizer-only actions

      - 100% of protected routes tested with no token, an expired token, and a participant account. Every test must be rejected.

  - Performance **(Dev Team and QA)**

    - Swipe animation, screen loads, map loading

      - Swipe animation stays near 60 fps and never drops below 45 fps. Home and calendar load in under 2 seconds. Map loads in under 3 seconds.

# Project Closure

## Deliverables

- List final deliverables to be handed over to stakeholders (e.g., software, documentation).

- SpartIn app that is fully functional and meets core deliverables: swipe feature, can create/delete events, can join or pass events, working database which registers when a user accepts an event and gets details about meeting location

- Architecture design, data, API, documentation

- Test plans by QA with results and possible limitations

- Project board to describe Agile project management with proofs of completed backlogs

## Review

Describe how project success will be evaluated (e.g., stakeholder satisfaction surveys)

- Group will give a presentation that will be evaluated by the class

- Stakeholder/professor and rubric requirements are satisfied

- Tests and code review evidence are complete

- Required MVP shows project flow end-to-end

## Post-Project Activities

- Handover plan for sustaining/maintenance and support.

- Lessons learned and retrospective documentation.

- Celebrate project success to boost team morale.

# Appendices

**Detailed Schedule**: A complete breakdown of tasks, subtasks, and timelines.

- PPD Completion --- Sep 27

  - Team finishes their assigned sections, finishes review and track changes before making final submission

  - The project manager confirms task owners, target dates to meet, identifies clear dependencies for each task, and refines issues on Github

- System Design Freeze --- Oct. 19 to 20

  - The System Architect and Development Team finalize the database approach, data model, API contract, authentication approach, and core event/waitlist rules

  - Major architecture changes are avoided after this milestone unless formally approved

- Peer Code Review and Unit Testing --- Nov. 1

  - Team members review core feature implementations and resolve major code-review findings

  - Developers run unit tests for critical logic, including capacity validation, duplicate joins, waitlist promotion, and authorization

- Alpha Release Preparation --- Nov. 9 to Nov. 15

  - The Alpha Release demonstrates that users can sign in, browse or create events, join or pass events, and receive correct capacity/waitlist behavior

- QA, defect resolution, and regression testing --- Nov. 16 to Dec. 1

  - QA logs defects in GitHub Issues; the Development Team corrects priority defects

  - QA reruns affected tests to ensure fixes did not break existing features

- Final Delivery --- Dec. 6

  - The team submits the final SpartIn app documentation, completed presentation slides, rehearses the night before the presentation day, and ensures the app has been tested through demo videos

- **Glossary**: Definitions of technical terms used in the project plan.

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
| **Scope Creep**                  | Uncontrolled addition of new features or requirements after the team has agreed on the MVP scope                                         |

- **Review meeting minutes**: time, attendees, reviewer/review comments, action items/PICs.

Time (when): 10:00 - 10:15 am., 9/22/26

Attendee (who): Kabir Khan, Brandon Tu, Evan Moreno, Cristhian Galo, Asfi Khan, Alex Sanchez, Sean Luke Holscher

- Check up on progress and resources/help the developers need for the drafting process of SFDS, Sep 18, (Kabir Khan)

- After the quiz on Thursday, discuss early review deadlines, Sep 24 (Kabir Khan)

- Explore representing a detailed plan on different forms of Gantt Charts and choose one that's simple and clear, Sep 23-24 (Kabir Khan)

- Create and share docx file of project plan specification, Sep 22 (Kabir Khan)

# Coordinated Revision Notes — Team Review Draft

Status: Proposed corrections for team review. These notes are not proof of implementation, execution, or team approval.

## Course schedule alignment

Weeks 1–7: specification and Agile planning. Weeks 8–11: iterative implementation of a representative end-to-end Event CRUD flow. Weeks 12–14: validation, release preparation, and sprint review. The original course outline does not define separate Week 15 milestones. Actual calendar dates and progress must be confirmed by the team.

## Delivery baseline and scope boundary

The course requires a web application with backend insert/update/delete and at least one core UI → API → data flow. The proposed delivery baseline is a responsive SpartIN web application implementing Event CRUD. Native iOS release, Apple App Store publishing, Duo SSO, maps, recommendations, calendar, and other integrations are not assumed implemented unless confirmed; simulated features must be labeled Simulated.

## Open architecture decisions

Decision required from PM + Architect + DEV: select and record the backend framework, database (currently conflicting SQLite/PostgreSQL mentions), and browser test strategy. Until decided, technology names in older sections are historical proposals rather than an approved stack.

## Team review requirement

Every specification owner should circulate a draft, PM should record review minutes with reviewers, comments, action owners and due dates, and the owner should revise with Word Track Changes. The team should sign off on contributions without pre-filling unverified contribution levels.

## Open decisions and sign-off

• Confirm the actual implementation stack and database against the repository.

• Verify each simulated, implemented, and deferred feature against working code.

• Review affected PRD/SAD/SFDS/TP cross-references and record the outcome in GitHub meeting minutes.

• Approve any changed requirements, update the version history, and record revisions using Word Track Changes if required for submission.
