import { PartialType } from '@nestjs/swagger';
import { CreateCustomizationGroupDto } from './create-customization-group.dto';

export class UpdateCustomizationGroupDto extends PartialType(CreateCustomizationGroupDto) {}
