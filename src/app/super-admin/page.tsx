export default function SuperAdminPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">System Overview</h1>
          <p className="page-subtitle">Monitor platform health and agency activity</p>
        </div>
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {["Total Agencies", "Active", "On Trial", "Suspended"].map((label) => (
          <div key={label} className="card-dark">
            <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3">{label}</p>
            <div className="skeleton w-16 h-8 mb-1" style={{ background: "rgba(255,255,255,0.1)" }} />
            <div className="skeleton w-24 h-3 mt-2" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>
        ))}
      </div>
      {/* Attention + Jobs */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <p className="text-ink-muted text-sm font-medium mb-4">Subscriptions Needing Attention</p>
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton w-9 h-9 rounded-full" />
                <div className="flex-1">
                  <div className="skeleton w-32 h-3 mb-1.5" />
                  <div className="skeleton w-20 h-2.5" />
                </div>
                <div className="skeleton w-16 h-6 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <p className="text-ink-muted text-sm font-medium mb-4">System Jobs Status</p>
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton w-9 h-9 rounded-lg" />
                <div className="flex-1">
                  <div className="skeleton w-28 h-3 mb-1.5" />
                  <div className="skeleton w-16 h-2.5" />
                </div>
                <div className="skeleton w-14 h-6 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}