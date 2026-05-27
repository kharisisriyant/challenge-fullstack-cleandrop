import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { toast } from 'sonner';
import { Formik, Form, Field, ErrorMessage, type FieldProps, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CREATE_SERVICE, UPDATE_SERVICE, GET_SERVICES } from '../../graphql/services';
import { CREATE_COMPANY, GET_COMPANIES } from '../../graphql/companies';
import { capitalizeFirstLetter, cn } from '../../lib/utils';

interface Company {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  companyId: string;
  company: Company;
  status: string;
  duration: number;
  basePrice: number;
}

interface Props {
  trigger: React.ReactNode;
  service?: Service;
  onSuccess?: () => void;
}

const CATEGORIES = ['Residential', 'Commercial', 'Specialty', 'Industrial'];
const STATUSES = ['active', 'draft', 'inactive'];
const NEW_COMPANY = '__new__';

interface FormValues {
  name: string;
  description: string;
  category: string;
  companyId: string;
  newCompanyName: string;
  status: string;
  duration: string;
  basePrice: string;
}

const validationSchema = Yup.object({
  name: Yup.string().trim().required('Name is required').max(120, 'Max 120 characters'),
  description: Yup.string().max(500, 'Max 500 characters'),
  category: Yup.string().oneOf(CATEGORIES, 'Invalid category').required('Category is required'),
  status: Yup.string().oneOf(STATUSES, 'Invalid status').required('Status is required'),
  companyId: Yup.string().required('Company is required'),
  newCompanyName: Yup.string().when('companyId', {
    is: NEW_COMPANY,
    then: (s) => s.trim().required('Company name is required').max(120, 'Max 120 characters'),
    otherwise: (s) => s.notRequired(),
  }),
  duration: Yup.number()
    .typeError('Duration must be a number')
    .required('Duration is required')
    .min(30, 'Min 30 min')
    .max(480, 'Max 480 min'),
  basePrice: Yup.number()
    .typeError('Base price must be a number')
    .required('Base price is required')
    .min(0, 'Must be ≥ 0'),
});

function FieldError({ name, className }: { name: string; className?: string }) {
  return (
    <div className={cn('text-xs text-destructive', className)}>
      <ErrorMessage name={name} />
    </div>
  );
}

export function ServiceFormModal({ trigger, service, onSuccess }: Props) {
  const isEdit = !!service;
  const [open, setOpen] = useState(false);

  const { data: companiesData } = useQuery<{ companies: Company[] }>(GET_COMPANIES);
  const companies = companiesData?.companies ?? [];

  const refetchQueries = [
    { query: GET_SERVICES, variables: { page: 1, limit: 6 } },
    { query: GET_COMPANIES },
  ];
  const [createService] = useMutation(CREATE_SERVICE, { refetchQueries });
  const [updateService] = useMutation(UPDATE_SERVICE, { refetchQueries });
  const [createCompany] = useMutation(CREATE_COMPANY, {
    refetchQueries: [{ query: GET_COMPANIES }],
  });

  const initialValues: FormValues = {
    name: service?.name ?? '',
    description: service?.description ?? '',
    category: service?.category ?? 'Residential',
    companyId: service?.companyId ?? '',
    newCompanyName: '',
    status: service?.status ?? 'draft',
    duration: service?.duration?.toString() ?? '',
    basePrice: service?.basePrice?.toString() ?? '',
  };

  const handleSubmit = async (values: FormValues, helpers: FormikHelpers<FormValues>) => {
    try {
      let companyId = values.companyId;
      if (companyId === NEW_COMPANY) {
        const trimmed = values.newCompanyName.trim();
        const { data } = await createCompany({ variables: { input: { name: trimmed } } });
        companyId = data?.createCompany?.id;
        if (!companyId) {
          helpers.setFieldError('newCompanyName', 'Failed to create company');
          return;
        }
        toast.success(`Company "${trimmed}" created`);
      }

      const input = {
        name: values.name.trim(),
        description: values.description,
        category: values.category,
        companyId,
        status: values.status,
        duration: parseInt(values.duration),
        basePrice: parseInt(values.basePrice),
      };
      if (isEdit && service) {
        await updateService({ variables: { id: service.id, input } });
        toast.success(`Service "${input.name}" updated`);
      } else {
        await createService({ variables: { input } });
        toast.success(`Service "${input.name}" created`);
      }
      setOpen(false);
      helpers.resetForm();
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(isEdit ? 'Failed to update service' : 'Failed to create service', {
        description: message,
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Service' : 'Add Service'}</DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, setFieldValue, isSubmitting, isValid, dirty }) => {
            const isNewCompany = values.companyId === NEW_COMPANY;
            const invalidCls = (field: keyof FormValues) =>
              touched[field] && errors[field] ? 'border-destructive focus-visible:ring-destructive' : '';

            return (
              <Form className="grid gap-4 py-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Field name="name">
                    {({ field }: FieldProps) => (
                      <Input id="name" {...field} className={cn(invalidCls('name'))} />
                    )}
                  </Field>
                  <FieldError name="name" />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="desc">Description</Label>
                  <Field name="description">
                    {({ field }: FieldProps) => (
                      <Textarea id="desc" {...field} className={cn(invalidCls('description'))} />
                    )}
                  </Field>
                  <FieldError name="description" />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label>Category</Label>
                    <Select
                      value={values.category}
                      onValueChange={(v) => setFieldValue('category', v)}
                    >
                      <SelectTrigger className={cn(invalidCls('category'))}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError name="category" className="min-h-4 leading-4" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Status</Label>
                    <Select
                      value={values.status}
                      onValueChange={(v) => setFieldValue('status', v)}
                    >
                      <SelectTrigger className={cn(invalidCls('status'))}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{capitalizeFirstLetter(s)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError name="status" className="min-h-4 leading-4" />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="company">Company</Label>
                  <Select
                    value={values.companyId}
                    onValueChange={(v) => setFieldValue('companyId', v)}
                  >
                    <SelectTrigger id="company" className={cn(invalidCls('companyId'))}>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                      <SelectItem value={NEW_COMPANY}>+ New company…</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError name="companyId" />
                  {isNewCompany && (
                    <>
                      <Field name="newCompanyName">
                        {({ field }: FieldProps) => (
                          <Input
                            placeholder="New company name"
                            {...field}
                            className={cn(invalidCls('newCompanyName'))}
                          />
                        )}
                      </Field>
                      <FieldError name="newCompanyName" />
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Field name="duration">
                      {({ field }: FieldProps) => (
                        <Input
                          id="duration"
                          type="number"
                          min={30}
                          max={480}
                          {...field}
                          className={cn("min-h-4 leading-4", invalidCls('duration'))}
                        />
                      )}
                    </Field>
                    <FieldError name="duration" className="min-h-4 leading-4" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="price">Base Price (EUR)</Label>
                    <Field name="basePrice">
                      {({ field }: FieldProps) => (
                        <Input
                          id="price"
                          type="number"
                          min={0}
                          {...field}
                          className={cn("min-h-4 leading-4", invalidCls('basePrice'))}
                        />
                      )}
                    </Field>
                    <FieldError name="basePrice" className="min-h-4 leading-4" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isValid || (!isEdit && !dirty)}
                  >
                    {isSubmitting ? 'Saving…' : isEdit ? 'Update' : 'Create'}
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
