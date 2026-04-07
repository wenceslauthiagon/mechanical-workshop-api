import { createApp } from './app';

(async () => {
  const { app } = await createApp();
  const port = Number(process.env.PORT ?? 3001);

  app.listen(port);
})().catch(error => {
  void error;
  process.exit(1);
});
