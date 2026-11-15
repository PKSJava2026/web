import type { z } from "zod";

export type FieldErrors<T> = Partial<Record<keyof T, string>> & {
  general?: string;
};

export const getFieldErrors = <T>(
  issues: z.core.$ZodIssue[],
): FieldErrors<T> => {
  const errors: Record<string, string | undefined> = {};
  for (const issue of issues) {
    const key = String(issue.path[0]);
    if (key && !errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors as FieldErrors<T>;
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
