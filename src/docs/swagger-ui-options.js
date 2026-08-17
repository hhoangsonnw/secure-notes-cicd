const swaggerUiOptions = {
  customSiteTitle: "Secure Notes · API Lab",
  customCss: `
    html, body { background: #0d1117; }
    body { color: #e6edf3; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
    .swagger-ui {
      background: radial-gradient(circle at top left, #12302c 0, #0d1117 38rem);
      color: #e6edf3;
      min-height: 100vh;
      padding-bottom: 4rem;
    }
    .swagger-ui .topbar { display: none; }
    .swagger-ui .wrapper { max-width: 1160px; padding: 0 24px; }
    .swagger-ui .info {
      background: rgba(22, 27, 34, .92);
      border: 1px solid #30363d;
      border-radius: 16px;
      box-shadow: 0 18px 48px rgba(0, 0, 0, .2);
      margin: 2rem 0 1.5rem;
      padding: 1.8rem 2rem 1.55rem;
    }
    .swagger-ui .info .title { color: #f0f6fc; font-size: clamp(2rem, 5vw, 3.1rem); letter-spacing: -.04em; line-height: 1.08; }
    .swagger-ui .info .title small { background: #12372e; border-radius: 99px; color: #7ee787; line-height: 1; padding: .18rem .52rem; vertical-align: middle; }
    .swagger-ui .info .markdown { max-width: 52rem; }
    .swagger-ui .info .markdown p { margin: .8em 0; }
    .swagger-ui .info p, .swagger-ui .info li { color: #c9d1d9; line-height: 1.6; }
    .swagger-ui .info code { background: #010409; border-radius: 5px; color: #79c0ff; padding: .14rem .32rem; }
    .swagger-ui .info .markdown blockquote {
      border-left: 3px solid #3fb950;
      color: #7ee787;
      font-weight: 700;
      margin: 0;
      padding-left: .8rem;
    }
    .swagger-ui .info .markdown blockquote p { color: inherit; margin: 0; }
    .swagger-ui .scheme-container {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      box-shadow: none;
      margin: 0 0 1.5rem;
    }
    .swagger-ui .opblock-tag {
      border-bottom: 1px solid #30363d;
      color: #f0f6fc;
      font-size: 1.45rem;
      line-height: 1.25;
      padding: 1.4rem 0 .8rem;
    }
    .swagger-ui .opblock-tag small { color: #8b949e; font-size: .9rem; }
    .swagger-ui .opblock {
      border-radius: 10px;
      margin: 0 0 .8rem;
      overflow: hidden;
    }
    .swagger-ui .opblock .opblock-summary { align-items: center; padding: .8rem 1rem; }
    .swagger-ui .opblock .opblock-summary-method { letter-spacing: .03em; min-width: 64px; text-align: center; }
    .swagger-ui .opblock .opblock-summary-path { color: #f0f6fc; font-weight: 700; letter-spacing: -.015em; overflow-wrap: anywhere; }
    .swagger-ui .opblock .opblock-summary-description { color: #f0f6fc; line-height: 1.35; }
    .swagger-ui .opblock .opblock-body,
    .swagger-ui .opblock .opblock-section-header { background: #161b22; }
    .swagger-ui .opblock .opblock-section-header h4,
    .swagger-ui .opblock .opblock-section-header label,
    .swagger-ui .opblock p,
    .swagger-ui .opblock td,
    .swagger-ui .opblock th { color: #c9d1d9; }
    .swagger-ui .opblock-description-wrapper p,
    .swagger-ui .response-col_description__inner p { color: #c9d1d9; }
    .swagger-ui table thead tr td,
    .swagger-ui table thead tr th { border-color: #30363d; color: #8b949e; }
    .swagger-ui table tbody tr td { border-color: #30363d; }
    .swagger-ui .model-box,
    .swagger-ui .highlight-code,
    .swagger-ui .microlight { background: #010409 !important; }
    .swagger-ui .model,
    .swagger-ui .model-title,
    .swagger-ui .prop-type { color: #79c0ff; }
    .swagger-ui .btn.authorize {
      border-color: #3fb950;
      color: #7ee787;
    }
    .swagger-ui .btn.authorize svg { fill: #3fb950; }
    .swagger-ui .btn.execute { background: #238636; border-color: #3fb950; color: #fff; }
    .swagger-ui .btn.cancel { border-color: #8b949e; color: #c9d1d9; }
    .swagger-ui .btn:focus-visible { outline: 3px solid rgba(63, 185, 80, .48); outline-offset: 2px; }
    .swagger-ui input[type=text],
    .swagger-ui textarea,
    .swagger-ui select {
      background: #0d1117;
      border-color: #484f58;
      color: #f0f6fc;
    }
    .swagger-ui input:focus, .swagger-ui textarea:focus, .swagger-ui select:focus {
      outline: 3px solid rgba(63, 185, 80, .25);
      outline-offset: 1px;
    }
    @media (max-width: 640px) {
      .swagger-ui .wrapper { padding: 0 14px; }
      .swagger-ui .info { border-radius: 12px; margin: 1rem 0 1.25rem; padding: 1.25rem; }
      .swagger-ui .info .title { font-size: 1.75rem; line-height: 1.1; }
      .swagger-ui .opblock-tag { font-size: 1.2rem; }
      .swagger-ui .opblock .opblock-summary { align-items: flex-start; }
    }
  `,
  swaggerOptions: {
    deepLinking: true,
    displayRequestDuration: true,
    docExpansion: "list",
    filter: true,
    persistAuthorization: true,
    tryItOutEnabled: true,
    validatorUrl: null
  }
};

module.exports = swaggerUiOptions;
