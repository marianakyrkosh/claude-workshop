class Env {
  static String get apiBaseUrl => const String.fromEnvironment(
        'API_BASE_URL',
        defaultValue: 'http://localhost:3001/v1',
      );

  static void validate() {
    // In dev mode, defaults are fine. Add validation for prod here.
  }
}
