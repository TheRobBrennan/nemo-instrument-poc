# Testing Guide

## Overview

This project uses **Vitest** for fast, modern testing with excellent TypeScript support and Vite integration.

---

## Quick Start

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

# Run tests in watch mode (development)
cd services/frontend && npm test
```

---

## Test Structure

```
services/frontend/
├── src/
│   ├── store/
│   │   └── __tests__/
│   │       └── instrumentStore.test.ts
│   └── test/
│       ├── setup.ts          # Test setup and global config
│       └── utils.tsx         # Test utilities and helpers
└── vite.config.ts            # Vitest configuration
```

---

## Test Coverage

### Current Coverage

**Zustand Store**: 100% coverage
- Initial state validation
- State mutations (setStatus, setConnected, setError)
- Integration scenarios (complete workflows)
- Error handling

### Coverage Targets

- **Zustand store**: 100% ✅
- **WebSocket service**: 80%+ (planned)
- **Components**: 70%+ (planned)
- **Overall**: 70%+ (planned)

---

## Running Tests

### All Tests

```bash
# From project root
npm test

# From frontend workspace
cd services/frontend
npm test
```

### With Coverage Report

```bash
npm run test:coverage
```

Coverage reports are generated in:
- **Text**: Console output
- **HTML**: `services/frontend/coverage/index.html`
- **JSON**: `services/frontend/coverage/coverage-final.json`

### Interactive UI

```bash
npm run test:ui
```

Opens Vitest UI at <http://localhost:51204> with:
- Real-time test results
- Coverage visualization
- Test file explorer
- Console output

---

## Writing Tests

### Test File Naming

- Place tests in `__tests__` folder next to source files
- Name test files: `*.test.ts` or `*.test.tsx`
- Example: `instrumentStore.test.ts` for `instrumentStore.ts`

### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useInstrumentStore } from '../instrumentStore';

describe('instrumentStore', () => {
  beforeEach(() => {
    // Reset state before each test
    useInstrumentStore.setState({
      status: { state: 'IDLE', timestamp: new Date().toISOString() },
      isConnected: false,
      error: null,
    });
  });

  it('should have correct initial state', () => {
    const state = useInstrumentStore.getState();
    expect(state.isConnected).toBe(false);
  });
});
```

### Testing Zustand Stores

```typescript
// Get current state
const state = useInstrumentStore.getState();

// Call store actions
const { setStatus, setConnected } = useInstrumentStore.getState();
setConnected(true);

// Assert state changes
expect(useInstrumentStore.getState().isConnected).toBe(true);
```

### Testing React Components

```typescript
import { render, screen } from '../test/utils';
import { MyComponent } from '../MyComponent';

it('should render component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

---

## Test Utilities

### Setup File (`src/test/setup.ts`)

Configures global test environment:
- Extends Vitest matchers with jest-dom
- Auto-cleanup after each test
- Global test configuration

### Utils File (`src/test/utils.tsx`)

Custom render function with provider support:

```typescript
import { render } from '../test/utils';

// Renders with all necessary providers
render(<MyComponent />);
```

---

## Configuration

### Vitest Config (`vite.config.ts`)

```typescript
export default defineConfig({
  test: {
    globals: true,              // Use global test APIs
    environment: 'jsdom',       // Browser-like environment
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'src/main.tsx',
      ],
    },
  },
});
```

---

## Best Practices

### 1. Test Organization

- **Group related tests** with `describe` blocks
- **Use descriptive test names** that explain what is being tested
- **One assertion per test** when possible

### 2. Test Independence

- **Reset state** before each test with `beforeEach`
- **Don't rely on test execution order**
- **Clean up** after tests (automatic with setup)

### 3. Coverage Goals

- **100% for stores** - Critical business logic
- **80%+ for services** - Core functionality
- **70%+ for components** - UI behavior
- **Focus on critical paths** over 100% coverage

### 4. What to Test

✅ **Do Test:**
- State management logic
- User interactions
- Edge cases and error handling
- Integration between components

❌ **Don't Test:**
- Third-party libraries
- Implementation details
- Trivial getters/setters
- Styling/CSS

---

## Continuous Integration

Tests run automatically on:
- **Pull requests** - All tests must pass
- **Main branch commits** - Ensures stability
- **Pre-commit hooks** - Fast feedback (planned)

---

## Troubleshooting

### Tests Not Running

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
```

### Coverage Not Generating

```bash
# Install coverage provider
npm install -D @vitest/coverage-v8
```

### TypeScript Errors

```bash
# Ensure types are installed
npm install -D @types/node vitest
```

### jsdom Errors

```bash
# Ensure jsdom is installed
npm install -D jsdom happy-dom
```

---

## Future Enhancements

- [ ] WebSocket service tests (80%+ coverage)
- [ ] Component tests (70%+ coverage)
- [ ] Integration tests for full workflows
- [ ] E2E tests with Playwright
- [ ] Visual regression tests
- [ ] Performance benchmarks

---

## Resources

- **Vitest Docs**: <https://vitest.dev>
- **Testing Library**: <https://testing-library.com>
- **Jest DOM Matchers**: <https://github.com/testing-library/jest-dom>
- **Zustand Testing**: <https://docs.pmnd.rs/zustand/guides/testing>

---

## Example Test Output

```bash
✓ src/store/__tests__/instrumentStore.test.ts (9 tests) 3ms
  ✓ instrumentStore (9)
    ✓ initial state (1)
      ✓ should have correct initial state 1ms
    ✓ setStatus (3)
      ✓ should update status 0ms
      ✓ should handle all valid status states 0ms
      ✓ should include optional fields in status 0ms
    ✓ setConnected (1)
      ✓ should update connection status 0ms
    ✓ setError (1)
      ✓ should update error state 0ms
    ✓ integration scenarios (3)
      ✓ should handle complete run workflow 0ms
      ✓ should handle connection state changes during run 0ms
      ✓ should handle error scenarios 0ms

Test Files  1 passed (1)
     Tests  9 passed (9)
  Start at  13:20:40
  Duration  879ms
```

---

## Summary

- **Framework**: Vitest with jsdom
- **Current Coverage**: Zustand store (100%)
- **Test Count**: 9 tests passing
- **Run Time**: < 1 second
- **Commands**: `npm test`, `npm run test:coverage`, `npm run test:ui`

**Testing is a critical part of our development process. All new features should include tests!**
