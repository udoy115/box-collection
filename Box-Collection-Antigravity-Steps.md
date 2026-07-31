# Box Collection — Antigravity Execution Plan

How to use this: go step by step, in order. Each step is marked either:
- 🤖 **TELL ANTIGRAVITY** — copy the prompt block into the AI chat exactly, then let it run
- 👤 **YOU DO THIS** — a manual action only you can do (Google account, deploy, etc.)

Don't skip ahead — several AI steps depend on manual steps being done first (the Sheet and Apps Script URL need to exist before the form can be wired up).

---

## Step 1 — 🤖 TELL ANTIGRAVITY: Scaffold the project + design system

```
Scaffold a static single-page website (plain HTML/CSS/JS, no framework)
for a book bundle business called "Box Collection". No build step needed.

Color palette (light/blush/white theme only — no dark mode anywhere):
- Background: #FFFDFB
- Secondary background: #FBE4E0
- Primary accent: #E8AFAA
- Accent hover: #D68C86
- Text primary: #33302E
- Text muted: #7A726E
- Borders/dividers: #F2D8D3

Typography: a warm serif for headings (e.g. Fraunces or Playfair Display)
and a clean sans-serif for body text (e.g. Inter or Work Sans). Rounded
corners (12-16px), soft shadows, generous whitespace, no dark theme, no
harsh borders.

Build the page shell with these sections in this order (placeholder
content is fine for now):
1. Header — logo/name "Box Collection" + nav links (Bundles, How It
   Works, Order, Contact)
2. Hero — headline, short subtext, hero image placeholder, CTA button
   that scrolls down to the Bundles section
3. Bundles grid — placeholder for 5-6 cards (build in the next step)
4. "How it works" 3-step strip: Pick a bundle → Fill the form → We
   confirm & ship
5. Order form section (build in a later step)
6. Footer — contact info placeholder, social links placeholder
```

---

## Step 2 — 🤖 TELL ANTIGRAVITY: Create the bundles data file + grid

```
Create a separate data file called bundles.js containing an array of
book bundle objects, so bundle content can be edited later without
touching any design/layout code. Shape:

const bundles = [
  {
    id: "bundle-1",
    name: "Bundle name",
    price: 999,
    currency: "BDT",
    books: ["Book title 1", "Book title 2", "Book title 3"],
    image: "images/bundle-1.jpg"
  }
];

Populate it with 6 placeholder bundles for now. Then render the
Bundles grid section dynamically from this file — one card per
bundle showing: bundle name, book cover/flat-lay image, list of
book titles inside, price, and a "Select this bundle" button.
```

---

## Step 3 — 🤖 TELL ANTIGRAVITY: Build the order form

```
Build the order form section with these fields: Name (required),
Phone (required, basic format validation), Email (optional),
Delivery Address (required), Bundle (dropdown, pre-filled from
whichever bundle card the visitor clicked "Select this bundle" on
— clicking a card should scroll to the form and pre-select that
bundle), Payment Method (dropdown: Cash on Delivery, bKash, Nagad),
Notes (optional, textarea).

Add client-side validation with inline error messages for required
fields. Don't wire up submission yet — that's a later step.
```

---

## Step 4 — 👤 YOU DO THIS: Create the Google Sheet

1. Create a new Google Sheet, name it something like "Box Collection Orders"
2. Add this exact header row in row 1:
   `Timestamp | Name | Phone | Email | Address | Bundle | Price | Payment Method | Notes`
3. Keep the sheet open/handy — you'll need it in the next step

---

## Step 5 — 👤 YOU DO THIS: Open the Apps Script editor

1. In your Sheet: `Extensions → Apps Script`
2. This opens a blank script editor tied to your Sheet — leave it open, you'll paste code into it in Step 6

---

## Step 6 — 🤖 TELL ANTIGRAVITY: Generate the Apps Script + fetch code

```
Write a Google Apps Script doPost(e) function that receives JSON
data from a POST request and appends it as a new row to a Google
Sheet with these columns in this order:
Timestamp, Name, Phone, Email, Address, Bundle, Price, Payment
Method, Notes. Use the current timestamp for the Timestamp column.

Also write the exact fetch() JavaScript code I'll need in my order
form's submit handler to send the form data to this script once
it's deployed as a Web App (I'll give you the Web App URL
afterward — leave a placeholder for it).

Give me both pieces of code clearly separated: (1) the Apps Script
to paste into the Apps Script editor, and (2) the fetch code for
the website.
```

Paste the Apps Script code the AI gives you into the Apps Script editor from Step 5, then save it.

---

## Step 7 — 👤 YOU DO THIS: Deploy the Apps Script as a Web App

1. In the Apps Script editor: `Deploy → New deployment`
2. Select type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Click **Deploy**, authorize the permissions Google asks for
6. Copy the **Web App URL** it gives you — you'll need this in the next step

---

## Step 8 — 🤖 TELL ANTIGRAVITY: Wire the form to the Web App

```
Wire the order form's submit handler to POST its data as JSON to
this Google Apps Script Web App URL: [PASTE YOUR WEB APP URL HERE]

On submit:
- Show a loading state on the submit button while the request is in flight
- On success, show an inline "Order received — we'll confirm by phone
  shortly" message in place of the form (no page reload/redirect)
- On failure, show an inline error message and let the visitor retry
```

---

## Step 9 — 👤 YOU DO THIS: Test the order flow end-to-end

1. Open the live page (or local preview), submit a real test order
2. Check that a new row appears correctly in your Google Sheet
3. If something's off, tell Antigravity what went wrong and let it fix it before moving on

---

## Step 10 — 🤖 TELL ANTIGRAVITY: Polish pass

```
Make the whole page fully responsive and mobile-first (this is the
primary device most visitors will use). Add SEO meta tags and an
Open Graph image tag. Add descriptive alt text to every book/bundle
image. Double-check color contrast still reads well within the
light blush/white palette. Confirm there is no dark mode anywhere.
```

---

## Step 11 — 👤 YOU DO THIS: Send over the real bundle content

Send me (or directly to Antigravity) the doc with:
- Each bundle's name, list of books, and price
- One photo per book, or a flat-lay photo per bundle
- Your logo (or confirm text-only wordmark)
- Your real contact number/social handle for the footer
- Confirm your actual payment methods (Cash on Delivery / bKash / Nagad, or others)

---

## Step 12 — 🤖 TELL ANTIGRAVITY: Drop in the real content

```
Replace the placeholder data in bundles.js with the real bundle
content I'm providing now: [paste bundle names/books/prices, or
attach the doc]. Replace placeholder images with the real book/
bundle photos, replace the logo placeholder, and update the footer
contact info and payment method options to the real ones.
```

---

## Step 13 — 👤 YOU DO THIS: Deploy to hosting

1. Create a free account on **Netlify**, **Vercel**, or **GitHub Pages** (pick one)
2. Connect/upload the project — since it's a static site with no build step, this should be a drag-and-drop or simple repo connect
3. (Optional) Point a custom domain at it if you have one

---

## Step 14 — 👤 YOU DO THIS: Final live test

Place one real test order on the live, deployed site and confirm it lands correctly in the Sheet before sharing the link publicly.
