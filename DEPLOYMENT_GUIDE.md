# Premium URL Shortener - Deployment & Setup Guide

## Step 1: Run the Database SQL
To set up your database tables, follow these steps:
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project and click on the **SQL Editor** in the left sidebar (looks like a `>_` icon).
3. Click **"New query"**.
4. Open the file `/Users/harish/Downloads/Programming/premium-url-shortener/supabase_schema.sql` in VS Code or any editor.
5. **Copy the entire content** and paste it into the Supabase SQL Editor.
6. Click **Run**. You should see "Success" and your tables (`urls` and `analytics`) will be created.

## Step 2: Configure Environment Variables
I have already created a blank `.env` file for you in the project root. Now you need to add your keys:
1. In your Supabase Dashboard, go to **Project Settings** (gear icon) -> **API**.
2. Find your **Project URL** and your **anon public API key**.
3. Open `/Users/harish/Downloads/Programming/premium-url-shortener/.env` in VS Code.
4. Paste your keys like this (replace with your actual values):
   ```text
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```
5. **Save the file.**

## Step 3: Run the Project Locally
Now you are ready to see it live!
1. Open your terminal.
2. Navigate to the project folder:
   ```bash
   cd /Users/harish/Downloads/Programming/premium-url-shortener
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Look for the local URL (usually `http://localhost:5173`) in the terminal and cmd+click it to open the app!

## Step 4: Sync with Antigravity
Since the project is in your main `Programming` folder, you can simply open it in your **Antigravity** app or VS Code. Everything you do there will sync, and you can use Antigravity to help you write more features!

---
*Built by Team Harish - 2026.03.07*
