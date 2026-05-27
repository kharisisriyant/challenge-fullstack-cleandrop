import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { toast } from 'sonner';
import { Building2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown, Filter, Pencil, Search, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { StatusBadge } from './StatusBadge';
import { ServiceFormModal } from './ServiceFormModal';
import { DELETE_SERVICE } from '../../graphql/services';
import { GET_COMPANIES } from '../../graphql/companies';
import { Badge } from '../ui/badge';

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
  status: 'active' | 'draft' | 'inactive';
  duration: number;
  basePrice: number;
}

export interface FilterControls {
  search: string;
  setSearch: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  companyId: string;
  setCompanyId: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  durationMin?: number;
  durationMax?: number;
  setDurationRange: (min: number | undefined, max: number | undefined) => void;
}

interface Props {
  services: Service[];
  total: number;
  page: number;
  limit: number;
  isAdmin: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  filters: FilterControls;
}

const CATEGORIES = ['Residential', 'Commercial', 'Specialty', 'Industrial'];
const STATUSES = ['active', 'draft', 'inactive'];
const DURATION_FLOOR = 0;
const DURATION_CEIL = 480;

function SortIcon({ field, sortBy, sortOrder }: { field: string; sortBy: string; sortOrder: 'asc' | 'desc' }) {
  if (field !== sortBy) return <ChevronsUpDown className="h-3 w-3 opacity-40" />;
  return sortOrder === 'asc'
    ? <ChevronUp className="h-3 w-3" />
    : <ChevronDown className="h-3 w-3" />;
}

function FilterButton({ active }: { active: boolean }) {
  return (
    <Filter className={`h-3 w-3 ${active ? 'text-primary fill-primary' : 'opacity-40'}`} />
  );
}

function HeaderCell({
  field,
  label,
  sortBy,
  sortOrder,
  onSort,
  filterActive,
  filterContent,
}: {
  field: string;
  label: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (f: string) => void;
  filterActive: boolean;
  filterContent: React.ReactNode;
}) {
  return (
    <th className="pb-3 pr-4 font-medium">
      <div className="flex flex-row items-center justify-between gap-1">
        <div>
          {label}
        </div>
        <div className="flex">
        <button
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          onClick={() => onSort(field)}
        >
          <SortIcon field={field} sortBy={sortBy} sortOrder={sortOrder} />
        </button>
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-0.5 hover:text-foreground transition-colors" aria-label={`Filter ${label}`}>
              <FilterButton active={filterActive} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64">{filterContent}</PopoverContent>
        </Popover>
        </div>
      </div>
    </th>
  );
}

