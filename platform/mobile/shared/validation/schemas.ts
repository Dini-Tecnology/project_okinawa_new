/**
 * Zod Validation Schemas for Project Okinawa
 * 
 * Centralized validation schemas for form inputs across
 * both Client and Restaurant mobile applications.
 * 
 * @module validation/schemas
 */

import { z } from 'zod';

// ============================================
// COMMON FIELD VALIDATORS
// ============================================

/**
 * Email validation with proper format checking
 */
export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: 'Email is required' })
  .email({ message: 'Invalid email address' })
  .max(255, { message: 'Email must be less than 255 characters' });

/**
 * Password validation with security requirements
 */
export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .max(100, { message: 'Password must be less than 100 characters' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' });

/**
 * Simple password for login (no complexity requirements)
 */
export const loginPasswordSchema = z
  .string()
  .min(1, { message: 'Password is required' })
  .max(100, { message: 'Password must be less than 100 characters' });

/**
 * Full name validation
 */
export const fullNameSchema = z
  .string()
  .trim()
  .min(2, { message: 'Name must be at least 2 characters' })
  .max(100, { message: 'Name must be less than 100 characters' })
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { message: 'Name contains invalid characters' });

/**
 * Phone number validation (Brazilian format)
 */
export const phoneSchema = z
  .string()
  .trim()
  .min(10, { message: 'Phone number is too short' })
  .max(15, { message: 'Phone number is too long' })
  .regex(/^[\d\s()+-]+$/, { message: 'Invalid phone number format' });

/**
 * Optional phone number
 */
export const optionalPhoneSchema = z.union([
  z.literal(''),
  phoneSchema,
]);

// ============================================
// AUTHENTICATION SCHEMAS
// ============================================

/**
 * Phone number with country code for OTP authentication
 */
export const phoneAuthSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .min(10, { message: 'Phone number is required' })
    .regex(/^\+?[\d\s()-]+$/, { message: 'Invalid phone number format' }),
  countryCode: z
    .string()
    .regex(/^\+\d{1,4}$/, { message: 'Invalid country code' })
    .default('+55'),
});

export type PhoneAuthFormData = z.infer<typeof phoneAuthSchema>;

/**
 * OTP code validation (6 digits)
 */
export const otpSchema = z.object({
  code: z
    .string()
    .length(6, { message: 'OTP code must be 6 digits' })
    .regex(/^\d{6}$/, { message: 'OTP code must contain only numbers' }),
});

export type OTPFormData = z.infer<typeof otpSchema>;

/**
 * Social login validation
 */
export const socialAuthSchema = z.object({
  provider: z.enum(['apple', 'google'], { message: 'Invalid provider' }),
  idToken: z.string().min(1, { message: 'ID token is required' }),
  deviceInfo: z.object({
    deviceId: z.string().min(1),
    platform: z.enum(['ios', 'android', 'web']),
    model: z.string().optional(),
    osVersion: z.string().optional(),
  }),
});

export type SocialAuthFormData = z.infer<typeof socialAuthSchema>;

/**
 * Biometric enrollment
 */
export const biometricEnrollmentSchema = z.object({
  enrollmentToken: z.string().min(1, { message: 'Enrollment token is required' }),
  biometricType: z.enum(['face_id', 'touch_id', 'fingerprint'], { 
    message: 'Invalid biometric type' 
  }),
  publicKey: z.string().min(1, { message: 'Public key is required' }),
});

export type BiometricEnrollmentFormData = z.infer<typeof biometricEnrollmentSchema>;

/**
 * Login form validation
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Registration form validation (passwordless-first with optional email/password)
 */
export const registerSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  password: passwordSchema.optional(),
  confirmPassword: z.string().optional(),
  birthDate: z.string().optional(),
}).refine((data) => {
  // Either email or phone is required
  return data.email || data.phone;
}, {
  message: 'Email or phone number is required',
  path: ['email'],
}).refine((data) => {
  if (!data.password) return true;
  return Boolean(data.confirmPassword);
}, {
  message: 'Password confirmation is required',
  path: ['confirmPassword'],
}).refine((data) => {
  if (!data.password || !data.confirmPassword) return true;
  return data.password === data.confirmPassword;
}, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Simplified phone registration (passwordless)
 */
export const phoneRegisterSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema.optional(),
  birthDate: z.string().optional(),
});

export type PhoneRegisterFormData = z.infer<typeof phoneRegisterSchema>;

/**
 * Password reset request
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Password reset with new password
 */
export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ============================================
// RESERVATION SCHEMAS
// ============================================

/**
 * Create reservation form
 */
export const createReservationSchema = z.object({
  restaurantId: z.string().min(1, { message: 'Restaurant is required' }),
  date: z.string().min(1, { message: 'Date is required' }),
  time: z.string().min(1, { message: 'Time is required' }),
  partySize: z
    .number()
    .int()
    .min(1, { message: 'Party size must be at least 1' })
    .max(20, { message: 'Party size cannot exceed 20' }),
  specialRequests: z
    .string()
    .max(500, { message: 'Special requests must be less than 500 characters' })
    .optional(),
  tablePreference: z.enum(['indoor', 'outdoor', 'bar', 'any']).optional(),
});

