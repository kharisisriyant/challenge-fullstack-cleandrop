import { useState } from 'react';
import { useMutation } from '@apollo/client';
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

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  company: string;
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

export function ServiceFormModal({ trigger, service, onSuccess }: Props) {
  const isEdit = !!service;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: service?.name ?? '',
    description: service?.description ?? '',
    category: service?.category ?? 'Residential',
    company: service?.company ?? '',
    status: service?.status ?? 'draft',
    duration: service?.duration?.toString() ?? '',
    basePrice: service?.basePrice?.toString() ?? '',
  });

  const refetchQueries = [{ query: GET_SERVICES, variables: { page: 1, limit: 6 } }];
  const [createService, { loading: creating }] = useMutation(CREATE_SERVICE, { refetchQueries });
  const [updateService, { loading: updating }] = useMutation(UPDATE_SERVICE, { refetchQueries });

  const loading = creating || updating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = {
      name: form.name,
      description: form.description,
      category: form.category,
      company: form.company,
      status: form.status,
      duration: parseInt(form.duration),
      basePrice: parseInt(form.basePrice),
    };
    if (isEdit) {
      await updateService({ variables: { id: service.id, input } });
    } else {
      await createService({ variables: { input } });
    }
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Service' : 'Add Service'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                min={30}
                max={480}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="price">Base Price (EUR)</Label>
              <Input
                id="price"
                type="number"
                value={form.basePrice}
                onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
