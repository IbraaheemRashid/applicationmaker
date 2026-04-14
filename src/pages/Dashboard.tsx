import {
  Briefcase,
  TrendingUp,
  Target,
  Clock,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAppStore } from '../store/useAppStore';
import { getStatusColor, getStatusLabel, timeAgo, scoreToGrade, getGradeColor } from '../utils/helpers';
import type { ApplicationStatus } from '../types';

export function Dashboard() {
  const { applications, activity } = useAppStore();
  const navigate = useNavigate();

  const activeStatuses: ApplicationStatus[] = ['applied', 'responded', 'interview', 'evaluating', 'applying'];
  const activeApps = applications.filter((a) => activeStatuses.includes(a.status));
  const interviews = applications.filter((a) => a.status === 'interview');
  const avgScore =
    applications.filter((a) => a.score !== null).reduce((sum, a) => sum + (a.score ?? 0), 0) /
      (applications.filter((a) => a.score !== null).length || 1) || 0;
  const interviewRate = applications.length
    ? (applications.filter((a) => ['interview', 'offer'].includes(a.status)).length / applications.length) * 100
    : 0;

  const statusCounts = applications.reduce(
    (acc, a) => ({ ...acc, [a.status]: (acc[a.status] || 0) + 1 }),
    {} as Record<string, number>
  );

  const stats = [
    {
      label: 'Total Applications',
      value: applications.length,
      icon: Briefcase,
      color: 'text-primary-400',
      bg: 'bg-primary-500/10',
    },
    {
      label: 'Active Pipeline',
      value: activeApps.length,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Interview Rate',
      value: `${interviewRate.toFixed(0)}%`,
      icon: Target,
      color: 'text-accent-400',
      bg: 'bg-accent-500/10',
    },
    {
      label: 'Avg Score',
      value: avgScore.toFixed(1),
      icon: TrendingUp,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-surface-400 mt-1">Your job search at a glance</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/evaluate')}>
            <Search size={16} />
            Evaluate Job
          </Button>
          <Button variant="secondary" onClick={() => navigate('/tracker')}>
            <Plus size={16} />
            Add Application
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-surface-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Pipeline Overview</h2>
          </div>
          <div className="space-y-3">
            {(['saved', 'evaluated', 'applied', 'interview', 'offer', 'rejected'] as ApplicationStatus[]).map(
              (status) => {
                const count = statusCounts[status] || 0;
                const pct = applications.length ? (count / applications.length) * 100 : 0;
                return (
                  <div key={status} className="flex items-center gap-3">
                    <div className="w-24 text-sm text-surface-300">{getStatusLabel(status)}</div>
                    <div className="flex-1 h-2.5 bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getStatusColor(status)} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-surface-200 w-8 text-right">{count}</span>
                  </div>
                );
              }
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <Clock size={16} className="text-surface-400" />
          </div>
          {activity.length === 0 ? (
            <div className="text-center py-8 text-surface-500">
              <p className="text-sm">No activity yet</p>
              <p className="text-xs mt-1">Start by adding an application</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activity.slice(0, 8).map((item) => (
                <div key={item.id} className="flex items-start gap-3 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-surface-200 truncate">{item.description}</p>
                    <p className="text-xs text-surface-500">{timeAgo(item.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {interviews.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Upcoming Interviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {interviews.map((app) => (
              <div
                key={app.id}
                className="p-4 bg-surface-800 rounded-lg border border-surface-700 hover:border-emerald-500/30 transition-colors cursor-pointer"
                onClick={() => navigate('/tracker')}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-white">{app.company}</h3>
                    <p className="text-sm text-surface-400">{app.role}</p>
                  </div>
                  {app.score !== null && (
                    <span className={`text-lg font-bold ${getGradeColor(scoreToGrade(app.score))}`}>
                      {scoreToGrade(app.score)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {applications.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase size={28} className="text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Ready to start your job search?</h3>
          <p className="text-surface-400 mb-6 max-w-md mx-auto">
            Add your first application or evaluate a job posting to get started with smart tracking.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/evaluate')}>
              <Search size={16} />
              Evaluate a Job
            </Button>
            <Button variant="secondary" onClick={() => navigate('/tracker')}>
              <Plus size={16} />
              Add Manually
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function Search(props: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
