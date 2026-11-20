import { TEXT_BLOCK, withProgress } from "../lib/organizer"

const yesNo = (id) => [
  { id: `${id}-y`, text: "Yes" },
  { id: `${id}-n`, text: "No" },
]
const opts = (id, list) => list.map((text, i) => ({ id: `${id}-${i}`, text }))
const when = (questionId, value) => ({ conditional: true, conditions: [{ questionId, value }] })

/** Question sections, in the same shape as the admin organizer templates. */
const TAX_ORGANIZER_SECTIONS = [
  {
    id: "s-personal",
    text: "Personal information",
    sectionsettings: {},
    formElements: [
      {
        id: "q-intro",
        type: TEXT_BLOCK,
        text: "<p>Thanks for filling this in! Answers <strong>save as you go</strong>, so you can stop and come back any time. Questions marked * are required.</p>",
        options: [],
        questionsectionsettings: {},
      },
      { id: "q-name", type: "Free Entry", text: "Full legal name", options: [], questionsectionsettings: { required: true, prefilled: true } },
      { id: "q-dob", type: "Date", text: "Date of birth", options: [], questionsectionsettings: { required: true } },
      {
        id: "q-email",
        type: "Email",
        text: "Best email for tax notices",
        options: [],
        questionsectionsettings: { descriptionEnabled: true, description: "We’ll only use this for IRS and state correspondence." },
      },
      {
        id: "q-status",
        type: "Dropdown",
        text: "Filing status",
        options: opts("q-status", ["Single", "Married filing jointly", "Married filing separately", "Head of household"]),
        questionsectionsettings: { required: true },
      },
      { id: "q-has-deps", type: "Yes/No", text: "Did you have any dependents in 2026?", options: yesNo("q-has-deps"), questionsectionsettings: { required: true } },
    ],
  },
  {
    id: "s-dependents",
    text: "Dependent",
    sectionsettings: { ...when("q-has-deps", "Yes"), sectionRepeatingMode: true, buttonName: "Add another dependent" },
    formElements: [
      { id: "q-dep-name", type: "Free Entry", text: "Dependent’s full name", options: [], questionsectionsettings: { required: true } },
      { id: "q-dep-dob", type: "Date", text: "Date of birth", options: [], questionsectionsettings: {} },
      {
        id: "q-dep-rel",
        type: "Radio Buttons",
        text: "Relationship to you",
        options: opts("q-dep-rel", ["Child", "Stepchild", "Parent", "Other relative"]),
        questionsectionsettings: {},
      },
    ],
  },
  {
    id: "s-income",
    text: "Income",
    sectionsettings: {},
    formElements: [
      {
        id: "q-income",
        type: "Checkboxes",
        text: "Which of these did you receive in 2026?",
        options: opts("q-income", ["W-2 wages", "1099 interest", "1099 contractor income", "Rental income"]),
        questionsectionsettings: { required: true, descriptionEnabled: true, description: "Tick all that apply." },
      },
      {
        id: "q-w2-files",
        type: "File Upload",
        text: "Upload your W-2 forms",
        options: [],
        questionsectionsettings: { ...when("q-income", "W-2 wages"), required: true, descriptionEnabled: true, description: "One file per employer. PDF or photo is fine." },
      },
      {
        id: "q-1099-files",
        type: "File Upload",
        text: "Upload your 1099 forms",
        options: [],
        questionsectionsettings: {
          conditional: true,
          conditionMode: "any",
          conditions: [
            { questionId: "q-income", value: "1099 interest" },
            { questionId: "q-income", value: "1099 contractor income" },
          ],
          required: true,
        },
      },
      {
        id: "q-rental",
        type: "Number",
        text: "Total rental income for 2026 ($)",
        options: [],
        questionsectionsettings: when("q-income", "Rental income"),
      },
    ],
  },
  {
    id: "s-home-office",
    text: "Home office",
    sectionsettings: {},
    formElements: [
      {
        id: "q-wfh",
        type: "Yes/No",
        text: "Did you work from home more than half the week?",
        options: yesNo("q-wfh"),
        questionsectionsettings: { required: true },
      },
      { id: "q-office-sqft", type: "Number", text: "Size of your home office (sq ft)", options: [], questionsectionsettings: when("q-wfh", "Yes") },
      {
        id: "q-office-files",
        type: "File Upload",
        text: "Floor plan or photos of your office (optional)",
        options: [],
        questionsectionsettings: when("q-wfh", "Yes"),
      },
    ],
  },
  {
    id: "s-donations",
    text: "Charitable donations",
    sectionsettings: {},
    formElements: [
      { id: "q-donated", type: "Yes/No", text: "Did you donate to charity in 2026?", options: yesNo("q-donated"), questionsectionsettings: { required: true } },
      { id: "q-donated-total", type: "Number", text: "Total donated ($)", options: [], questionsectionsettings: when("q-donated", "Yes") },
      {
        id: "q-donation-files",
        type: "File Upload",
        text: "Donation receipts",
        options: [],
        questionsectionsettings: { ...when("q-donated", "Yes"), descriptionEnabled: true, description: "Upload all receipts — you can select several at once." },
      },
    ],
  },
  {
    id: "s-other",
    text: "Anything else",
    sectionsettings: {},
    formElements: [{ id: "q-notes", type: "Free Entry", text: "Anything else your accountant should know?", options: [], questionsectionsettings: {} }],
  },
]

