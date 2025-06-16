#!/bin/bash

FILE="src/__tests__/setup-verification.test.ts"

if [ -f "$FILE" ]; then
  echo "⚠️  El archivo '$FILE' ya existe. No se creó uno nuevo para evitar sobrescritura."
else
  mkdir -p "$(dirname "$FILE")"

  cat > "$FILE" << 'EOT'
describe('Enterprise Testing Architecture Verification', () => {
  it('should have all new testing functions available', () => {
    expect(globalThis.mockRanchOSCountry).toBeDefined();
    expect(globalThis.mockRanchOSFeatureFlags).toBeDefined();
    expect(globalThis.mockRanchOSPerformance).toBeDefined();
    expect(globalThis.resetRanchOSMocks).toBeDefined();
    expect(globalThis.getCurrentTestingContext).toBeDefined();
    console.log('✅ All enterprise testing functions are available!');
  });

  it('should configure countries correctly', () => {
    globalThis.mockRanchOSCountry('MX');
    const context = globalThis.getCurrentTestingContext();
    expect(context.country).toBe('MX');
    expect(context.mocks.banking).toBeDefined();
    expect(context.mocks.iot).toBeDefined();
    expect(context.mocks.weather).toBeDefined();
    expect(context.mocks.ai).toBeDefined();
    console.log('✅ Multi-country support is working!');
  });

  it('should handle feature flags', () => {
    globalThis.mockRanchOSFeatureFlags({
      ENABLE_INVENTORY: true,
      ENABLE_WEIGHT_TRACKING: true
    });
    const context = globalThis.getCurrentTestingContext();
    expect(context.featureFlags.ENABLE_INVENTORY).toBe(true);
    expect(context.featureFlags.ENABLE_WEIGHT_TRACKING).toBe(true);
    console.log('✅ Feature flags are working!');
  });
});
EOT

  echo "✅ Archivo creado exitosamente: $FILE"
fi
