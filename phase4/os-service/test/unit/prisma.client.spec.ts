describe('prisma.client', () => {
  const originalExit = process.exit;

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.exit = originalExit;
  });

  it('TC0001 - Should connect database successfully', async () => {
    const connect = jest.fn().mockResolvedValue(undefined);
    const disconnect = jest.fn().mockResolvedValue(undefined);

    jest.doMock('@prisma/client', () => ({
      PrismaClient: jest.fn().mockImplementation(() => ({
        $connect: connect,
        $disconnect: disconnect,
      })),
    }));

    const module = await import('../../src/infra/prisma.client');

    await expect(module.connectDatabase()).resolves.toBeUndefined();
    await expect(module.disconnectDatabase()).resolves.toBeUndefined();
    expect(connect).toHaveBeenCalled();
    expect(disconnect).toHaveBeenCalled();
  });

  it('TC0002 - Should call process.exit when connection fails', async () => {
    const connect = jest.fn().mockRejectedValue(new Error('db-down'));

    jest.doMock('@prisma/client', () => ({
      PrismaClient: jest.fn().mockImplementation(() => ({
        $connect: connect,
        $disconnect: jest.fn(),
      })),
    }));

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
    const module = await import('../../src/infra/prisma.client');

    await module.connectDatabase();

    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
