import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Building2, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { StatusBadge } from './StatusBadge';
import { ServiceFormModal } from './ServiceFormModal';
import { DELETE_SERVICE, GET_SERVICES } from '../../graphql/services';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  company: string;
  status: 'active' | 'draft' | 'inactive';
  duration: number;
  basePrice: number;
}

interface Props {
  services: Service[];
  total: number;
  page: number;
  limit: number;
  isAdmin: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function ServicesTable({ services, total, page, limit, isAdmin, onPageChange, onLimitChange }: Props) {
  const totalPages = Math.ceil(total / limit);

  const [deleteService] = useMutation(DELETE_SERVICE, {
    refetchQueries: [{ query: GET_SERVICES, variables: { page, limit } }],
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    await deleteService({ variables: { id } });
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="pb-3 pr-4 font-medium">Name</th>
              <th className="pb-3 pr-4 font-medium">Category</th>
              <th className="pb-3 pr-4 font-medium">Company</th>
              <th className="pb-3 pr-4 font-medium">Status</th>
              <th className="pb-3 pr-4 font-medium">Duration</th>
              {isAdmin && <th className="pb-3 font-medium"></th>}
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-3 pr-4">
                  <div className="font-medium">{service.name}</div>
                  <div className="max-w-xs truncate text-xs text-muted-foreground">
                    {service.description}
                  </div>
                </td>
                <td className="py-3 pr-4 text-muted-foreground">{service.category}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    <span className="text-xs">{service.company}</span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <StatusBadge status={service.status} />
                </td>
                <td className="py-3 pr-4 text-muted-foreground">{service.duration} min</td>
                {isAdmin && (
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <ServiceFormModal
                        trigger={
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        }
                        service={service}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(service.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {Math.min((page - 1) * limit + 1, total)} to {Math.min(page * limit, total)} of {total} services
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-xs">Rows per page</span>
            <select
              className="ml-1 rounded border px-1 py-0.5 text-xs"
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
            >
              {[6, 9, 12].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-xs">Page {page} / {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