/** Business expenses — several repeating sections (vehicles, purchases, contractors, trips). */
const BUSINESS_EXPENSE_SECTIONS = [
  {
    id: "b-details",
    text: "Business details",
    sectionsettings: {},
    formElements: [
      {
        id: "b-intro",
        type: TEXT_BLOCK,
        text: "<p>This organizer covers <strong>business expenses for 2026</strong>. Use the <em>Add another…</em> buttons to list each vehicle, purchase, contractor and trip.</p>",
        options: [],
        questionsectionsettings: {},
      },
      { id: "b-name", type: "Free Entry", text: "Business name", options: [], questionsectionsettings: { required: true, prefilled: true } },
      { id: "b-ein", type: "Free Entry", text: "EIN (employer identification number)", options: [], questionsectionsettings: { descriptionEnabled: true, description: "Format: 12-3456789" } },
      {
        id: "b-entity",
        type: "Dropdown",
        text: "Business type",
        options: opts("b-entity", ["Sole proprietor", "Single-member LLC", "Multi-member LLC", "S corporation", "C corporation"]),
        questionsectionsettings: { required: true },
      },
      { id: "b-start", type: "Date", text: "Date the business started", options: [], questionsectionsettings: {} },
      {
        id: "b-method",
        type: "Radio Buttons",
        text: "Accounting method",
        options: opts("b-method", ["Cash", "Accrual", "Not sure"]),
        questionsectionsettings: { required: true },
      },
    ],
  },
  {
    id: "b-vehicles-q",
    text: "Vehicles",
    sectionsettings: {},
    formElements: [
      { id: "b-has-vehicle", type: "Yes/No", text: "Did you use a vehicle for business in 2026?", options: yesNo("b-has-vehicle"), questionsectionsettings: { required: true } },
    ],
  },
  {
    id: "b-vehicle",
    text: "Vehicle",
    sectionsettings: { ...when("b-has-vehicle", "Yes"), sectionRepeatingMode: true, buttonName: "Add another vehicle" },
    formElements: [
      { id: "b-veh-make", type: "Free Entry", text: "Make and model", options: [], questionsectionsettings: { required: true } },
      { id: "b-veh-year", type: "Number", text: "Year", options: [], questionsectionsettings: {} },
      { id: "b-veh-service", type: "Date", text: "Date first used for business", options: [], questionsectionsettings: {} },
      { id: "b-veh-total-miles", type: "Number", text: "Total miles driven in 2026", options: [], questionsectionsettings: { required: true } },
      { id: "b-veh-biz-miles", type: "Number", text: "Business miles", options: [], questionsectionsettings: { required: true } },
      {
        id: "b-veh-method",
        type: "Radio Buttons",
        text: "How do you want to claim it?",
        options: opts("b-veh-method", ["Standard mileage rate", "Actual expenses", "Let my accountant decide"]),
        questionsectionsettings: {},
      },
      {
        id: "b-veh-log",
        type: "File Upload",
        text: "Mileage log",
        options: [],
        questionsectionsettings: { descriptionEnabled: true, description: "A spreadsheet, app export or photos of a paper log." },
      },
    ],
  },
  {
    id: "b-purchases-q",
    text: "Equipment & big purchases",
    sectionsettings: {},
    formElements: [
      {
        id: "b-has-purchases",
        type: "Yes/No",
        text: "Did you buy equipment, furniture or software over $2,500 in 2026?",
        options: yesNo("b-has-purchases"),
        questionsectionsettings: { required: true },
      },
    ],
  },
  {
    id: "b-purchase",
    text: "Purchase",
    sectionsettings: { ...when("b-has-purchases", "Yes"), sectionRepeatingMode: true, buttonName: "Add another purchase" },
    formElements: [
      { id: "b-pur-item", type: "Free Entry", text: "What did you buy?", options: [], questionsectionsettings: { required: true } },
      { id: "b-pur-date", type: "Date", text: "Purchase date", options: [], questionsectionsettings: { required: true } },
      { id: "b-pur-cost", type: "Number", text: "Cost ($)", options: [], questionsectionsettings: { required: true } },
      { id: "b-pur-pct", type: "Number", text: "Business use (%)", options: [], questionsectionsettings: { descriptionEnabled: true, description: "100 if it’s only used for the business." } },
      { id: "b-pur-receipt", type: "File Upload", text: "Receipt or invoice", options: [], questionsectionsettings: {} },
    ],
  },
  {
    id: "b-contractors-q",
    text: "Contractors",
    sectionsettings: {},
    formElements: [
      { id: "b-has-contractors", type: "Yes/No", text: "Did you pay any contractor $600 or more?", options: yesNo("b-has-contractors"), questionsectionsettings: { required: true } },
    ],
  },
  {
    id: "b-contractor",
    text: "Contractor",
    sectionsettings: { ...when("b-has-contractors", "Yes"), sectionRepeatingMode: true, buttonName: "Add another contractor" },
    formElements: [
      { id: "b-con-name", type: "Free Entry", text: "Contractor or company name", options: [], questionsectionsettings: { required: true } },
      { id: "b-con-email", type: "Email", text: "Contractor email", options: [], questionsectionsettings: {} },
      { id: "b-con-paid", type: "Number", text: "Total paid in 2026 ($)", options: [], questionsectionsettings: { required: true } },
      {
        id: "b-con-w9",
        type: "Yes/No",
        text: "Do you have their W-9?",
        options: yesNo("b-con-w9"),
        questionsectionsettings: {},
      },
      { id: "b-con-w9-file", type: "File Upload", text: "Upload the W-9", options: [], questionsectionsettings: when("b-con-w9", "Yes") },
    ],
  },
  {
    id: "b-travel-q",
    text: "Business travel",
    sectionsettings: {},
    formElements: [
      { id: "b-has-travel", type: "Yes/No", text: "Did you travel overnight for business?", options: yesNo("b-has-travel"), questionsectionsettings: { required: true } },
    ],
  },
  {
    id: "b-trip",
    text: "Trip",
    sectionsettings: { ...when("b-has-travel", "Yes"), sectionRepeatingMode: true, buttonName: "Add another trip" },
    formElements: [
      { id: "b-trip-dest", type: "Free Entry", text: "Destination", options: [], questionsectionsettings: { required: true } },
      { id: "b-trip-start", type: "Date", text: "Start date", options: [], questionsectionsettings: {} },
      { id: "b-trip-end", type: "Date", text: "End date", options: [], questionsectionsettings: {} },
      { id: "b-trip-purpose", type: "Free Entry", text: "Business purpose", options: [], questionsectionsettings: { required: true } },
      {
        id: "b-trip-costs",
        type: "Checkboxes",
        text: "What did you pay for?",
        options: opts("b-trip-costs", ["Flights", "Hotel", "Meals", "Car rental", "Conference fees"]),
        questionsectionsettings: {},
      },
      { id: "b-trip-receipts", type: "File Upload", text: "Trip receipts", options: [], questionsectionsettings: { descriptionEnabled: true, description: "Select all receipts for this trip at once." } },
    ],
  },
  {
    id: "b-other",
    text: "Other expenses",
    sectionsettings: {},
    formElements: [
      {
        id: "b-other-types",
        type: "Checkboxes",
        text: "Which of these did the business pay for?",
        options: opts("b-other-types", ["Rent", "Utilities", "Phone & internet", "Insurance", "Advertising", "Software subscriptions"]),
        questionsectionsettings: {},
      },
      { id: "b-other-statements", type: "File Upload", text: "Business bank or card statements", options: [], questionsectionsettings: { descriptionEnabled: true, description: "All 12 months if you have them." } },
      { id: "b-other-notes", type: "Free Entry", text: "Anything else we should know about your expenses?", options: [], questionsectionsettings: {} },
    ],
  },
]

