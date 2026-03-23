import { IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResolveApprovalDto {
  @ApiProperty({
    description: 'Decision: approved or rejected',
    enum: ['approved', 'rejected'],
  })
  @IsNotEmpty()
  @IsIn(['approved', 'rejected'], { message: 'Decision must be approved or rejected' })
  decision: 'approved' | 'rejected';

  @ApiProperty({ required: false, description: 'Optional note from the manager' })
  @IsOptional()
  @IsString()
  note?: string;
}
