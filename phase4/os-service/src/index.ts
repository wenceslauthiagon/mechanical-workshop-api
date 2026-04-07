import { createApp } from './app';

(async () => {
  const { app } = await createApp();
  const port = Number(process.env.PORT ?? 3001);

  app.listen(port, () => {
    console.log(`✅ OS service running on port ${port}`);
  });
})().catch(error => {
  console.error('Failed to start OS service:', error);
  process.exit(1);
});
