# EasyLoans

This is a project for loans management and visualizations.

## Previous Requirements

Make sure you have installed [Node.js](https://nodejs.org/) in your machine.  
> [!TIP]
> I recommend using pnpm as your package manager for a better performance and security. (We all ready know what is happening in npm 🤫)

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/Stevencedor/EasyLoans.git   
   ```

2. Navigate to the project directory:

   ```
   cd easyLoans
   ```

3. Install dependencies:

   ```
   pnpm install
   ```

4. Configure the environment variables:

   ```
   cp .env.example .env
   ```

   Edit the `.env` file and add your Supabase credentials.

5. Create a database in Supabase and import the schema from `schema.sql`.

> [!IMPORTANT]
> You must create the Admin user in Supabase. And only the Admin can create other users. It is not allowed to create an Admin user from the application. Also, users can not create other users.

## Execution

To start the application in development mode, run:

```
pnpm run dev
```
This will start the development server and open the application in your browser at `http://localhost:3005` (or the port you have configured in `package.json`).


## Project Structure

The project has been refactored to follow a more scalable and maintainable architecture:

- `src/main.jsx`: Application entry point.
- `src/App.jsx`: Root component that handles routing and context injection.
- `src/context/`: Contains global state management.
    - `AuthContext.jsx`: Manages user authentication and session (Login/Logout).
- `src/services/`: Business logic layer and communication with Supabase.
    - `loanService.js`: Logic for retrieving, creating, and modifying loans.
    - `userService.js`: User management.
    - `paymentService.js`: Payment processing.
- `src/pages/`: Main views of the application.
    - `Home.jsx`: Login page.
    - `LoansDashboard.jsx`: Dashboard for regular users.
    - `LoansDashboardAdmin.jsx`: Admin dashboard.
- `src/hooks/`: Directory for Custom Hooks (currently reserved for future reusable logic).
- `src/utils/`: Pure utility functions (e.g. `dateUtils.js`).
- `src/components/`: Reusable UI components.
- `src/styles/`: Global and module CSS files.

## Architecture

The application uses **React + Vite** and connects to **Supabase** as backend.

1.  **Context API**: Utilizes `AuthContext` to wrap the application and provide the user state (`user`, `isAdmin`) to any component that needs it.
2.  **Services Pattern**: Visual components do not make direct database calls. Instead, they delegate this responsibility to services in `src/services`, keeping the UI clean.
3.  **Role-Based Access**: Navigation and displayed data are conditioned by the user role (Admin vs User), validated through the `AuthContext`.

## Business Rules

### The application consists of 3 tables:
   
`users`: In this table only the Admin can register other users who will be able to obtain loans and view the status of their loans.

`loans`: Main table of loans.

`payments`: Payment records made to loans.

### Admin Functions
1. Admin will see all active loans of all users. With the option to view inactive loans through a button.
2. Admin can add new users, loans and payments (partial or total).
3. Admin can change the default interest rate.
4. The interest applies per month, the first month starts running from the loan creation date `created_at` until the current date.
5. Month increase by the next day after the next month. 
>E.g. if the loan is created on **2025-01-01**, it is the 1st month: from **2025-01-01** till **202-02-01**.  
By **2025-02-02** will be the 2nd month till **2025-03-01**.
6. Partial payments can be made and these will be counted in the total payments and subtracted from the final debt.
7. The loan will change from *active* to *paid* when the total payment amount equals the final debt.
8. If the loan is paid (inactive), the months until the last payment date are calculated.

### User Functions
1. User will only see loans that correspond to their id and are active.
2. User can view paid loans through a button.
3. User must change his password when he logs in for the first time.

## Features in progress

* The user will be able to create loan requests (it requires email sending for this feature)
* The administrator will approve or reject loan requests (it requires payment gateway and email sending for this feature)

## Contributions

Contributions are welcome. If you want to contribute, please open an issue or send a pull request.

## License

This project is under the MIT License.