import { createApp } from './app';

const { app } = createApp((topic, payload) => {
  console.log(`[EVENT] ${topic}:`, payload);
});

const port = Number(process.env.PORT ?? 3003);
app.listen(port, () => {
  console.log(`Execution service running on ${port}`);
});
