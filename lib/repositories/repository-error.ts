export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}

export const toRepositoryError = (error: unknown) => {
  if (error && typeof error === "object" && "message" in error) {
    const message = String(error.message);
    const code = "code" in error ? String(error.code) : undefined;
    return new RepositoryError(message, code);
  }

  return new RepositoryError("Repository operation failed");
};

export const isMissingSchemaError = (error: unknown): error is RepositoryError =>
  error instanceof RepositoryError && (error.code === "42P01" || error.message.includes("Could not find the table"));
