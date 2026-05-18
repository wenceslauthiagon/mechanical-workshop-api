describe('tracing bootstrap', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('TC0001 - Should initialize dd-trace when enabled and not in test env', () => {
    const init = jest.fn();
    process.env.DD_TRACE_ENABLED = 'true';
    process.env.NODE_ENV = 'development';

    jest.doMock('dd-trace', () => ({ init }));

    jest.isolateModules(() => {
      require('../../src/tracing');
    });

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        service: 'billing-service',
        env: 'development',
        logInjection: true,
        runtimeMetrics: true,
      }),
    );
  });

  it('TC0002 - Should not initialize dd-trace when disabled', () => {
    const init = jest.fn();
    process.env.DD_TRACE_ENABLED = 'false';
    process.env.NODE_ENV = 'development';

    jest.doMock('dd-trace', () => ({ init }));

    jest.isolateModules(() => {
      require('../../src/tracing');
    });

    expect(init).not.toHaveBeenCalled();
  });

  it('TC0003 - Should not initialize dd-trace in test environment', () => {
    const init = jest.fn();
    process.env.DD_TRACE_ENABLED = 'true';
    process.env.NODE_ENV = 'test';

    jest.doMock('dd-trace', () => ({ init }));

    jest.isolateModules(() => {
      require('../../src/tracing');
    });

    expect(init).not.toHaveBeenCalled();
  });
});
