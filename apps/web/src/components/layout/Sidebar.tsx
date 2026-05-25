import { Layers, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { cn } from '../../lib/utils';

export function Sidebar() {
  const { user, logout } = useAuthStore();

  return (
    <aside className="flex h-screen w-56 flex-col border-r bg-white">
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-sm font-semibold text-gray-700">platform</span>
        <span className="ml-1 text-xs text-gray-400">{'<<'}</span>
      </div>

      <nav className="flex-1 p-3">
        <div
          className={cn(
            'flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium',
            'bg-gray-100 text-gray-900',
          )}
        >
          <Layers className="h-4 w-4" />
          Services
        </div>
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-700">{user?.name}</span>
          </div>
          <button onClick={logout} className="text-gray-400 hover:text-gray-600">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
