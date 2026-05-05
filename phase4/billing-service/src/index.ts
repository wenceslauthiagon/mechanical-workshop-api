import './tracing';
import { createApp } from './app';

(async () => {
  const { app } = await createApp();
  const port = Number(process.env.PORT ?? 3002);
  app.listen(port);
})().catch(() => {
  process.exit(1);
});
