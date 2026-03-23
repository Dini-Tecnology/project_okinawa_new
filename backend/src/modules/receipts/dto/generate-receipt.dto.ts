import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateReceiptDto {
  @ApiProperty({ description: 'Order ID to generate receipt for' })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({ required: false, description: 'Payment ID associated with the order' })
  @IsOptional()
  @IsString()
  paymentId?: string;
}
