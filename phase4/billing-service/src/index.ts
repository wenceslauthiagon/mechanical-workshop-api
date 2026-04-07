import { createApp } from './app';

(async () => {
  const { app } = await createApp();
  const port = Number(process.env.PORT ?? 3002);
  app.listen(port, () => {
    console.log(`✅ Billing service running on port ${port}`);
  });
})().catch(error => {
  console.error('Failed to start billing service:', error);
  process.exit(1);
});
