export const API_ENDPOINTS = {
  BASE_URL: "http://localhost:5268",
  EMPLOYEES: "http://localhost:5268/api/employees",
} as const;

export const FONT_SIZES = {
  TITLE: 22,
  SUBTITLE: 16,
  HEADING: 16,
  BODY: 15,
  INPUT: 14,
  DETAIL: 13,
  ERROR: 13,
  BUTTON: 14,
} as const;

export const COLORS = {
  BACKGROUND: "#f1f5f9",
  SURFACE: "#ffffff",
  PRIMARY: "#2563eb",
  PRIMARY_LIGHT: "#eff6ff",
  DANGER: "#dc2626",
  DANGER_LIGHT: "#fef2f2",
  BORDER: "#cbd5e1",
  CARD_BORDER: "#e2e8f0",
  MUTED_BG: "#e2e8f0",
  EDIT_BG: "#f8fafc",
  TEXT_PRIMARY: "#0f172a",
  TEXT_SECONDARY: "#334155",
  TEXT_MUTED: "#64748b",
  TEXT_INVERSE: "#ffffff",
} as const;

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 20,
} as const;

export const RADIUS = {
  SM: 6,
  MD: 10,
  LG: 14,
} as const;

export const CONTROLS = {
  SEARCH_INPUT: {
    KEY: "searchEmployeeInput",
    PLACEHOLDER: "Search by name, email, or phone...",
  },
  FIRST_NAME_INPUT: {
    KEY: "firstNameInput",
    PLACEHOLDER: "First Name *",
  },
  MIDDLE_NAME_INPUT: {
    KEY: "middleNameInput",
    PLACEHOLDER: "Middle Name",
  },
  LAST_NAME_INPUT: {
    KEY: "lastNameInput",
    PLACEHOLDER: "Last Name *",
  },
  MOBILE_NUMBER_INPUT: {
    KEY: "mobileNumberInput",
    PLACEHOLDER: "Mobile Number",
  },
  EMAIL_INPUT: {
    KEY: "emailInput",
    PLACEHOLDER: "Email ID",
  },
  SAVE_BUTTON: {
    KEY: "saveEmployeeButton",
    ADD_LABEL: "Save",
    UPDATE_LABEL: "Update",
    SAVING_LABEL: "Saving...",
  },
  CANCEL_BUTTON: {
    KEY: "cancelEditButton",
    LABEL: "Cancel",
  },
  EDIT_BUTTON: {
    KEY: "editEmployeeButton",
    LABEL: "Edit",
  },
  DELETE_BUTTON: {
    KEY: "deleteEmployeeButton",
    LABEL: "Delete",
  },
} as const;

export const UI_TEXT = {
  APP_TITLE: "Employee Management System",
  LOADING: "Loading...",
  EMPLOYEE_COUNT_PREFIX: "Employees",
  ADD_HEADING: "+ Add Employee",
  EDIT_HEADING: "Edit Employee",
  REQUIRED_NAME_ERROR: "First Name and Last Name are required.",
  INVALID_MOBILE_ERROR: "Mobile number must be 10 digits.",
  INVALID_EMAIL_ERROR: "Please enter a valid email address.",
  NO_PHONE: "No phone",
  NO_EMAIL: "No email",
} as const;