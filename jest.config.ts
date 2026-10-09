import type { Config } from 'jest';

const config: Config = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/content_scripts/lib/course/**/*.ts',
    'src/content_scripts/lib/schedule.ts',
    'src/content_scripts/lib/utils/**/*.ts',
    '!**/*.test.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};

export default config;
