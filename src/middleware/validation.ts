import { Context, Next } from 'hono';
import { z } from 'zod';
import { loginPage, registerPage } from '../views/login';

export type ValidationTarget = 'body' | 'query' | 'param';

interface ValidationOptions {
  target?: ValidationTarget;
  onError?: (c: Context, error: z.ZodError, data?: any) => Response | Promise<Response>;
}

export function validateSchema<T extends z.ZodSchema>(
  schema: T,
  options: ValidationOptions = {}
) {
  const { target = 'body', onError } = options;

  return async (c: Context, next: Next) => {
    try {
      let data: any;

      switch (target) {
        case 'body':
          data = await c.req.parseBody();
          break;
        case 'query':
          data = c.req.query();
          break;
        case 'param':
          data = c.req.param();
          break;
        default:
          throw new Error(`Unsupported validation target: ${target}`);
      }

      const result = schema.safeParse(data);

      if (!result.success) {
        if (onError) {
          return onError(c, result.error, data);
        }

        return c.json({
          success: false,
          message: 'Validation failed',
          errors: result.error.issues,
        }, 400);
      }

      c.set('validatedData', result.data);
      await next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      return c.json({
        success: false,
        message: 'Internal server error during validation',
      }, 500);
    }
  };
}

export function signupValidationMiddleware() {
  return validateSchema(
    z.object({
      name: z.string()
        .min(1, 'Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters')
        .trim(),
      email: z.string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address')
        .max(255, 'Email must be less than 255 characters')
        .toLowerCase()
        .trim(),
      password: z.string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters')
        .max(128, 'Password must be less than 128 characters'),
      code: z.string()
        .min(1, 'Signup code is required')
        .max(50, 'Invalid signup code format')
        .trim(),
    }),
    {
      onError: (c, error, data) => {
        const firstError = error.issues[0];
        const name = (data?.name as string) || '';
        const email = (data?.email as string) || '';
        return c.html(registerPage(firstError.message, name, email));
      },
    }
  );
}

export function loginValidationMiddleware() {
  return validateSchema(
    z.object({
      email: z.string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address')
        .toLowerCase()
        .trim(),
      password: z.string()
        .min(1, 'Password is required'),
    }),
    {
      onError: (c, error, data) => {
        const firstError = error.issues[0];
        const email = (data?.email as string) || '';
        return c.html(loginPage(firstError.message, email));
      },
    }
  );
}

export function codeValidationMiddleware() {
  return validateSchema(
    z.object({
      code: z.string()
        .min(1, 'Code is required')
        .max(50, 'Code must be less than 50 characters')
        .trim(),
      startDatetime: z.string()
        .datetime('Invalid start datetime format'),
      endDatetime: z.string()
        .datetime('Invalid end datetime format'),
      type: z.string()
        .min(1, 'Type is required')
        .default('signup'),
      target: z.string()
        .min(1, 'Target is required')
        .max(255, 'Target must be less than 255 characters'),
    }).refine((data) => {
      const start = new Date(data.startDatetime);
      const end = new Date(data.endDatetime);
      return start < end;
    }, {
      message: 'End datetime must be after start datetime',
      path: ['endDatetime'],
    })
  );
}