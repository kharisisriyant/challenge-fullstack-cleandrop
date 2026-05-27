import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Search, Plus, Building2 } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { SummaryCards } from '../components/services/SummaryCards';
import { ServicesTable } from '../components/services/ServicesTable';
import { ServiceFormModal } from '../components/services/ServiceFormModal';
import { GET_SERVICES, GET_SERVICE_STATS } from '../graphql/services';
import { useAuthStore } from '../store/auth.store';

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

const STATUSES = ['active', 'draft', 'inactive'];
const CATEGORIES = ['Residential', 'Commercial', 'Specialty', 'Industrial'];

export function ServicesPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [durationMin, setDurationMin] = useState<number | undefined>(undefined);
  const [durationMax, setDurationMax] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (field === sortBy) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const filtersVar = {
    search: search || undefined,
    status: status || undefined,
    category: category || undefined,
    companyId: companyId || undefined,
    durationMin,
    durationMax,
  };

  const { data, loading, error } = useQuery<{
    services: { items: Service[]; total: number };
  }>(GET_SERVICES, {
    variables: { filters: filtersVar, pagination: { page, limit }, sort: { sortBy, sortOrder } },
    fetchPolicy: 'cache-and-network',
  });

  const { data: statsData } = useQuery<{
    serviceStats: { total: number; active: number; drafts: number; avgBasePrice: number };
  }>(GET_SERVICE_STATS, {
    variables: { filters: filtersVar },
    fetchPolicy: 'cache-and-network',
  });

  const services = data?.services?.items ?? [];
  const total = data?.services?.total ?? 0;

  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v === 'all' ? '' : v);
    setPage(1);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h1 className="text-xl font-bold sm:text-2xl">Services</h1>
          <Badge variant="secondary" className="flex items-center gap-1 text-xs">
            <Building2 className="h-3 w-3" />
            Platform-wide
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Manage your service catalog</p>
      </div>

      <SummaryCards stats={statsData?.serviceStats} />

      <div className="mt-6 rounded-xl border bg-white p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Catalog</h2>
          {isAdmin && (
            <ServiceFormModal
              trigger={
                <Button size="sm" variant="outline">
                  <Plus className="mr-1 h-4 w-4" />
                  Add
                </Button>
              }
            />
          )}
        </div>

        <div className="mb-4 flex flex-col gap-2 sm:gap-3">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              className="pl-8"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Select value={status || 'all'} onValueChange={handleFilterChange(setStatus)}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={category || 'all'} onValueChange={handleFilterChange(setCategory)}>
              <SelectTrigger className="flex-1">
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
        </div>

        {loading && <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>}
        {error && <p className="py-8 text-center text-sm text-destructive">{error.message}</p>}
        {!loading && !error && (
          <ServicesTable
            services={services}
            total={total}
            page={page}
            limit={limit}
            isAdmin={isAdmin}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onPageChange={setPage}
            onLimitChange={(l) => { setLimit(l); setPage(1); }}
            filters={{
              search,
              setSearch: (v) => { setSearch(v); setPage(1); },
              category,
              setCategory: (v) => { setCategory(v); setPage(1); },
              companyId,
              setCompanyId: (v) => { setCompanyId(v); setPage(1); },
              status,
              setStatus: (v) => { setStatus(v); setPage(1); },
              durationMin,
              durationMax,
              setDurationRange: (min, max) => { setDurationMin(min); setDurationMax(max); setPage(1); },
            }}
          />
        )}
      </div>
    </div>
  );
}
