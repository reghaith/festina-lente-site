import { useAuth } from '@/lib/auth';
import { useExp } from '@/lib/use-exp';

interface ExpDisplayProps {
  userName?: string;
}

export function ExpDisplay({ userName }: ExpDisplayProps) {
  const { user } = useAuth();
  const { exp, loading } = useExp(user?.id || null);

  const displayName = userName || user?.name || user?.email?.split('@')[0] || 'User';
  const displayValue = loading ? '...' : (exp?.total_exp || 0);
  const displayLabel = 'EXP';

  return (
    <div className="bg-surface-primary rounded-xl shadow-xl border border-divider p-6 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary">
            Welcome back, {displayName}! 👋
          </h2>
          <p className="text-secondary">
            Ready to earn more today? Check out your progress below.
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-success">
            {displayValue} {displayLabel}
          </div>
          <div className="text-sm text-muted">
            Level {loading ? '...' : (exp?.current_level || 1)}
          </div>
        </div>
      </div>
    </div>
  );
}