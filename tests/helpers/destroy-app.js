export default function destroyApp(application) {
  application.destroy();

  if (window.server) {
    window.server.shutdown();
  }

  // eslint-disable-next-line
  server.shutdown();
}
