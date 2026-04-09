# Reverse an Array

Reverse an array without using `Array.prototype.reverse`. Return the result. You may mutate the original array.

**Constraint:** your solution must fit in 47 KB or fewer.

## Example

```
[1, 2, 3] → [3, 2, 1]
```

## Enterprise Solution

`solution.enterprise.ts` implements a full enterprise-grade architecture:

- **DTO layer** — `ReversalRequestDto` / `ReversalResponseDto` define immutable input/output contracts
- **Exception hierarchy** — `ReversalDomainException` → `NullSourceArrayException` for domain-specific errors
- **Validator** — `DefaultReversalRequestValidator` guards against null/undefined input
- **Strategy pattern** — `IterativeReversalStrategy` performs O(n) reversal without mutating the source
- **Service** — `ArrayReversalService` orchestrates validation, strategy execution, and response assembly
- **Factory** — `ArrayReversalServiceFactory` wires all dependencies together
- **Facade** — `ArrayReversalFacade` exposes a single clean static method to consumers

The public API is a single exported function:

```ts
import { reverse } from './solution.enterprise.ts';

reverse([1, 2, 3]);                        // [3, 2, 1]
reverse([...'01234567890123456789']);       // [...'98765432109876543210']
reverse([0, undefined]);                   // [undefined, 0]
```

## Run tests

```bash
node solution.test.ts
```

Requires Node.js v22+.
