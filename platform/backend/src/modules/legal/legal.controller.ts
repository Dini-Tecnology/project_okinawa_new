import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { LegalService, LegalDocument } from './legal.service';

@ApiTags('legal')
@Controller('legal')
export class LegalController {
  constructor(private readonly legalService: LegalService) {}

  @Get('privacy-policy')
  @Public()
  @ApiOperation({ summary: 'Get privacy policy content' })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Language code (pt-BR, en-US, es-ES). Defaults to pt-BR.',
    enum: ['pt-BR', 'en-US', 'es-ES'],
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the privacy policy document',
  })
  getPrivacyPolicy(@Query('lang') lang?: string): LegalDocument {
    return this.legalService.getPrivacyPolicy(lang);
  }

  @Get('terms-of-service')
  @Public()
  @ApiOperation({ summary: 'Get terms of service content' })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Language code (pt-BR, en-US, es-ES). Defaults to pt-BR.',
    enum: ['pt-BR', 'en-US', 'es-ES'],
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the terms of service document',
  })
  getTermsOfService(@Query('lang') lang?: string): LegalDocument {
    return this.legalService.getTermsOfService(lang);
  }
}
