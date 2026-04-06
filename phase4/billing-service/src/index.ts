import { createApp } from './app';

const { app } = createApp((topic, payload) => {
  console.log(`[EVENT] ${topic}:`, payload);
});

const port = Number(process.env.PORT ?? 3002);
app.listen(port, () => {
  console.log(`Billing service running on ${port}`);
});