/** Rental properties — one repeating section per property, plus repeating repairs. */
const RENTAL_SECTIONS = [
  {
    id: "r-overview",
    text: "Overview",
    sectionsettings: {},
    formElements: [
      {
        id: "r-intro",
        type: TEXT_BLOCK,
        text: "<p>Add <strong>one section per property</strong>. If you rented the same property for part of the year, we’ll split the expenses for you.</p>",
        options: [],
        questionsectionsettings: {},
      },
      {
        id: "r-manager",
        type: "Yes/No",
        text: "Does a property manager handle any of your rentals?",
        options: yesNo("r-manager"),
        questionsectionsettings: { required: true },
      },
      { id: "r-manager-statements", type: "File Upload", text: "Year-end statements from the property manager", options: [], questionsectionsettings: when("r-manager", "Yes") },
    ],
  },
  {
    id: "r-property",
    text: "Property",
    sectionsettings: { sectionRepeatingMode: true, buttonName: "Add another property" },
    formElements: [
      { id: "r-address", type: "Free Entry", text: "Property address", options: [], questionsectionsettings: { required: true } },
      {
        id: "r-type",
        type: "Dropdown",
        text: "Property type",
        options: opts("r-type", ["Single-family home", "Condo / apartment", "Multi-family (2–4 units)", "Vacation / short-term rental", "Commercial"]),
        questionsectionsettings: { required: true },
      },
      { id: "r-days", type: "Number", text: "Days rented in 2026", options: [], questionsectionsettings: { required: true } },
      { id: "r-personal-days", type: "Number", text: "Days you or family used it", options: [], questionsectionsettings: {} },
      { id: "r-rent", type: "Number", text: "Total rent received ($)", options: [], questionsectionsettings: { required: true } },
      {
        id: "r-expenses",
        type: "Checkboxes",
        text: "Which expenses did you pay?",
        options: opts("r-expenses", ["Mortgage interest", "Property tax", "Insurance", "HOA fees", "Utilities", "Cleaning", "Management fees"]),
        questionsectionsettings: {},
      },
      { id: "r-1098", type: "File Upload", text: "Mortgage statement (Form 1098)", options: [], questionsectionsettings: when("r-expenses", "Mortgage interest") },
      { id: "r-docs", type: "File Upload", text: "Other statements and receipts", options: [], questionsectionsettings: { descriptionEnabled: true, description: "Tax bills, insurance, HOA statements — add as many as you need." } },
    ],
  },
  {
    id: "r-repairs-q",
    text: "Repairs & improvements",
    sectionsettings: {},
    formElements: [
      { id: "r-has-repairs", type: "Yes/No", text: "Did you pay for repairs or improvements over $500?", options: yesNo("r-has-repairs"), questionsectionsettings: { required: true } },
    ],
  },
  {
    id: "r-repair",
    text: "Repair",
    sectionsettings: { ...when("r-has-repairs", "Yes"), sectionRepeatingMode: true, buttonName: "Add another repair" },
    formElements: [
      { id: "r-rep-property", type: "Free Entry", text: "Which property?", options: [], questionsectionsettings: { required: true } },
      { id: "r-rep-what", type: "Free Entry", text: "What was done?", options: [], questionsectionsettings: { required: true } },
      {
        id: "r-rep-kind",
        type: "Radio Buttons",
        text: "Was it a repair or an improvement?",
        options: opts("r-rep-kind", ["Repair (fixed something)", "Improvement (made it better or bigger)", "Not sure"]),
        questionsectionsettings: {},
      },
      { id: "r-rep-cost", type: "Number", text: "Cost ($)", options: [], questionsectionsettings: { required: true } },
      { id: "r-rep-date", type: "Date", text: "Date finished", options: [], questionsectionsettings: {} },
      { id: "r-rep-invoice", type: "File Upload", text: "Invoices", options: [], questionsectionsettings: {} },
    ],
  },
]

