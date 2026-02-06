# Admin Dashboard Development Plan

## 1. Goal

To create a functional, secure, and visually appealing web interface for system administrators to manage user verification workflows (Officers and Societies) and gain system insights, leveraging the existing Node.js/Express/MongoDB backend structure.

## 2. Backend Integration (Referencing AGENTS.md)

The dashboard will strictly use the protected Admin endpoints defined in `AGENTS.md` and `api.md`.

-   **Roles:** Authentication will be tied to the **Admin (Role 11)** as defined in `config/roles_list.ts`.
-   **Endpoints:**
    -   Use `POST /admin/login` for authentication.
    -   Utilize all endpoints listed under "Officer Management" and "Society Management" for the core approval workflow.
-   **Data Model:** Display fields will be based on the `IUserDocument` structure in `models/User.ts`.

## 3. Core Feature Breakdown

### A. Authentication Module
-   Login Page: Collects email (or DABS) and password.
-   Session Management: Stores and uses the JWT token for all API calls.
-   Protected Routes: Ensures all core dashboard pages are inaccessible without a valid admin token.

### B. Officer Verification Workflow
-   **Pending List:** Fetch and display data from `GET /admin/pending-officers`.
-   **Detail View:** Display full officer details.
-   **Document Viewer:** Allow download/view of the verification document using `GET /admin/officer-document/:id`.
-   **Actions:** Implement dedicated buttons for:
    -   `PUT /admin/approve-officer/:id` (with confirmation).
    -   `DELETE /admin/reject-officer/:id` (with strong confirmation).

### C. Society Verification Workflow
-   **Pending List:** Fetch and display data from `GET /admin/pending-societies`.
-   **Actions:** Implement dedicated buttons for:
    -   `PUT /admin/approve-society/:id` (with confirmation).
    -   `DELETE /admin/reject-society/:id` (with strong confirmation).
-   **Verified List:** Display all approved societies from `GET /admin/societies`.

## 4. UI/UX Design Philosophy (Referencing AI.md/Modern Standards)

The dashboard will be designed for efficiency and clarity:

-   **Visual Aesthetic:** Adopt a clean, modern design (e.g., using a component library like Tailwind CSS, Material UI, or Chakra UI for rapid prototyping). The look should be professional, with clear hierarchy and minimal clutter.
-   **Data Visualization:** Use tables and lists with clear sorting and filtering options. Status labels (e.g., "Pending," "Verified") will use distinct colors (yellow, green).
-   **Feedback:** Provide immediate and clear toast/notification feedback upon successful actions (Approve, Reject) or errors.
-   **Error Handling:** Implement user-friendly error messages that abstract the backend's generic 500 responses into actionable information where possible.

## 5. Implementation Plan (AI-Driven Iteration)

| ID | Task | Status | Priority |
| :--- | :--- | :--- | :--- |
| **DASH-1** | Setup Basic Frontend Project (e.g., Next.js/React) | pending | high |
| **DASH-2** | Build Admin Login Component and integrate with `POST /admin/login` | pending | high |
| **DASH-3** | Develop Officer Pending List Component (Table + Fetch `pending-officers`) | pending | medium |
| **DASH-4** | Implement Document Download/View Feature (`GET /officer-document/:id`) | pending | high |
| **DASH-5** | Implement Officer Approve/Reject Actions | pending | high |
| **DASH-6** | Develop Society Pending List Component | pending | medium |
| **DASH-7** | Implement Society Approve/Reject Actions | pending | medium |
| **DASH-8** | Implement basic navigation and protected routes | pending | low |
| **DASH-9** | Final polish and responsive design check | pending | low |
