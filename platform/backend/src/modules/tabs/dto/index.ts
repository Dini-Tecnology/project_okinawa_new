import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsUUID,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TabType, TabStatus, TabItemStatus, TabMemberStatus } from '@/common/enums';

// ═══════════════════════════════════════════════════════════════
// TAB CREATION & MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export class CreateTabDto {
  @ApiProperty({ description: 'Restaurant ID where tab is being opened' })
  @IsUUID()
  restaurant_id: string;

  @ApiPropertyOptional({ description: 'Table ID if seated at a specific table' })
  @IsOptional()
  @IsUUID()
  table_id?: string;

  @ApiPropertyOptional({ enum: TabType, default: TabType.INDIVIDUAL })
  @IsOptional()
  @IsEnum(TabType)
  type?: TabType;

  @ApiPropertyOptional({ description: 'Credit from cover charge payment' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cover_charge_credit?: number;

  @ApiPropertyOptional({ description: 'Credit from deposit payment' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deposit_credit?: number;

  @ApiPropertyOptional({ description: 'Pre-authorization amount held on card' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  preauth_amount?: number;

  @ApiPropertyOptional({ description: 'Transaction ID from pre-authorization' })
  @IsOptional()
  @IsString()
  preauth_transaction_id?: string;
}

export class JoinTabDto {
  @ApiProperty({ description: 'Invite token to join existing tab' })
  @IsString()
  invite_token: string;

  @ApiPropertyOptional({ description: 'Credit contribution from this member (e.g., their cover charge)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  credit_contribution?: number;
}

export class UpdateTabDto {
  @ApiPropertyOptional({ enum: TabStatus })
  @IsOptional()
  @IsEnum(TabStatus)
  status?: TabStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  table_id?: string;
}

export class CloseTabDto {
  @ApiPropertyOptional({ description: 'Force close even with unpaid balance' })
  @IsOptional()
  @IsBoolean()
  force?: boolean;

  @ApiPropertyOptional({ description: 'Reason for closing' })
  @IsOptional()
  @IsString()
  close_reason?: string;
}

// ═══════════════════════════════════════════════════════════════
// TAB ITEMS
// ═══════════════════════════════════════════════════════════════

export class AddTabItemDto {
  @ApiProperty({ description: 'Menu item ID to add' })
  @IsUUID()
  menu_item_id: string;

  @ApiProperty({ description: 'Quantity to add' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Unit price at time of order' })
  @IsNumber()
  @Min(0)
  unit_price: number;

  @ApiPropertyOptional({ description: 'Discount amount (e.g., from Happy Hour)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_amount?: number;

  @ApiPropertyOptional({ description: 'Reason for discount' })
  @IsOptional()
  @IsString()
  discount_reason?: string;

  @ApiPropertyOptional({ description: 'Item customizations' })
  @IsOptional()
  customizations?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Special preparation instructions' })
  @IsOptional()
  @IsString()
  special_instructions?: string;

  @ApiPropertyOptional({ description: 'Flag indicating this is a round repeat' })
  @IsOptional()
  @IsBoolean()
  is_round_repeat?: boolean;
}

export class AddMultipleTabItemsDto {
  @ApiProperty({ type: [AddTabItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddTabItemDto)
  items: AddTabItemDto[];
}

export class UpdateTabItemStatusDto {
  @ApiProperty({ enum: TabItemStatus })
  @IsEnum(TabItemStatus)
  status: TabItemStatus;
}

export class CancelTabItemDto {
  @ApiProperty({ description: 'Reason for cancellation' })
  @IsString()
  reason: string;
}

// ═══════════════════════════════════════════════════════════════
// TAB MEMBERS
// ═══════════════════════════════════════════════════════════════

export class InviteMemberDto {
  @ApiPropertyOptional({ description: 'User ID if known' })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiPropertyOptional({ description: 'Phone number for SMS invite' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Email for email invite' })
  @IsOptional()
  @IsString()
  email?: string;
}

export class UpdateMemberDto {
  @ApiPropertyOptional({ enum: TabMemberStatus })
  @IsOptional()
  @IsEnum(TabMemberStatus)
  status?: TabMemberStatus;

  @ApiPropertyOptional({ description: 'Whether member can place orders without host approval' })
  @IsOptional()
  @IsBoolean()
  can_order?: boolean;
}

export class RemoveMemberDto {
  @ApiProperty({ description: 'Reason for removal' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ description: 'Force removal even if member has unpaid items' })
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// PAYMENTS & SPLIT
// ═══════════════════════════════════════════════════════════════

export enum SplitType {
  BY_CONSUMPTION = 'by_consumption',
  EQUAL = 'equal',
  CUSTOM = 'custom',
  SINGLE_PAYER = 'single_payer',
}

export class SplitShareDto {
  @ApiProperty()
  @IsUUID()
  user_id: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Specific item IDs this share covers' })
  @IsOptional()
  @IsArray()
  item_ids?: string[];
}

export class CalculateSplitDto {
  @ApiProperty({ enum: SplitType })
  @IsEnum(SplitType)
  split_type: SplitType;

  @ApiPropertyOptional({ description: 'Custom shares for CUSTOM split type' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SplitShareDto)
  custom_shares?: SplitShareDto[];

  @ApiPropertyOptional({ description: 'Whether to include credits in calculation' })
  @IsOptional()
  @IsBoolean()
  apply_credits?: boolean;
}

export class ProcessTabPaymentDto {
  @ApiProperty({ description: 'Amount to pay' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Tip amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tip_amount?: number;

  @ApiProperty({ description: 'Payment method identifier' })
  @IsString()
  payment_method: string;

  @ApiPropertyOptional({ description: 'External transaction ID' })
  @IsOptional()
  @IsString()
  transaction_id?: string;

  @ApiPropertyOptional({ description: 'Additional payment metadata' })
  @IsOptional()
  payment_details?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Specific item IDs this payment covers' })
  @IsOptional()
  @IsArray()
  item_ids?: string[];

  @ApiPropertyOptional({ description: 'Idempotency key to prevent duplicate payments' })
  @IsOptional()
  @IsString()
  idempotency_key?: string;
}

// ═══════════════════════════════════════════════════════════════
// WAITER CALLS
// ═══════════════════════════════════════════════════════════════

export enum WaiterCallReason {
  ORDER = 'order',
  BILL = 'bill',
  QUESTION = 'question',
  REFILL = 'refill',
  ASSISTANCE = 'assistance',
  OTHER = 'other',
}

export class CreateWaiterCallDto {
  @ApiProperty({ description: 'Restaurant ID' })
  @IsUUID()
  restaurant_id: string;

  @ApiPropertyOptional({ description: 'Table ID if known' })
  @IsOptional()
  @IsUUID()
  table_id?: string;

  @ApiPropertyOptional({ description: 'Tab ID if associated' })
  @IsOptional()
  @IsUUID()
  tab_id?: string;

  @ApiProperty({ enum: WaiterCallReason })
  @IsEnum(WaiterCallReason)
  reason: WaiterCallReason;

  @ApiPropertyOptional({ description: 'Additional notes for the waiter' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AcknowledgeWaiterCallDto {
  @ApiPropertyOptional({ description: 'Response message to customer' })
  @IsOptional()
  @IsString()
  response_message?: string;

  @ApiPropertyOptional({ description: 'Estimated arrival time in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30)
  eta_minutes?: number;
}

// ═══════════════════════════════════════════════════════════════
// HAPPY HOUR
// ═══════════════════════════════════════════════════════════════

export enum HappyHourDiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  BOGO = 'bogo', // Buy One Get One
}

export enum HappyHourAppliesTo {
  ALL = 'all',
  CATEGORIES = 'categories',
  ITEMS = 'items',
}

export class CreateHappyHourScheduleDto {
  @ApiProperty({ description: 'Restaurant ID' })
  @IsUUID()
  restaurant_id: string;

  @ApiProperty({ description: 'Promotion name (e.g., "Happy Hour", "Dose Dupla")' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Detailed description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Days of the week (mon, tue, wed, thu, fri, sat, sun)' })
  @IsArray()
  days: string[];

  @ApiProperty({ description: 'Start time (HH:mm format)' })
  @IsString()
  start_time: string;

  @ApiProperty({ description: 'End time (HH:mm format)' })
  @IsString()
  end_time: string;

  @ApiProperty({ enum: HappyHourDiscountType })
  @IsEnum(HappyHourDiscountType)
  discount_type: HappyHourDiscountType;

  @ApiProperty({ description: 'Discount value (percentage or fixed amount)' })
  @IsNumber()
  @Min(0)
  discount_value: number;

  @ApiPropertyOptional({ enum: HappyHourAppliesTo, default: HappyHourAppliesTo.ALL })
  @IsOptional()
  @IsEnum(HappyHourAppliesTo)
  applies_to?: HappyHourAppliesTo;

  @ApiPropertyOptional({ description: 'Category IDs if applies_to is CATEGORIES' })
  @IsOptional()
  @IsArray()
  category_ids?: string[];

  @ApiPropertyOptional({ description: 'Item IDs if applies_to is ITEMS' })
  @IsOptional()
  @IsArray()
  item_ids?: string[];

  @ApiPropertyOptional({ description: 'Whether promotion is currently active' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateHappyHourScheduleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  days?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  start_time?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  end_time?: string;

  @ApiPropertyOptional({ enum: HappyHourDiscountType })
  @IsOptional()
  @IsEnum(HappyHourDiscountType)
  discount_type?: HappyHourDiscountType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  discount_value?: number;

  @ApiPropertyOptional({ enum: HappyHourAppliesTo })
  @IsOptional()
  @IsEnum(HappyHourAppliesTo)
  applies_to?: HappyHourAppliesTo;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  category_ids?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  item_ids?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// REPEAT ROUND
// ═══════════════════════════════════════════════════════════════

export class RepeatRoundDto {
  @ApiPropertyOptional({ description: 'Specific member IDs to repeat orders for' })
  @IsOptional()
  @IsArray()
  member_ids?: string[];

  @ApiPropertyOptional({ description: 'Exclude specific item IDs from repeat' })
  @IsOptional()
  @IsArray()
  exclude_item_ids?: string[];

  @ApiPropertyOptional({ description: 'Include items from last N minutes' })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(120)
  last_minutes?: number;
}

// ═══════════════════════════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════════════════════════

export class TabSummaryDto {
  id: string;
  status: TabStatus;
  type: TabType;
  restaurant_id: string;
  table_id: string | null;
  host_user_id: string;
  members_count: number;
  items_count: number;
  subtotal: number;
  total_discount: number;
  available_credits: number;
  total_paid: number;
  balance_due: number;
  created_at: Date;
}

export class SplitOptionsDto {
  tab_id: string;
  subtotal: number;
  total_discount: number;
  available_credits: number;
  balance_due: number;
  options: {
    by_consumption: SplitShareDto[];
    equal: SplitShareDto[];
  };
  members: {
    user_id: string;
    name: string;
    items_ordered: number;
    individual_total: number;
  }[];
}

export class ActiveHappyHourDto {
  id: string;
  name: string;
  description: string | null;
  discount_type: HappyHourDiscountType;
  discount_value: number;
  applies_to: HappyHourAppliesTo;
  ends_at: string; // HH:mm
  category_ids: string[];
  item_ids: string[];
}

export class WaiterCallStatusDto {
  id: string;
  status: string;
  reason: WaiterCallReason;
  acknowledged_at: Date | null;
  eta_minutes: number | null;
  response_message: string | null;
}
