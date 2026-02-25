# Course Card Redesign

## Changes Implemented

Redesigned the course cards in the `CoursesSection` of `Home.jsx` to match the provided visual reference.

### Visual Updates
- **Card Layout:** Vertical card with rounded corners, shadow, and hover effects.
- **Banner Image:** Added a placeholder banner area with a gradient and course name overlay (ready for real images).
- **Ribbon Badge:** Added a "Mode" ribbon (e.g., ONLINE) at the top left.
- **Typography:** Updated fonts and colors to match the premium look (Indigo/Blue theme).

### Content Structure
1.  **Header:**
    -   Banner Image
    -   Mode Ribbon
2.  **Title Section:**
    -   Course Name (truncated to 2 lines)
    -   "English" Language Badge
    -   WhatsApp Icon Button
3.  **Details Section:**
    -   Target Audience (e.g., "For Class 11 Aspirants") with icon.
    -   Start Date (e.g., "Starts on ...") with icon.
4.  **Plans Section:**
    -   "More plans inside" strip with "Infinity Pro" and "Infinity" badges.
5.  **Pricing Section:**
    -   Current Price (Large, Bold)
    -   Original Price (Strikethrough - *Mocked for visual*)
    -   Discount Badge (e.g., "27% OFF" - *Mocked for visual*)
    -   "(FOR FULL BATCH)" label
6.  **Action Buttons:**
    -   **EXPLORE:** Outlined Indigo button.
    -   **BUY NOW:** Solid Indigo button.

### Notes
- **Mock Data:** Since `original_price`, `discount`, and `image` might not be in your database yet, I added placeholder logic to simulate them for the visual design.
- **Responsiveness:** The cards are in a horizontal scroll container (`overflow-x-auto`) as before, maintaining the layout on smaller screens.

## Files Modified
- `frontend/src/pages/Home.jsx`
