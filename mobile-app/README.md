# StudySwap Mobile

Simple Android app for:
- login
- view purchased notes
- open notes quickly

## Screens

1. Login
2. My Notes
3. Reader

## Setup

1. Open `mobile-app`
2. Install packages
   `npm install`
3. Update `src/config.js`
   - keep `10.0.2.2` for Android emulator
   - use your computer LAN IP for a real phone
4. Start Expo
   `npm start`

## Important

- backend server must be running
- mobile app uses your existing backend login and orders APIs
- reader opens the secure notes flow using the existing website viewer path
