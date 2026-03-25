import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LegalService, LegalDocument } from './legal.service';
import * as fs from 'fs';

// Mock the fs module to avoid reading actual files during tests
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

describe('LegalService', () => {
  let service: LegalService;

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

  const mockPrivacyPolicyEsES: LegalDocument = {
    title: 'Politica de Privacidad',
    content: '## Politica de Privacidad de Okinawa',
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

  const mockTermsEsES: LegalDocument = {
    title: 'Terminos de Servicio',
    content: '## Terminos de Servicio de Okinawa',
    version: '1.0.0',
    lastUpdated: '2026-03-01',
  };

  const fileContents: Record<string, string> = {
    'privacy-policy.pt-BR.json': JSON.stringify(mockPrivacyPolicyPtBR),
    'privacy-policy.en-US.json': JSON.stringify(mockPrivacyPolicyEnUS),
    'privacy-policy.es-ES.json': JSON.stringify(mockPrivacyPolicyEsES),
    'terms-of-service.pt-BR.json': JSON.stringify(mockTermsPtBR),
    'terms-of-service.en-US.json': JSON.stringify(mockTermsEnUS),
    'terms-of-service.es-ES.json': JSON.stringify(mockTermsEsES),
  };

  beforeEach(async () => {
    (fs.readFileSync as jest.Mock).mockImplementation((filePath: string) => {
      // Extract filename from the full path
      const parts = filePath.split('/');
      const fileName = parts[parts.length - 1];
      if (fileContents[fileName]) {
        return fileContents[fileName];
      }
      throw new Error('File not found');
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [LegalService],
    }).compile();

    service = module.get<LegalService>(LegalService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ────────── Privacy Policy ──────────

  describe('getPrivacyPolicy', () => {
    it('should return privacy policy in default language (pt-BR) when no lang is specified', () => {
      const result = service.getPrivacyPolicy();

      expect(result.title).toBe(mockPrivacyPolicyPtBR.title);
      expect(result.content).toBe(mockPrivacyPolicyPtBR.content);
      expect(result.version).toBe('1.0.0');
      expect(result.lastUpdated).toBeDefined();
    });

    it('should return privacy policy in pt-BR when explicitly requested', () => {
      const result = service.getPrivacyPolicy('pt-BR');

      expect(result.title).toBe(mockPrivacyPolicyPtBR.title);
    });

    it('should return privacy policy in en-US', () => {
      const result = service.getPrivacyPolicy('en-US');

      expect(result.title).toBe(mockPrivacyPolicyEnUS.title);
      expect(result.content).toBe(mockPrivacyPolicyEnUS.content);
    });

    it('should return privacy policy in es-ES', () => {
      const result = service.getPrivacyPolicy('es-ES');

      expect(result.title).toBe(mockPrivacyPolicyEsES.title);
      expect(result.content).toBe(mockPrivacyPolicyEsES.content);
    });

    it('should fall back to pt-BR for unsupported language', () => {
      const result = service.getPrivacyPolicy('fr-FR');

      expect(result.title).toBe(mockPrivacyPolicyPtBR.title);
    });

    it('should fall back to pt-BR for undefined language', () => {
      const result = service.getPrivacyPolicy(undefined);

      expect(result.title).toBe(mockPrivacyPolicyPtBR.title);
    });
  });

  // ────────── Terms of Service ──────────

  describe('getTermsOfService', () => {
    it('should return terms of service in default language (pt-BR) when no lang is specified', () => {
      const result = service.getTermsOfService();

      expect(result.title).toBe(mockTermsPtBR.title);
      expect(result.content).toBe(mockTermsPtBR.content);
      expect(result.version).toBe('1.0.0');
    });

    it('should return terms of service in en-US', () => {
      const result = service.getTermsOfService('en-US');

      expect(result.title).toBe(mockTermsEnUS.title);
    });

    it('should return terms of service in es-ES', () => {
      const result = service.getTermsOfService('es-ES');

      expect(result.title).toBe(mockTermsEsES.title);
    });

    it('should fall back to pt-BR for unsupported language', () => {
      const result = service.getTermsOfService('ja-JP');

      expect(result.title).toBe(mockTermsPtBR.title);
    });
  });

  // ────────── Edge Cases ──────────

  describe('edge cases', () => {
    it('should throw NotFoundException when document file is missing for all languages', () => {
      // Re-create service with no files loaded
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('File not found');
      });

      // Access private method via any cast to force a missing document scenario
      const emptyService = Object.create(LegalService.prototype);
      emptyService.contentDir = '/nonexistent';
      emptyService.cache = new Map();

      expect(() => {
        (emptyService as any).getDocument('privacy-policy', 'pt-BR');
      }).toThrow(NotFoundException);
    });

    it('should preload content on instantiation', () => {
      // readFileSync should have been called for 6 files (2 docs x 3 languages)
      expect(fs.readFileSync).toHaveBeenCalledTimes(6);
    });

    it('should handle empty string language gracefully', () => {
      const result = service.getPrivacyPolicy('');

      // Empty string is not in SUPPORTED_LANGUAGES, so it falls back to pt-BR
      expect(result.title).toBe(mockPrivacyPolicyPtBR.title);
    });

    it('should cache documents and return consistent results on repeated calls', () => {
      const first = service.getPrivacyPolicy('en-US');
      const second = service.getPrivacyPolicy('en-US');

      expect(first).toEqual(second);
      // readFileSync should not have been called again after initial preload
      expect(fs.readFileSync).toHaveBeenCalledTimes(6);
    });
  });
});
