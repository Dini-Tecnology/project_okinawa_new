import { Test, TestingModule } from '@nestjs/testing';
import { LegalController } from './legal.controller';
import { LegalService, LegalDocument } from './legal.service';

describe('LegalController', () => {
  let controller: LegalController;
  let legalService: jest.Mocked<LegalService>;

  const mockPrivacyPolicyPtBR: LegalDocument = {
    title: 'Politica de Privacidade',
    content: '## Politica de Privacidade da Okinawa',
    version: '1.0.0',
    lastUpdated: '2026-03-01',
  };

  const mockPrivacyPolicyEnUS: LegalDocument = {
    title: 'Privacy Policy',
    content: '## Okinawa Privacy Policy',
    version: '1.0.0',
    lastUpdated: '2026-03-01',
  };

  const mockTermsPtBR: LegalDocument = {
    title: 'Termos de Servico',
    content: '## Termos de Servico da Okinawa',
    version: '1.0.0',
    lastUpdated: '2026-03-01',
  };

  const mockTermsEnUS: LegalDocument = {
    title: 'Terms of Service',
    content: '## Okinawa Terms of Service',
    version: '1.0.0',
    lastUpdated: '2026-03-01',
  };

  beforeEach(async () => {
    const mockLegalService = {
      getPrivacyPolicy: jest.fn(),
      getTermsOfService: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LegalController],
      providers: [
        { provide: LegalService, useValue: mockLegalService },
      ],
    }).compile();

    controller = module.get<LegalController>(LegalController);
    legalService = module.get(LegalService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ────────── GET /legal/privacy-policy ──────────

  describe('getPrivacyPolicy', () => {
    it('should return privacy policy with default language when no lang provided', () => {
      legalService.getPrivacyPolicy.mockReturnValue(mockPrivacyPolicyPtBR);

      const result = controller.getPrivacyPolicy();

      expect(result).toEqual(mockPrivacyPolicyPtBR);
      expect(legalService.getPrivacyPolicy).toHaveBeenCalledWith(undefined);
    });

    it('should return privacy policy in pt-BR', () => {
      legalService.getPrivacyPolicy.mockReturnValue(mockPrivacyPolicyPtBR);

      const result = controller.getPrivacyPolicy('pt-BR');

      expect(result.title).toBe('Politica de Privacidade');
      expect(legalService.getPrivacyPolicy).toHaveBeenCalledWith('pt-BR');
    });

    it('should return privacy policy in en-US', () => {
      legalService.getPrivacyPolicy.mockReturnValue(mockPrivacyPolicyEnUS);

      const result = controller.getPrivacyPolicy('en-US');

      expect(result.title).toBe('Privacy Policy');
      expect(legalService.getPrivacyPolicy).toHaveBeenCalledWith('en-US');
    });

    it('should pass through unsupported language to service for fallback handling', () => {
      legalService.getPrivacyPolicy.mockReturnValue(mockPrivacyPolicyPtBR);

      const result = controller.getPrivacyPolicy('fr-FR');

      expect(result).toEqual(mockPrivacyPolicyPtBR);
      expect(legalService.getPrivacyPolicy).toHaveBeenCalledWith('fr-FR');
    });

    it('should return a document with all required fields', () => {
      legalService.getPrivacyPolicy.mockReturnValue(mockPrivacyPolicyPtBR);

      const result = controller.getPrivacyPolicy();

      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('lastUpdated');
    });
  });

  // ────────── GET /legal/terms-of-service ──────────

  describe('getTermsOfService', () => {
    it('should return terms of service with default language when no lang provided', () => {
      legalService.getTermsOfService.mockReturnValue(mockTermsPtBR);

      const result = controller.getTermsOfService();

      expect(result).toEqual(mockTermsPtBR);
      expect(legalService.getTermsOfService).toHaveBeenCalledWith(undefined);
    });

    it('should return terms of service in pt-BR', () => {
      legalService.getTermsOfService.mockReturnValue(mockTermsPtBR);

      const result = controller.getTermsOfService('pt-BR');

      expect(result.title).toBe('Termos de Servico');
      expect(legalService.getTermsOfService).toHaveBeenCalledWith('pt-BR');
    });

    it('should return terms of service in en-US', () => {
      legalService.getTermsOfService.mockReturnValue(mockTermsEnUS);

      const result = controller.getTermsOfService('en-US');

      expect(result.title).toBe('Terms of Service');
      expect(legalService.getTermsOfService).toHaveBeenCalledWith('en-US');
    });

    it('should pass through unsupported language to service for fallback handling', () => {
      legalService.getTermsOfService.mockReturnValue(mockTermsPtBR);

      const result = controller.getTermsOfService('ja-JP');

      expect(result).toEqual(mockTermsPtBR);
      expect(legalService.getTermsOfService).toHaveBeenCalledWith('ja-JP');
    });

    it('should return a document with all required fields', () => {
      legalService.getTermsOfService.mockReturnValue(mockTermsEnUS);

      const result = controller.getTermsOfService('en-US');

      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('lastUpdated');
    });
  });
});
