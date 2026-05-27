import { Grid, Clock, FileEdit, DollarSign } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface Stats {
  total: number;
  active: number;
  drafts: number;
  avgBasePrice: number;
}

interface Props {
  stats?: Stats;
}

export function SummaryCards({ stats }: Props) {
  const total = stats?.total ?? 0;
  const active = stats?.active ?? 0;
  const drafts = stats?.drafts ?? 0;
  const avgPrice = stats?.avgBasePrice ?? 0;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Services</p>
              <p className="mt-1 text-3xl font-bold">{total}</p>
              <p className="mt-1 text-xs text-muted-foreground">Across all companies</p>
            </div>
            <Grid className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="mt-1 text-3xl font-bold text-green-600">{active}</p>
              <p className="mt-1 text-xs text-muted-foreground">Currently available</p>
            </div>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Drafts</p>
              <p className="mt-1 text-3xl font-bold text-yellow-600">{drafts}</p>
              <p className="mt-1 text-xs text-muted-foreground">Not published yet</p>
            </div>
            <FileEdit className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg. Base Price</p>
              <p className="mt-1 text-3xl font-bold">EUR {avgPrice}</p>
              <p className="mt-1 text-xs text-muted-foreground">Across all services</p>
            </div>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
