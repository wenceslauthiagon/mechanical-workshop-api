import { AxiosFactory } from '../../../src/infrastructure/http/AxiosFactory';
import axios, { AxiosInstance } from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AxiosFactory', () => {
  let mockAxiosInstance: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Reset the singleton instance
    (AxiosFactory as any).instance = null;

    // Mock axios instance
    mockAxiosInstance = {
      create: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn(),
        },
        response: {
          use: jest.fn(),
        },
      },
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      head: jest.fn(),
      options: jest.fn(),
      defaults: {},
    } as any;

    mockedAxios.create.mockReturnValue(mockAxiosInstance);
  });

  it('Should be defined', () => {
    expect(AxiosFactory).toBeDefined();
  });

  describe('getInstance', () => {
    it('TC0001 - Should create and return axios instance', () => {
      const instance = AxiosFactory.getInstance();

      expect(mockedAxios.create).toHaveBeenCalledWith({
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json',
        },
        maxRedirects: 10,
        maxContentLength: 50 * 1000 * 1000,
        httpAgent: expect.any(Object),
        httpsAgent: expect.any(Object),
      });

      expect(instance).toBe(mockAxiosInstance);
    });

    it('TC0002 - Should return same instance on multiple calls (singleton)', () => {
      const instance1 = AxiosFactory.getInstance();
      const instance2 = AxiosFactory.getInstance();

      expect(instance1).toBe(instance2);
      expect(mockedAxios.create).toHaveBeenCalledTimes(1);
    });

    it('TC0003 - Should configure request interceptor', () => {
      AxiosFactory.getInstance();

      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
      );
    });

    it('TC0004 - Should configure response interceptor', () => {
      AxiosFactory.getInstance();

      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
      );
    });

    it('TC0005 - Should create axios instance with correct configuration', () => {
      AxiosFactory.getInstance();

      const createCall = mockedAxios.create.mock.calls[0][0];

      expect(createCall).toEqual({
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json',
        },
        maxRedirects: 10,
        maxContentLength: 50000000,
        httpAgent: expect.any(Object),
        httpsAgent: expect.any(Object),
      });
    });
  });

  describe('interceptors', () => {
    it('TC0001 - Should configure interceptors', () => {
      AxiosFactory.getInstance();

      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
      );

      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
      );
    });
  });

  describe('singleton pattern', () => {
    it('TC0001 - Should maintain singleton pattern across different calls', () => {
      const instance1 = AxiosFactory.getInstance();
      const instance2 = AxiosFactory.getInstance();
      const instance3 = AxiosFactory.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
      expect(mockedAxios.create).toHaveBeenCalledTimes(1);
    });

    it('TC0002 - Should recreate instance when reset', () => {
      const instance1 = AxiosFactory.getInstance();

      // Reset singleton for testing - create new mock for second instance
      (AxiosFactory as any).instance = null;
      const mockAxiosInstance2 = {
        ...mockAxiosInstance,
        create: jest.fn(),
      };
      mockedAxios.create.mockReturnValueOnce(mockAxiosInstance2 as any);

      const instance2 = AxiosFactory.getInstance();

      expect(instance1).not.toBe(instance2);
      expect(mockedAxios.create).toHaveBeenCalledTimes(2);
    });
  });
});
