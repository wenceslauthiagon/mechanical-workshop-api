describe('index', () => {
  const originalExit = process.exit;

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.exit = originalExit;
    delete process.env.PORT;
  });

  it('TC0001 - Should start app and listen on configured port', async () => {
    process.env.PORT = '4567';
    const listen = jest.fn();

    jest.doMock('../../src/app', () => ({
      createApp: jest.fn().mockResolvedValue({ app: { listen } }),
    }));

    await import('../../src/index');
    await new Promise(resolve => setImmediate(resolve));

    expect(listen).toHaveBeenCalledWith(4567);
  });

  it('TC0002 - Should call process.exit(1) when app bootstrap fails', async () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never);

    jest.doMock('../../src/app', () => ({
      createApp: jest.fn().mockRejectedValue(new Error('bootstrap-failed')),
    }));

    await import('../../src/index');
    await new Promise(resolve => setImmediate(resolve));

    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
