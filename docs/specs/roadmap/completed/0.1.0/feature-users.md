# Task: FEATURE: Users

We want to start planning and discussing a new epic feature. Here are my notes. Feel free to ask questions to understand the scope and requirements.

The scope of this feature is to add user management to the app. Here is the description of how we envision the feature: 
- Users need an account with user/password to login. This first user will be the owner of the account and will be marked as admin. There cannot be more than one admin user per account. The admin user can add/remove/edit users and their profiles. 
- We will trust everyone with the user/password to access the app online
- The account can have multiple users, all with their own profile: watch list, tags, priority, etc.
- We should create an .env variable to store the admin user password: user: admin, password: changeme.
- The app should have an onboarding workflow that: 
    - changes the name of the account to something else (eg: "oliver") and changes the password "changeme" to something else. Use password and confirm password fields to validate the password. 
    - after creating the account, it should ask if the user wants to create more users (they can always be added later). the account user should be the first user in the app with its own profile. Ask for an emoji and a color to represent the user avatar
    - for every additional user, it asks for a user profile name and a user password, and an emoji and a color to represent the user avatar. We should create a user profile with all the needed pieces in the database: user, watch list, tags, priority to be differentiated in the database.

- When a user logs in, they must pick a user from a list of users and will access the app with that user profile. It should be nice page with all the profiles (eg: like appletv or disney plus user selection page). You can see the image as example of the appletv app showing all users profiles to selct one at the begginign of every new session.
- [x] Settings should have a section for user management where the admin user can add/remove/edit users and their profiles.
- [x] Add an icon to select current user profile in navigation bar.
- [x] Add user profile editing functionality (icon, color, name, username, password).
- [ ] Should we allow a way for a specific user to save in local storage its user and always use that user profile? In that case we should add a "remember me" checkbox in the login page and when checked, it should save the user in local storage and always use that user profile. If unchecked, it should ask the user to pick a user from a list of users and will access the app with that user profile. However we should add a valid period no greater thatn 15 days for the user to be remembered. 