/** Payroll onboarding — one repeating section per employee. */
const PAYROLL_SECTIONS = [
  {
    id: "p-company",
    text: "Company payroll details",
    sectionsettings: {},
    formElements: [
      {
        id: "p-frequency",
        type: "Radio Buttons",
        text: "How often do you pay employees?",
        options: opts("p-frequency", ["Weekly", "Every two weeks", "Twice a month", "Monthly"]),
        questionsectionsettings: { required: true },
      },
      { id: "p-first-payday", type: "Date", text: "First payday with Harbor", options: [], questionsectionsettings: { required: true } },
      { id: "p-state-id", type: "Free Entry", text: "State withholding account number", options: [], questionsectionsettings: {} },
      {
        id: "p-benefits",
        type: "Checkboxes",
        text: "Which benefits do you offer?",
        options: opts("p-benefits", ["Health insurance", "401(k)", "Paid time off", "None yet"]),
        questionsectionsettings: {},
      },
    ],
  },
  {
    id: "p-employee",
    text: "Employee",
    sectionsettings: { sectionRepeatingMode: true, buttonName: "Add another employee" },
    formElements: [
      { id: "p-emp-name", type: "Free Entry", text: "Full name", options: [], questionsectionsettings: { required: true } },
      { id: "p-emp-email", type: "Email", text: "Email", options: [], questionsectionsettings: { required: true } },
      { id: "p-emp-start", type: "Date", text: "Start date", options: [], questionsectionsettings: { required: true } },
      {
        id: "p-emp-type",
        type: "Radio Buttons",
        text: "Pay type",
        options: opts("p-emp-type", ["Salary", "Hourly"]),
        questionsectionsettings: { required: true },
      },
      { id: "p-emp-salary", type: "Number", text: "Annual salary ($)", options: [], questionsectionsettings: when("p-emp-type", "Salary") },
      { id: "p-emp-rate", type: "Number", text: "Hourly rate ($)", options: [], questionsectionsettings: when("p-emp-type", "Hourly") },
      { id: "p-emp-w4", type: "File Upload", text: "Signed W-4 and I-9", options: [], questionsectionsettings: { required: true } },
    ],
  },
]

