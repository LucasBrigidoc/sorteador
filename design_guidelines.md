# Digital Raffle App - Design Guidelines

## Brand Identity

**Purpose**: A trustworthy digital raffle tool that makes random selection feel fair, transparent, and exciting for casual users and professional use cases.

**Aesthetic Direction**: Professional with playful moments. The app should feel credible and transparent in its resting state, but inject delight and anticipation during the draw animation. Think "lottery machine" energy - serious about fairness, exciting in execution.

**Memorable Element**: The draw animation itself. When users tap "Draw," the screen transforms into a high-energy moment with smooth animations that build anticipation before revealing results.

## Navigation Architecture

**Root Navigation**: Tab Navigation (3 tabs)
- Home (Raffle)
- History
- Settings

**Screen List**:
1. Home/Raffle Screen - Create and execute raffles
2. History Screen - View past raffles
3. Settings Screen - App preferences
4. Raffle Detail Modal - View/export/repeat specific raffle
5. Draw Result Modal - Display draw results with animation
6. Import Data Modal - Import from CSV/TXT

## Screen-by-Screen Specifications

### 1. Home/Raffle Screen
**Purpose**: Primary workspace where users configure and execute raffles.

**Layout**:
- Header: Default navigation header, title "New Raffle", right button "Import"
- Root view: Scrollable
- Safe area: top = insets.top + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Sections** (vertical stack):
1. **Entry Method Selector** - Segmented control: "List" | "Number Range"
2. **List Mode**:
   - Multi-line text input with placeholder "Enter items (one per line)"
   - "Paste" button below input
   - Scrollable chips/tags display of entered items with X to remove
   - Item count label
3. **Number Range Mode**:
   - Two number inputs: "Min" and "Max"
   - Toggle: "Allow repetition"
4. **Settings Card**:
   - Number picker: "Winners to draw" (1-10)
   - Toggle: "Allow repetition" (list mode only)
5. **Primary Action**: Large, centered "Draw" button (full width, high emphasis)

**Empty State**: When no items entered, show illustration with text "Add items to start your raffle"

### 2. History Screen
**Purpose**: Browse and revisit past raffles.

**Layout**:
- Header: Default, title "History", right button "Clear All"
- Root view: List (FlatList)
- Safe area: top = insets.top + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**List Items**: Cards showing:
- Date/time
- "List Raffle" or "Number Range (min-max)"
- Number of winners
- Winner preview (first result + "and X more")
- Tap to open Raffle Detail Modal

**Empty State**: Illustration with text "No raffles yet. Try your first draw!"

### 3. Settings Screen
**Purpose**: App preferences.

**Layout**:
- Header: Default, title "Settings"
- Root view: Scrollable form
- Safe area: top = insets.top + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Sections**:
- **Appearance**: Theme selector (Light/Dark/System)
- **Effects**: Toggles for "Sound" and "Animations"
- **About**: App version, Privacy Policy, Terms

### 4. Raffle Detail Modal (Native Modal)
**Purpose**: View raffle details, export, or repeat.

**Layout**:
- Header: Custom header with "Close" left button, "Export" right button
- Root view: Scrollable
- Safe area: top = insets.top + Spacing.xl, bottom = insets.bottom + Spacing.xl

**Content**:
- Date/time stamp
- Configuration summary (settings used)
- Full list of participants
- Results section with winners highlighted
- "Repeat This Raffle" button (secondary style)

### 5. Draw Result Modal (Native Modal)
**Purpose**: Animated reveal of draw results.

**Layout**:
- Full screen overlay (no header initially)
- Safe area: none during animation, then standard after reveal

**Animation Sequence**:
1. Screen darkens with semi-transparent overlay
2. Centered animated element cycles through items rapidly (0.5s)
3. Slows down dramatically over 1.5s
4. Final result scales in with confetti particle effect
5. Header appears with "Done" button
6. If multiple winners, show vertically stacked result cards

### 6. Import Data Modal (Native Modal)
**Purpose**: Import CSV/TXT files.

**Layout**:
- Header: "Cancel" left, "Import" right (disabled until valid)
- Root view: Scrollable form
- Safe area: standard modal insets

**Content**:
- File picker button
- Preview of parsed items (scrollable list)
- Item count
- Validation message if issues detected

## Color Palette

**Primary**: #2563EB (Bold Blue - trustworthy, professional)
**Primary Variant**: #1D4ED8 (Darker blue for pressed states)
**Accent**: #F59E0B (Amber - excitement, highlight winners)

**Background**:
- Light: #F9FAFB
- Dark: #111827

**Surface**:
- Light: #FFFFFF
- Dark: #1F2937

**Text**:
- Primary Light: #111827
- Secondary Light: #6B7280
- Primary Dark: #F9FAFB
- Secondary Dark: #9CA3AF

**Semantic**:
- Success: #10B981
- Error: #EF4444
- Warning: #F59E0B

## Typography

**Font**: Nunito (Google Font) - friendly, approachable, professional
**Body Font**: System font (SF Pro for iOS)

**Type Scale**:
- Display: Nunito Bold 32px (Raffle results)
- Title: Nunito Bold 24px (Screen headers)
- Heading: Nunito SemiBold 18px (Section headers)
- Body: System Regular 16px (Main content)
- Caption: System Regular 14px (Metadata, secondary info)

## Visual Design

**Spacing Scale**:
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- xxl: 32px

**Border Radius**:
- Buttons: 12px
- Cards: 16px
- Input fields: 8px

**Touchable Feedback**:
- Primary buttons: Scale to 0.98, opacity 0.9
- Cards/list items: Background color darkens slightly
- "Draw" button gets subtle pulse animation when enabled

**Drop Shadow** (floating action button):
- shadowOffset: {width: 0, height: 2}
- shadowOpacity: 0.10
- shadowRadius: 2

**Icons**: Use Feather icons from @expo/vector-icons

## Assets to Generate

1. **icon.png** - App icon featuring stylized raffle drum/lottery ball in Primary blue
   - WHERE USED: Device home screen

2. **splash-icon.png** - Same icon for splash screen
   - WHERE USED: App launch

3. **empty-raffle.png** - Simple illustration of blank ticket/list
   - WHERE USED: Home screen when no items entered

4. **empty-history.png** - Illustration of empty archive/folder
   - WHERE USED: History screen when no raffles yet

5. **confetti-particle.png** - Small colorful confetti shape (generate 3 variants in different colors)
   - WHERE USED: Draw Result Modal animation overlay

6. **winner-badge.png** - Trophy or star icon in Accent color
   - WHERE USED: Next to winner names in results

**Asset Style**: Clean, minimal line art with subtle gradients. Use Primary and Accent colors. Avoid complex details - keep illustrations supportive, not decorative.