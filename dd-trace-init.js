// Datadog Tracer - DEVE ser inicializado PRIMEIRO
const tracer = require('dd-trace').init({
  logInjection: true,
  debug: true,
  tracer: {
    logLevel: 'info',
  },
  // Captura de requisições HTTP
  http: {
    enabled: true,
  },
});

module.exports = tracer;