const file = (id, name, size, uploadedAt) => ({ id, name, size, type: name.endsWith(".pdf") ? "application/pdf" : "image/jpeg", uploadedAt })

/**
 * status: "Not started" | "In progress" | "Submitted".
 * A submitted organizer is sealed: the client can only read it.
 * answered/total are worked out from the answers (see withProgress).
 */
export const clientOrganizers = [
  {
    _id: "org-1",
    name: "2026 tax organizer",
    description: "Personal details, income, home office and donations.",
    year: 2026,
    dueDate: "2026-11-30",
    status: "In progress",
    chatId: "ch-4", // "Ask your accountant" opens this chat
    sections: TAX_ORGANIZER_SECTIONS,
    copies: {},
    answers: {
      "q-name": "Grace Adaeze Okafor",
      "q-dob": "1986-03-14",
      "q-email": "grace@okaforholdings.com",
      "q-status": "Single",
      "q-has-deps": "No",
      "q-income": ["W-2 wages", "1099 interest"],
      "q-w2-files": [file("f-1", "W-2 Okafor Holdings 2026.pdf", 182000, "2026-11-12")],
    },
    updatedAt: "2026-11-14T18:22:00",
  },
  {
    _id: "org-3",
    name: "2026 business expenses",
    description: "Vehicles, big purchases, contractors and travel for Okafor Holdings.",
    year: 2026,
    dueDate: "2027-01-15",
    status: "Not started",
    chatId: "ch-1",
    sections: BUSINESS_EXPENSE_SECTIONS,
    copies: {},
    answers: {},
    updatedAt: null,
  },
  {
    _id: "org-4",
    name: "2026 rental properties",
    description: "One section per property, plus any repairs or improvements.",
    year: 2026,
    dueDate: "2026-12-10",
    status: "In progress",
    chatId: "ch-4",
    sections: RENTAL_SECTIONS,
    // Two properties already added (the original + 1 copy), one repair
    copies: { "r-property": 1, "r-repair": 0 },
    answers: {
      "r-manager": "No",
      // Property 1
      "r-address": "48 Elm Street, Unit 2, Springfield",
      "r-type": "Condo / apartment",
      "r-days": "365",
      "r-personal-days": "0",
      "r-rent": "21600",
      "r-expenses": ["Mortgage interest", "Property tax", "Insurance", "HOA fees"],
      "r-1098": [file("f-10", "1098 Elm St 2026.pdf", 94000, "2026-11-03")],
      // Property 2 (copy #1)
      "r-address#1": "12 Lakeview Drive, Bayside",
      "r-type#1": "Vacation / short-term rental",
      "r-days#1": "142",
      "r-personal-days#1": "14",
      "r-expenses#1": ["Cleaning", "Utilities", "Management fees"],
      // Repairs
      "r-has-repairs": "Yes",
      "r-rep-property": "48 Elm Street",
      "r-rep-what": "Replaced the water heater",
    },
    updatedAt: "2026-11-15T20:40:00",
  },
  {
    _id: "org-2",
    name: "2025 tax organizer",
    description: "Last year’s organizer, as you submitted it.",
    year: 2025,
    dueDate: "2025-12-01",
    status: "Submitted",
    sealed: true,
    submittedAt: "2025-11-28T16:05:00",
    chatId: "ch-3",
    sections: TAX_ORGANIZER_SECTIONS,
    copies: { "s-dependents": 0 },
    answers: {
      "q-name": "Grace Adaeze Okafor",
      "q-dob": "1986-03-14",
      "q-email": "grace@okaforholdings.com",
      "q-status": "Single",
      "q-has-deps": "Yes",
      "q-dep-name": "Chidi Okafor",
      "q-dep-dob": "2014-07-02",
      "q-dep-rel": "Child",
      "q-income": ["W-2 wages", "Rental income"],
      "q-w2-files": [file("f-2", "W-2 2025.pdf", 176000, "2025-11-20"), file("f-3", "W-2 second employer 2025.pdf", 168000, "2025-11-20")],
      "q-rental": "14400",
      "q-wfh": "Yes",
      "q-office-sqft": "140",
      "q-office-files": [file("f-4", "office-photo-1.jpg", 2100000, "2025-11-21"), file("f-5", "office-photo-2.jpg", 1900000, "2025-11-21")],
      "q-donated": "Yes",
      "q-donated-total": "1250",
      "q-donation-files": [file("f-6", "Red Cross receipt.pdf", 64000, "2025-11-22"), file("f-7", "Food bank receipt.pdf", 58000, "2025-11-22")],
      "q-notes": "We moved offices in October — new address is on file with Jonas.",
    },
    updatedAt: "2025-11-28T16:05:00",
  },
  {
    _id: "org-5",
    name: "Payroll onboarding",
    description: "Company payroll details and one section per employee.",
    year: 2026,
    dueDate: "2026-10-14",
    status: "Submitted",
    sealed: true,
    submittedAt: "2026-10-13T11:20:00",
    chatId: "ch-3",
    sections: PAYROLL_SECTIONS,
    copies: { "p-employee": 2 }, // three employees
    answers: {
      "p-frequency": "Every two weeks",
      "p-first-payday": "2026-10-31",
      "p-state-id": "SWH-0048213",
      "p-benefits": ["Health insurance", "Paid time off"],
      "p-emp-name": "Daniel Mensah",
      "p-emp-email": "daniel@okaforholdings.com",
      "p-emp-start": "2024-02-05",
      "p-emp-type": "Salary",
      "p-emp-salary": "68000",
      "p-emp-w4": [file("f-20", "Mensah W-4.pdf", 88000, "2026-10-12"), file("f-21", "Mensah I-9.pdf", 102000, "2026-10-12")],
      "p-emp-name#1": "Priya Raman",
      "p-emp-email#1": "priya@okaforholdings.com",
      "p-emp-start#1": "2025-06-16",
      "p-emp-type#1": "Hourly",
      "p-emp-rate#1": "32",
      "p-emp-w4#1": [file("f-22", "Raman W-4.pdf", 91000, "2026-10-12"), file("f-23", "Raman I-9.pdf", 99000, "2026-10-12")],
      "p-emp-name#2": "Tomás Ortega",
      "p-emp-email#2": "tomas@okaforholdings.com",
      "p-emp-start#2": "2026-09-01",
      "p-emp-type#2": "Hourly",
      "p-emp-rate#2": "24.5",
      "p-emp-w4#2": [file("f-24", "Ortega W-4.pdf", 87000, "2026-10-13"), file("f-25", "Ortega I-9 photo.jpg", 1400000, "2026-10-13")],
    },
    updatedAt: "2026-10-13T11:20:00",
  },
].map(withProgress)