export function ServicesTable({ services, total, page, limit, isAdmin, sortBy, sortOrder, onSort, onPageChange, onLimitChange, filters }: Props) {
  const totalPages = Math.ceil(total / limit);

  const [deleteService] = useMutation(DELETE_SERVICE, {
    refetchQueries: ['GetServices', 'GetServiceStats'],
    awaitRefetchQueries: true,
  });

  const { data: companiesData } = useQuery<{ companies: Company[] }>(GET_COMPANIES, {
    fetchPolicy: 'cache-first',
  });
  const companies = companiesData?.companies ?? [];

  const [companyQuery, setCompanyQuery] = useState('');
  const filteredCompanies = useMemo(() => {
    const q = companyQuery.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) => c.name.toLowerCase().includes(q));
  }, [companies, companyQuery]);

  const selectedCompany = companies.find((c) => c.id === filters.companyId);

  const dMin = filters.durationMin ?? DURATION_FLOOR;
  const dMax = filters.durationMax ?? DURATION_CEIL;
  const [durationDraft, setDurationDraft] = useState<[number, number]>([dMin, dMax]);

  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteService({ variables: { id: deleteTarget.id } });
      toast.success(`Service "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error('Failed to delete service', { description: message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <HeaderCell
                field="name"
                label="Name"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
                filterActive={!!filters.search}
                filterContent={
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Search name</label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        autoFocus
                        placeholder="Search services..."
                        className="pl-8"
                        value={filters.search}
                        onChange={(e) => filters.setSearch(e.target.value)}
                      />
                    </div>
                    {filters.search && (
                      <Button variant="ghost" size="sm" className="h-7 w-full" onClick={() => filters.setSearch('')}>
                        Clear
                      </Button>
                    )}
                  </div>
                }
              />
              <HeaderCell
                field="category"
                label="Category"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
                filterActive={!!filters.category}
                filterContent={
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Category</label>
                    <Select
                      value={filters.category || 'all'}
                      onValueChange={(v) => filters.setCategory(v === 'all' ? '' : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                }
              />
              <HeaderCell
                field="company"
                label="Company"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
                filterActive={!!filters.companyId}
                filterContent={
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Company</label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        autoFocus
                        placeholder="Search companies..."
                        className="pl-8"
                        value={companyQuery}
                        onChange={(e) => setCompanyQuery(e.target.value)}
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto rounded border">
                      {filteredCompanies.length === 0 && (
                        <div className="px-2 py-2 text-xs text-muted-foreground">No matches</div>
                      )}
                      {filteredCompanies.map((c) => {
                        const selected = c.id === filters.companyId;
                        return (
                          <button
                            key={c.id}
                            onClick={() => filters.setCompanyId(selected ? '' : c.id)}
                            className={`flex w-full items-center justify-between px-2 py-1.5 text-left text-xs hover:bg-muted ${selected ? 'bg-muted font-medium' : ''}`}
                          >
                            <span className="truncate">{c.name}</span>
                            {selected && <span className="text-primary">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                    {selectedCompany && (
                      <Button variant="ghost" size="sm" className="h-7 w-full" onClick={() => filters.setCompanyId('')}>
                        Clear ({selectedCompany.name})
                      </Button>
                    )}
                  </div>
                }
              />
              <HeaderCell
                field="status"
                label="Status"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
                filterActive={!!filters.status}
                filterContent={
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Status</label>
                    <Select
                      value={filters.status || 'all'}
                      onValueChange={(v) => filters.setStatus(v === 'all' ? '' : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                }
              />
              <HeaderCell
                field="duration"
                label="Duration"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
                filterActive={filters.durationMin !== undefined || filters.durationMax !== undefined}
                filterContent={
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-foreground">Duration (minutes)</label>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{durationDraft[0]} min</span>
                      <span>{durationDraft[1]} min</span>
                    </div>
                    <Slider
                      min={DURATION_FLOOR}
                      max={DURATION_CEIL}
                      step={15}
                      value={durationDraft}
                      onValueChange={(v) => setDurationDraft([v[0], v[1]] as [number, number])}
                      onValueCommit={(v) => {
                        const min = v[0] === DURATION_FLOOR ? undefined : v[0];
                        const max = v[1] === DURATION_CEIL ? undefined : v[1];
                        filters.setDurationRange(min, max);
                      }}
                    />
                    {(filters.durationMin !== undefined || filters.durationMax !== undefined) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-full"
                        onClick={() => {
                          setDurationDraft([DURATION_FLOOR, DURATION_CEIL]);
                          filters.setDurationRange(undefined, undefined);
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                }
              />
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
                    <Badge variant="outline" className="p-2">
                      <Building2 className="h-3 w-3" />
                      <span className="text-xs">{service.company?.name}</span>
                    </Badge>
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
                        onClick={() => setDeleteTarget(service)}
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

      {/* Mobile card list */}
      <div className="space-y-3 md:hidden">
        {services.map((service) => (
          <div key={service.id} className="rounded-lg border bg-card p-3 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{service.name}</div>
                <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {service.description}
                </div>
              </div>
              <StatusBadge status={service.status} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="rounded bg-muted px-1.5 py-0.5">{service.category}</span>
              <span className="flex items-center gap-1">
                <Badge variant="outline">
                  <Building2 className="h-3 w-3" />
                  {service.company?.name}
                </Badge>
              </span>
              <span>{service.duration} min</span>
              <span className="font-medium text-foreground">EUR {service.basePrice}</span>
            </div>
            {isAdmin && (
              <div className="mt-3 flex items-center justify-end gap-1 border-t pt-2">
                <ServiceFormModal
                  trigger={
                    <Button variant="ghost" size="sm" className="h-7">
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      Edit
                    </Button>
                  }
                  service={service}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-destructive hover:text-destructive"
                  onClick={() => setDeleteTarget(service)}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        ))}
        {services.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No services found</p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs sm:text-sm">
          Showing {Math.min((page - 1) * limit + 1, total)} to {Math.min(page * limit, total)} of {total} services
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-xs">Rows</span>
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
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <span className="text-xs">{page} / {totalPages || 1}</span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o && !deleting) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete service?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete{' '}
            <span className="font-medium text-foreground">"{deleteTarget?.name}"</span>. This action
            cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
