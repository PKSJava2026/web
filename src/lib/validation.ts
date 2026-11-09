import type { z } from "zod";

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export const getFieldErrors = <T>(
  issues: z.core.$ZodIssue[],
): FieldErrors<T> => {
  const errors: FieldErrors<T> = {};
  for (const issue of issues) {
    const key = issue.path[0] as keyof T;
    if (key && !errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
};

export const validate = <T extends z.ZodType>(
  schema: T,
  data: unknown,
): [z.infer<T>, null] | [null, FieldErrors<z.infer<T>>] => {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return [null, getFieldErrors<z.infer<T>>(parsed.error.issues)];
  }
  return [parsed.data, null];
};
