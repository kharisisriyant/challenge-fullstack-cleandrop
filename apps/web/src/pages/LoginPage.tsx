import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { Formik, Form, Field, ErrorMessage, type FieldProps } from 'formik';
import * as Yup from 'yup';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { LOGIN_MUTATION } from '../graphql/auth';
import { useAuthStore } from '../store/auth.store';
import { cn } from '../lib/utils';

interface LoginResult {
  login: {
    token: string;
    userId: string;
    email: string;
    name: string;
    role: string;
  };
}

interface FormValues {
  email: string;
  password: string;
}

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
});

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState('');
  const [login] = useMutation<LoginResult>(LOGIN_MUTATION);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="mb-2 text-center text-2xl font-bold text-gray-800">platform</div>
          <CardTitle className="text-center text-lg font-medium">Sign in to Cleandrop</CardTitle>
        </CardHeader>
        <CardContent>
          <Formik<FormValues>
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              setServerError('');
              try {
                const { data } = await login({ variables: { input: values } });
                if (data?.login) {
                  const { token, userId, email, name, role } = data.login;
                  setAuth(token, { userId, email, name, role });
                  navigate('/services');
                }
              } catch (err: unknown) {
                setServerError(err instanceof Error ? err.message : 'Login failed');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ errors, touched, isSubmitting, isValid, dirty }) => {
              const invalidCls = (field: keyof FormValues) =>
                touched[field] && errors[field]
                  ? 'border-destructive focus-visible:ring-destructive'
                  : '';

              return (
                <Form className="grid gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Field name="email">
                      {({ field }: FieldProps) => (
                        <Input
                          id="email"
                          type="email"
                          placeholder="admin@cleandrop.io"
                          autoComplete="email"
                          {...field}
                          className={cn(invalidCls('email'))}
                        />
                      )}
                    </Field>
                    <div className="text-xs text-destructive">
                      <ErrorMessage name="email" />
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Field name="password">
                      {({ field }: FieldProps) => (
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          {...field}
                          className={cn(invalidCls('password'))}
                        />
                      )}
                    </Field>
                    <div className="text-xs text-destructive">
                      <ErrorMessage name="password" />
                    </div>
                  </div>
                  {serverError && <p className="text-xs text-destructive">{serverError}</p>}
                  <Button type="submit" disabled={isSubmitting || !isValid || !dirty}>
                    {isSubmitting ? 'Signing in…' : 'Sign in'}
                  </Button>
                </Form>
              );
            }}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
}
