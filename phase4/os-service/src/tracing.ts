const ddTraceEnabled = process.env.DD_TRACE_ENABLED === 'true';
const ddEnv = process.env.DD_ENV ?? process.env.NODE_ENV ?? 'development';
const ddConfigLog = {
  service: process.env.DD_SERVICE ?? 'os-service',
  env: ddEnv,
  version: process.env.DD_VERSION ?? 'dev',
  agentHost: process.env.DD_AGENT_HOST ?? 'localhost',
  agentPort: process.env.DD_TRACE_AGENT_PORT ?? '8126',
  traceEnabled: ddTraceEnabled,
  logsInjection: true,
  runtimeMetrics: true,
};

if (ddTraceEnabled && process.env.NODE_ENV !== 'test') {
  console.log(`Datadog APM habilitado (ambiente: ${ddEnv})`);
  console.log(JSON.stringify(ddConfigLog));

  require('dd-trace').init({
    service: process.env.DD_SERVICE ?? 'os-service',
    env: ddEnv,
    version: process.env.DD_VERSION ?? 'dev',
    logInjection: true,
    runtimeMetrics: true,
  });
} else if (process.env.NODE_ENV !== 'test') {
  console.log(`Datadog APM desabilitado (ambiente: ${ddEnv})`);
  console.log(JSON.stringify(ddConfigLog));
}

export {};