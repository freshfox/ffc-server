
export type IErrorFactory = (code: number, msg: string) => Error;

export const ErrorFactory = Symbol('ErrorFactory');
