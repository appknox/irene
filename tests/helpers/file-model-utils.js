import ENUMS from 'irene/enums';

export function setupFileModelEndpoints(server) {
  const previous_file = server.create('file', { id: 10000 });
  const file_risk_info = server.create('file-risk').toJSON();

  // File Risk Info
  server.get('/v3/files/:id/risk', () => {
    return file_risk_info;
  });

  // File Previous File
  server.get('/v3/files/:id/previous_file', () => {
    return previous_file.toJSON();
  });

  // File SBOM File
  server.get('/v3/files/:id/sbom_file', (schema, req) => {
    return schema.sbomFiles.find(`${req.params.id}`)?.toJSON();
  });

  // Get Can Generate Report Status
  server.get('/v3/files/:id/can_generate_report', () => {
    return { can_generate_report: true };
  });

  // File Analyses
  server.get('/v3/files/:id/analyses', (schema, req) => {
    const analyses = schema.analyses.where({ file: req.params.id }).models;

    return {
      count: analyses.length,
      next: null,
      previous: null,
      results: analyses,
    };
  });

  // File Last Automated Dynamic Scan
  server.get('/v3/files/:id/last_automated_dynamic_scan', (schema, request) => {
    return schema.dynamicscans
      .where({
        file: request.params.id,
        mode: ENUMS.DYNAMIC_MODE.AUTOMATED,
      })
      .models[0]?.toJSON();
  });

  // File Last Manual Dynamic Scan
  server.get('/v3/files/:id/last_manual_dynamic_scan', (schema, request) => {
    return schema.dynamicscans
      .where({
        file: request.params.id,
        mode: ENUMS.DYNAMIC_MODE.MANUAL,
      })
      .models[0]?.toJSON();
  });

  // File Screen Coverage
  server.get('/v3/files/:id/screen_coverage', (schema, req) => {
    return schema.scanCoverages.find(`${req.params.id}`)?.toJSON();
  });

  return {
    file_risk_info,
    previous_file,
  };
}
