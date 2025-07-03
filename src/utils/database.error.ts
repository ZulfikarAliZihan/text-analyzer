
import { DatabaseError as PgError } from 'pg';
import { QueryFailedError } from 'typeorm';

export const isUniqueKeyViolationError = (
    error: unknown,
    uniqueKeyName: string,
): boolean => {
    return (
        error instanceof QueryFailedError &&
        error.driverError instanceof PgError &&
        error.driverError.constraint == uniqueKeyName
    );
};