// ============================================================
// ENTERPRISE ARRAY REVERSAL SOLUTION v1.0.0
// Architecture: Hexagonal + DDD + CQRS-lite
// ============================================================

// ── DTOs ─────────────────────────────────────────────────────

/** Immutable input contract for reversal operations. */
interface ReversalRequestDto<T> {
  readonly source: ReadonlyArray<T>;
}

/** Immutable output contract for reversal operations. */
interface ReversalResponseDto<T> {
  readonly result: ReadonlyArray<T>;
  readonly processedAt: Date;
  readonly strategyUsed: string;
}

// ── Exceptions ───────────────────────────────────────────────

/** Base exception for the reversal domain. */
class ReversalDomainException extends Error {
  constructor(message: string) {
    super(`[ReversalDomain] ${message}`);
    this.name = "ReversalDomainException";
  }
}

/** Thrown when a null or undefined source array is provided. */
class NullSourceArrayException extends ReversalDomainException {
  constructor() {
    super("Source array must not be null or undefined.");
    this.name = "NullSourceArrayException";
  }
}

// ── Validation ───────────────────────────────────────────────

/** Contract for validating reversal requests. */
interface IReversalRequestValidator<T> {
  validate(request: ReversalRequestDto<T>): void;
}

/** Default implementation: guards against null/undefined source. */
class DefaultReversalRequestValidator<T>
  implements IReversalRequestValidator<T>
{
  /**
   * Validates the reversal request.
   * @throws {NullSourceArrayException} if source is null or undefined
   */
  validate(request: ReversalRequestDto<T>): void {
    if (request.source == null) {
      throw new NullSourceArrayException();
    }
  }
}

// ── Strategy ─────────────────────────────────────────────────

/** Contract for array reversal algorithms. */
interface IReversalStrategy<T> {
  /** Human-readable identifier for observability and auditing. */
  readonly strategyName: string;

  /**
   * Executes the reversal algorithm.
   * @param source - The array to reverse
   * @returns A new reversed array; source is never mutated
   */
  execute(source: ReadonlyArray<T>): T[];
}

/**
 * Iterative reversal strategy.
 * Reads each element from its mirrored index in the source array.
 * Time complexity: O(n). Space complexity: O(n).
 */
class IterativeReversalStrategy<T> implements IReversalStrategy<T> {
  readonly strategyName = "IterativeReversalStrategy";

  execute(source: ReadonlyArray<T>): T[] {
    const totalElements = source.length;
    const pickFromEnd = (_: unknown, position: number) => source[totalElements - 1 - position];
    return Array.from({ length: totalElements }, pickFromEnd);
  }
}

// ── Service ──────────────────────────────────────────────────

/** Contract for the array reversal application service. */
interface IArrayReversalService<T> {
  reverse(request: ReversalRequestDto<T>): ReversalResponseDto<T>;
}

/** Orchestrates validation, strategy execution, and response assembly. */
class ArrayReversalService<T> implements IArrayReversalService<T> {
  private readonly strategy: IReversalStrategy<T>;
  private readonly validator: IReversalRequestValidator<T>;

  constructor(strategy: IReversalStrategy<T>, validator: IReversalRequestValidator<T>) {
    this.strategy = strategy;
    this.validator = validator;
  }

  /**
   * Reverses the source array in the request.
   * @param request - DTO containing the source array
   * @returns DTO containing the reversed array and audit metadata
   */
  reverse(request: ReversalRequestDto<T>): ReversalResponseDto<T> {
    this.validator.validate(request);

    const result = this.strategy.execute(request.source);

    return {
      result,
      processedAt: new Date(),
      strategyUsed: this.strategy.strategyName,
    };
  }
}

// ── Factory ──────────────────────────────────────────────────

/** Constructs fully-wired {@link ArrayReversalService} instances. */
class ArrayReversalServiceFactory {
  /**
   * Creates a service using the default map-based strategy.
   * @returns A ready-to-use {@link IArrayReversalService}
   */
  static createDefault<T>(): IArrayReversalService<T> {
    return new ArrayReversalService<T>(
      new IterativeReversalStrategy<T>(),
      new DefaultReversalRequestValidator<T>()
    );
  }
}

// ── Facade ───────────────────────────────────────────────────

/**
 * Single entry point for consumers.
 * Hides factory wiring and DTO construction.
 */
class ArrayReversalFacade {
  private static readonly service =
    ArrayReversalServiceFactory.createDefault<unknown>();

  /**
   * Reverses an array.
   * @param values - The array to reverse
   * @returns A new reversed array
   *
   * @example
   * ArrayReversalFacade.reverse([1, 2, 3]); // [3, 2, 1]
   */
  static reverse<T>(values: T[]): T[] {
    const service = ArrayReversalServiceFactory.createDefault<T>();
    const response = service.reverse({ source: values });
    return [...response.result];
  }
}

// ── Entrypoint ───────────────────────────────────────────────

export const reverse = <T>(values: T[]): T[] => ArrayReversalFacade.reverse(values);
