import { Badge } from '../ui/badge';

interface Props {
  status: 'active' | 'draft' | 'inactive';
}

export function StatusBadge({ status }: Props) {
  if (status === 'active') return <Badge variant="success">Active</Badge>;
  if (status === 'draft') return <Badge variant="warning">Draft</Badge>;
  return <Badge variant="inactive">Inactive</Badge>;
}
