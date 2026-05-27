import { Badge } from '../ui/badge';

interface Props {
  status: 'active' | 'draft' | 'inactive';
}

export function StatusBadge({ status }: Props) {
  if (status === 'active') return <Badge variant="default">Active</Badge>;
  if (status === 'draft') return <Badge variant="secondary">Draft</Badge>;
  return <Badge variant="outline">Inactive</Badge>;
}
