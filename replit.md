# Sorteio - Digital Raffle App

## Overview
A digital raffle/lottery application built with Expo React Native and Express.js backend. The app allows users to perform fair, transparent, and intuitive raffles with beautiful animations and a polished user experience.

## Current State
**Version**: 1.0.0  
**Status**: MVP Complete  
**Last Updated**: January 2026

## Features

### Core Functionality
- **List Mode Raffle**: Enter names, numbers, or words to raffle from a list
- **Number Range Mode**: Define min/max range for numeric raffles
- **Multiple Winners**: Configure 1-10 winners per raffle
- **Allow Repetition**: Option to allow/disallow repeated winners
- **Import Data**: Import items from CSV/TXT files
- **Paste from Clipboard**: Quick paste functionality

### Draw Animation
The draw animation has 3 phases for maximum suspense:
1. **Intro Phase**: Pulsing icon with animated ring and loading dots
2. **Spinning Phase**: Slot-machine style rapid cycling through items
3. **Reveal Phase**: Winner zoom-in with golden glow and confetti explosion

### History & Export
- All raffles saved to device (AsyncStorage)
- View past raffle details including participants and settings
- Share results via system share sheet
- Export results to PDF format
- Repeat raffles with same configuration

### Settings
- Theme: Light / Dark / System
- Haptic feedback toggle
- Animations toggle

## Project Architecture

```
client/
├── App.tsx                    # Main app with providers
├── components/
│   ├── Button.tsx             # Animated primary button
│   ├── Card.tsx               # Card container with elevation
│   ├── ErrorBoundary.tsx      # Error handling wrapper
│   ├── HeaderTitle.tsx        # Custom header with app icon
│   ├── ItemChip.tsx           # Removable item tag
│   ├── NumberInput.tsx        # Stepper number input
│   ├── SegmentedControl.tsx   # Tab-style selector
│   ├── ThemedText.tsx         # Themed text component
│   ├── ThemedView.tsx         # Themed view component
│   └── ToggleSwitch.tsx       # iOS-style toggle
├── constants/
│   └── theme.ts               # Colors, spacing, typography
├── context/
│   ├── RaffleContext.tsx      # Raffle history state
│   └── SettingsContext.tsx    # User preferences
├── hooks/
│   ├── useColorScheme.ts      # System theme detection
│   ├── useScreenOptions.ts    # Navigation options
│   └── useTheme.ts            # Theme hook
├── navigation/
│   ├── RootStackNavigator.tsx # Main stack with modals
│   ├── MainTabNavigator.tsx   # Bottom tab navigator
│   ├── HomeStackNavigator.tsx # Home tab stack
│   ├── HistoryStackNavigator.tsx # History tab stack
│   └── SettingsStackNavigator.tsx # Settings tab stack
└── screens/
    ├── HomeScreen.tsx         # Main raffle creation screen
    ├── HistoryScreen.tsx      # Past raffles list
    ├── SettingsScreen.tsx     # App preferences
    ├── DrawResultModal.tsx    # Animated draw result
    ├── RaffleDetailModal.tsx  # Raffle details view
    └── ImportDataModal.tsx    # CSV/TXT import

server/
├── index.ts                   # Express server setup
├── routes.ts                  # API routes
└── templates/
    └── landing-page.html      # Static landing page
```

## Design System

### Colors
- **Primary**: #2563EB (Bold Blue)
- **Accent**: #F59E0B (Amber/Gold)
- **Success**: #10B981
- **Error**: #EF4444
- **Backgrounds**: Light mode uses white/gray, Dark mode uses dark grays

### Typography
- **Display Font**: Nunito (Google Font) - Bold for titles
- **Body Font**: System font

### Spacing Scale
- xs: 4px, sm: 8px, md: 12px, lg: 16px, xl: 24px, 2xl: 32px

## Data Storage
- AsyncStorage for local persistence
- No backend database required for MVP
- History stored under `@sorteio_history` key
- Settings stored under `@sorteio_settings` key

## User Preferences
- Language: Portuguese (Brazil)
- Default theme: System
- Haptic feedback: Enabled by default
- Animations: Enabled by default

## Running the App
- **Frontend**: Port 8081 (Expo)
- **Backend**: Port 5000 (Express)
- Scan QR code with Expo Go to test on device
