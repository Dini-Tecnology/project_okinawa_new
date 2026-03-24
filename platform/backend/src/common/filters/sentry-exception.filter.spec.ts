import { Test, TestingModule } from '@nestjs/testing';
import { SentryExceptionFilter } from './sentry-exception.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import * as Sentry from '@sentry/node';

jest.mock('@sentry/node');

describe('SentryExceptionFilter', () => {
  let filter: SentryExceptionFilter;
  let mockArgumentsHost: ArgumentsHost;

  let mockRequest: any = {
    method: 'GET',
    url: '/test',
    headers: { 'user-agent': 'test' },
    body: {},
    query: {},
    params: {},
    user: null,
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [SentryExceptionFilter],
    }).compile();

    filter = module.get<SentryExceptionFilter>(SentryExceptionFilter);

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
      getType: jest.fn().mockReturnValue('http'),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should set request context in Sentry', () => {
    const exception = new Error('Test error');
    const superCatchSpy = jest.spyOn(Object.getPrototypeOf(SentryExceptionFilter.prototype), 'catch');
    superCatchSpy.mockImplementation(() => {});

    filter.catch(exception, mockArgumentsHost);

    expect(Sentry.setContext).toHaveBeenCalledWith('request', {
      method: 'GET',
      url: '/test',
      headers: { 'user-agent': 'test' },
      body: {},
      query: {},
      params: {},
    });
  });

  it('should set user context when user is present', () => {
    mockRequest.user = { id: 'user-1', email: 'test@example.com', full_name: 'Test User' };
    const exception = new Error('Test error');
    const superCatchSpy = jest.spyOn(Object.getPrototypeOf(SentryExceptionFilter.prototype), 'catch');
    superCatchSpy.mockImplementation(() => {});

    filter.catch(exception, mockArgumentsHost);

    expect(Sentry.setUser).toHaveBeenCalledWith({
      id: 'user-1',
      email: 'test@example.com',
      username: 'Test User',
    });

    mockRequest.user = null;
  });

  it('should capture 500+ errors in Sentry', () => {
    const exception = new HttpException('Internal error', HttpStatus.INTERNAL_SERVER_ERROR);
    const superCatchSpy = jest.spyOn(Object.getPrototypeOf(SentryExceptionFilter.prototype), 'catch');
    superCatchSpy.mockImplementation(() => {});

    filter.catch(exception, mockArgumentsHost);

    expect(Sentry.captureException).toHaveBeenCalledWith(exception);
  });

  it('should not capture 4xx errors in Sentry', () => {
    const exception = new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    const superCatchSpy = jest.spyOn(Object.getPrototypeOf(SentryExceptionFilter.prototype), 'catch');
    superCatchSpy.mockImplementation(() => {});

    filter.catch(exception, mockArgumentsHost);

    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('should capture non-HTTP exceptions', () => {
    const exception = new Error('Non-HTTP error');
    const superCatchSpy = jest.spyOn(Object.getPrototypeOf(SentryExceptionFilter.prototype), 'catch');
    superCatchSpy.mockImplementation(() => {});

    filter.catch(exception, mockArgumentsHost);

    expect(Sentry.captureException).toHaveBeenCalledWith(exception);
  });

  it('should call super.catch', () => {
    const exception = new Error('Test error');
    const superCatchSpy = jest.spyOn(Object.getPrototypeOf(SentryExceptionFilter.prototype), 'catch');
    superCatchSpy.mockImplementation(() => {});

    filter.catch(exception, mockArgumentsHost);

    expect(superCatchSpy).toHaveBeenCalledWith(exception, mockArgumentsHost);
  });
});