export type CreateReservationFormData = z.infer<typeof createReservationSchema>;

/**
 * Guest invitation form
 */
export const guestInvitationSchema = z.object({
  method: z.enum(['app', 'sms', 'email', 'link']),
  recipient: z.string().min(1, { message: 'Recipient is required' }),
  message: z
    .string()
    .max(300, { message: 'Message must be less than 300 characters' })
    .optional(),
});

export type GuestInvitationFormData = z.infer<typeof guestInvitationSchema>;

// ============================================
// ORDER SCHEMAS
// ============================================

/**
 * Add item to order
 */
export const addOrderItemSchema = z.object({
  menuItemId: z.string().min(1, { message: 'Menu item is required' }),
  quantity: z
    .number()
    .int()
    .min(1, { message: 'Quantity must be at least 1' })
    .max(99, { message: 'Quantity cannot exceed 99' }),
  notes: z
    .string()
    .max(200, { message: 'Notes must be less than 200 characters' })
    .optional(),
  modifiers: z.array(z.string()).optional(),
});

export type AddOrderItemFormData = z.infer<typeof addOrderItemSchema>;

/**
 * Order notes/special instructions
 */
export const orderNotesSchema = z.object({
  notes: z
    .string()
    .max(500, { message: 'Notes must be less than 500 characters' }),
});

export type OrderNotesFormData = z.infer<typeof orderNotesSchema>;

// ============================================
// PAYMENT SCHEMAS
// ============================================

/**
 * Tip amount validation
 */
export const tipSchema = z.object({
  amount: z
    .number()
    .min(0, { message: 'Tip cannot be negative' })
    .max(10000, { message: 'Tip amount exceeds maximum' }),
  percentage: z
    .number()
    .min(0, { message: 'Percentage cannot be negative' })
    .max(100, { message: 'Percentage cannot exceed 100%' })
    .optional(),
});

export type TipFormData = z.infer<typeof tipSchema>;

/**
 * Split payment configuration
 */
export const splitPaymentSchema = z.object({
  mode: z.enum(['equal', 'custom', 'by_item']),
  participants: z
    .array(z.string())
    .min(2, { message: 'At least 2 participants required for split' }),
  amounts: z.record(z.string(), z.number()).optional(),
});

export type SplitPaymentFormData = z.infer<typeof splitPaymentSchema>;

// ============================================
// PROFILE SCHEMAS
// ============================================

/**
 * Update profile form
 */
export const updateProfileSchema = z.object({
  fullName: fullNameSchema,
  phone: optionalPhoneSchema.optional(),
  birthDate: z.string().optional(),
  dietaryPreferences: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

// ============================================
// REVIEW SCHEMAS
// ============================================

/**
 * Restaurant/order review
 */
export const reviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, { message: 'Rating must be at least 1' })
    .max(5, { message: 'Rating cannot exceed 5' }),
  comment: z
    .string()
    .min(10, { message: 'Review must be at least 10 characters' })
    .max(1000, { message: 'Review must be less than 1000 characters' }),
  tags: z.array(z.string()).optional(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

// ============================================
// RESTAURANT APP SCHEMAS
// ============================================

/**
 * Table notes update
 */
export const tableNotesSchema = z.object({
  notes: z
    .string()
    .max(500, { message: 'Notes must be less than 500 characters' }),
});

export type TableNotesFormData = z.infer<typeof tableNotesSchema>;

/**
 * Staff member creation/update
 */
export const staffMemberSchema = z.object({
  name: fullNameSchema,
  email: emailSchema,
  role: z.enum(['owner', 'manager', 'maitre', 'chef', 'bartender', 'waiter']),
  phone: optionalPhoneSchema.optional(),
});

export type StaffMemberFormData = z.infer<typeof staffMemberSchema>;

/**
 * Menu item creation/update
 */
export const menuItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be less than 100 characters' }),
  description: z
    .string()
    .max(500, { message: 'Description must be less than 500 characters' })
    .optional(),
  price: z
    .number()
    .positive({ message: 'Price must be positive' })
    .max(99999.99, { message: 'Price exceeds maximum' }),
  category: z.string().min(1, { message: 'Category is required' }),
  isAvailable: z.boolean().default(true),
  preparationTime: z
    .number()
    .int()
    .min(1, { message: 'Preparation time must be at least 1 minute' })
    .max(180, { message: 'Preparation time cannot exceed 180 minutes' })
    .optional(),
  allergens: z.array(z.string()).optional(),
  calories: z
    .number()
    .int()
    .min(0)
    .max(10000)
    .optional(),
});

export type MenuItemFormData = z.infer<typeof menuItemSchema>;

/**
 * Financial report export
 */
export const financialReportSchema = z.object({
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().min(1, { message: 'End date is required' }),
  format: z.enum(['pdf', 'xlsx', 'csv']),
  includeDetails: z.boolean().default(true),
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
  message: 'Start date must be before or equal to end date',
  path: ['endDate'],
});

