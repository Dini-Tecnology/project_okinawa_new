import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateConfigDto } from './create-config.dto';

/**
 * DTO for updating the entire restaurant config (partial)
 */
export class UpdateConfigDto extends PartialType(
  OmitType(CreateConfigDto, ['restaurantId'] as const),
) {}
