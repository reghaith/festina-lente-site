# EarnFlow - Reward Platform (Next.js)

This is the EarnFlow platform, rebuilt from the ground up using Next.js, designed for high performance, scalability, and easy deployment to platforms like Netlify.

## Project Overview

EarnFlow is a reward-based platform where users can earn points by watching ads and completing surveys, and then withdraw those points for real rewards. This project implements the full frontend and backend infrastructure for this system.

## Technology Stack

*   **Frontend & Backend Framework:** Next.js (React, TypeScript)
*   **Styling:** Custom CSS (ported from original design)
*   **Database:** PostgreSQL (managed with Prisma)
*   **ORM:** Prisma
*   **Authentication:** Auth.js (formerly NextAuth.js)
*   **Deployment:** Netlify (or Vercel)

## Features Implemented

*   **User Authentication:** Secure registration and login with email/password.
*   **Points & Wallet System:** Users have a points balance, and all transactions are logged.
*   **Ad Network Integration:**
    *   Lootably Offerwall (iframe)
    *   CPX Research Survey Wall (iframe)
    *   Secure postback endpoints for both networks to automatically award points.
*   **Withdrawal System:**
    *   Users can request withdrawals of their points.
    *   Admin approval is required for all payouts.
    *   Points are deducted upon request, and refunded if rejected.
*   **Admin Panel:** A dedicated section for administrators to:
    *   Manage users (view details, ban/unban, whitelist).
    *   Review and process withdrawal requests.
    *   Monitor fraud flags and logs in the Fraud Center.
    *   Configure security settings (IP API key, earning limits, withdrawal rules).
*   **Anti-Fraud & Abuse Protection:**
    *   VPN/Proxy detection (conceptual IP intelligence API integration).
    *   Device fingerprinting to detect multi-accounting.
    *   Earning limits (max points/day, max offers/hour).
    *   Withdrawal risk checks (account age).
    *   Role-Based Access Control (RBAC) for admin pages.

## Local Development Setup

1.  **Clone the repository:**
    ```bash
    git clone [YOUR_REPO_URL] earnflow-nextjs
    cd earnflow-nextjs
    ```
    *(Note: Since this is a local project, you'd typically initialize a Git repo and push it to GitHub/GitLab/etc. first.)*

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root of the project and fill in the following:
    ```
    DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
    AUTH_SECRET="YOUR_VERY_LONG_RANDOM_SECRET_STRING_HERE"
    NEXTAUTH_URL="http://localhost:3000"

    # Ad Network Configurations
    LOOTABLY_OFFERWALL_URL="https://example.lootably.com/offerwall" # Replace with your actual Lootably URL
    LOOTABLY_POSTBACK_SECRET="YOUR_LOOTABLY_POSTBACK_SECRET" # Replace with your actual Lootably Postback Secret

    CPX_RESEARCH_APP_ID="YOUR_CPX_RESEARCH_APP_ID" # Replace with your actual CPX Research App ID
    CPX_RESEARCH_SECURE_HASH="YOUR_CPX_RESEARCH_SECURE_HASH" # Replace with your actual CPX Research Secure Hash

    # Security Settings (for initial setup, these will be managed in admin panel later)
    IP_API_KEY="" # Your IP intelligence API key (e.g., from AbstractAPI, IPinfo)
    MAX_EARNINGS_PER_DAY="50000"
    MAX_OFFERS_PER_HOUR="10"
    MIN_ACCOUNT_AGE_WITHDRAW="7"
    ```
    *   **`DATABASE_URL`**: Obtain this from your PostgreSQL provider (e.g., Neon, Supabase, Render).
    *   **`AUTH_SECRET`**: Generate a strong, random string (e.g., using `openssl rand -base64 32`).
    *   **`NEXTAUTH_URL`**: For local development, `http://localhost:3000` is fine. For deployment, change this to your site's URL.

4.  **Set up the Database:**
    *   Ensure your PostgreSQL database is running and accessible via the `DATABASE_URL`.
    *   Apply the Prisma schema to your database:
        ```bash
        npx prisma db push
        ```
        *(Note: `db push` is good for development. For production, `npx prisma migrate deploy` is preferred after running `npx prisma migrate dev` locally.)*

5.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    Open `http://localhost:3000` in your browser.

## Deployment to Netlify

1.  **Connect to Netlify:**
    *   Log in to your Netlify account.
    *   Click "Add new site" -> "Import an existing project".
    *   Connect your Git provider (GitHub, GitLab, Bitbucket) where your project is hosted.
    *   Select your `earnflow-nextjs` repository.

2.  **Configure Build Settings:**
    *   **Base directory:** (Leave blank if your project is in the root of the repo)
    *   **Build command:** `npm run build`
    *   **Publish directory:** `.next`

3.  **Add Environment Variables:**
    *   In Netlify, go to `Site settings` -> `Build & deploy` -> `Environment variables`.
    *   Add all the variables from your local `.env` file (e.g., `DATABASE_URL`, `AUTH_SECRET`, `LOOTABLY_POSTBACK_SECRET`, etc.).
    *   Ensure `NEXTAUTH_URL` is set to your Netlify site's URL (e.g., `https://your-site-name.netlify.app`).

4.  **Deploy:** Netlify will automatically build and deploy your Next.js application.

## Admin Access

To make a user an administrator:
1.  Register a new user through the application's `/register` page.
2.  Access your database (e.g., using a GUI tool like DBeaver or TablePlus, or a CLI tool).
3.  Find the `wp_users_placeholder` table.
4.  Locate your registered user and manually change their `role` field from `"user"` to `"admin"`.

## Future Enhancements

*   **Real IP Intelligence:** Integrate with a live IP intelligence API (e.g., AbstractAPI, IPinfo) for more accurate VPN/proxy detection.
*   **Advanced Fraud Checks:** Implement more sophisticated earning velocity checks, behavioral analysis, and automated flagging.
*   **Payment Gateway Integration:** Integrate with a payment gateway (e.g., PayPal API, Stripe) for automated payout processing.
*   **Admin UI for Settings:** Build a proper admin UI to manage security settings (IP API key, limits) from within the application, rather than relying solely on environment variables.
*   **User Profile Page:** Allow users to update their payment methods and personal information.
*   **Error Handling & Logging:** More robust error handling and server-side logging.