export type FinancialReportFormData = z.infer<typeof financialReportSchema>;

// ============================================
// FISCAL SCHEMAS
// ============================================

export const cnpjSchema = z
  .string()
  .trim()
  .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/, { message: 'Invalid CNPJ format' });

export const fiscalConfigSchema = z.object({
  cnpj: cnpjSchema,
  ie: z.string().max(15).optional(),
  razaoSocial: z.string().min(2).max(200),
  nomeFantasia: z.string().max(200).optional(),
  stateCode: z.string().length(2),
  regimeTributario: z.enum(['simples_nacional', 'lucro_presumido', 'lucro_real']),
});
export type FiscalConfigFormData = z.infer<typeof fiscalConfigSchema>;

// ============================================
// PAYMENT CARD SCHEMAS
// ============================================

export const cardNumberSchema = z
  .string()
  .trim()
  .min(13, { message: 'Card number too short' })
  .max(19, { message: 'Card number too long' })
  .regex(/^[\d\s]+$/, { message: 'Card number must contain only digits' });

export const cardSchema = z.object({
  number: cardNumberSchema,
  holderName: z.string().min(2).max(100),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, { message: 'Invalid month' }),
  expiryYear: z.string().regex(/^\d{2,4}$/, { message: 'Invalid year' }),
  cvv: z.string().regex(/^\d{3,4}$/, { message: 'Invalid CVV' }),
});
export type CardFormData = z.infer<typeof cardSchema>;

// ============================================
// ADDRESS SCHEMAS
// ============================================

export const addressSchema = z.object({
  label: z.string().min(1).max(50).optional(),
  street: z.string().min(3).max(200),
  number: z.string().min(1).max(20),
  complement: z.string().max(100).optional(),
  neighborhood: z.string().min(2).max(100),
  city: z.string().min(2).max(100),
  state: z.string().length(2),
  postalCode: z.string().regex(/^\d{5}-?\d{3}$/, { message: 'Invalid CEP format' }),
});
export type AddressFormData = z.infer<typeof addressSchema>;

// ============================================
// BILL/ACCOUNTS PAYABLE SCHEMAS
// ============================================

export const billSchema = z.object({
  description: z.string().min(2).max(200),
  supplier: z.string().min(1).max(200),
  amount: z.number().positive({ message: 'Amount must be positive' }),
  dueDate: z.string().min(1, { message: 'Due date is required' }),
  category: z.string().min(1).optional(),
  isRecurring: z.boolean().default(false),
});
export type BillFormData = z.infer<typeof billSchema>;

// ============================================
// TABLE FORM SCHEMAS
// ============================================

export const tableFormSchema = z.object({
  tableNumber: z.number().int().min(1).max(999),
  seats: z.number().int().min(1).max(50),
  section: z.string().min(1).max(50).optional(),
  shape: z.enum(['round', 'square', 'rectangle']).optional(),
});
export type TableFormData = z.infer<typeof tableFormSchema>;

// ============================================
// RECIPE SCHEMAS
// ============================================

export const recipeIngredientSchema = z.object({
  ingredientId: z.string().min(1),
  quantity: z.number().positive({ message: 'Quantity must be positive' }),
  unit: z.string().min(1),
});

export const recipeSchema = z.object({
  name: z.string().min(2).max(200),
  menuItemId: z.string().optional(),
  ingredients: z.array(recipeIngredientSchema).min(1, { message: 'At least one ingredient required' }),
});
export type RecipeFormData = z.infer<typeof recipeSchema>;

// ============================================
// STOCK ITEM SCHEMAS
// ============================================

export const stockItemSchema = z.object({
  name: z.string().min(2).max(200),
  currentQuantity: z.number().min(0),
  unit: z.string().min(1).max(20),
  minQuantity: z.number().min(0).optional(),
  maxQuantity: z.number().min(0).optional(),
  unitCost: z.number().min(0).optional(),
});
export type StockItemFormData = z.infer<typeof stockItemSchema>;

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Validate form data against a schema and return errors
 */
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  return { success: false, errors };
}

/**
 * Get first error message from Zod validation result
 */
export function getFirstError(result: z.SafeParseError<unknown>): string {
  return result.error.issues[0]?.message || 'Validation failed';
}

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  // Authentication
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  
  // Reservation
  createReservationSchema,
  guestInvitationSchema,
  
  // Order
  addOrderItemSchema,
  orderNotesSchema,
  
  // Payment
  tipSchema,
  splitPaymentSchema,
  
  // Profile
  updateProfileSchema,
  
  // Review
  reviewSchema,
  
  // Restaurant
  tableNotesSchema,
  staffMemberSchema,
  menuItemSchema,
  financialReportSchema,

  // Fiscal
  cnpjSchema,
  fiscalConfigSchema,

  // Card
  cardNumberSchema,
  cardSchema,

  // Address
  addressSchema,

  // Bill
  billSchema,

  // Table Form
  tableFormSchema,

  // Recipe
  recipeIngredientSchema,
  recipeSchema,

  // Stock
  stockItemSchema,

  // Utilities
  validateForm,
  getFirstError,
};
