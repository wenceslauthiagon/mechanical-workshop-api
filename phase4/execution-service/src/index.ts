import { createApp } from './app';

(async () => {
  const { app } = await createApp();
  const port = Number(process.env.PORT ?? 3003);
  app.listen(port, () => {
    console.log(`✅ Execution service running on port ${port}`);
  });
})().catch(error => {
  console.error('Failed to start execution service:', error);
  process.exit(1);
});
