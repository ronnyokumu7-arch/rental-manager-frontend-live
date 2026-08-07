export function SettingsLayout() {
  return (
    <div className="min-h-screen bg-bg text-ink p-6 md:p-10 font-sans transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex justify-between items-center pb-6 border-b border-surface-border">
          <div>
            <h1 className="text-2xl font-bold text-ink">Company Settings</h1>
            <p className="text-sm text-ink-muted">Manage your business details and brand identity.</p>
          </div>
          <button className="px-4 py-2 bg-primary hover:bg-primary-hover active:bg-primary-active text-ink-inverse font-medium rounded-lg shadow-sm transition-all">
            Save Changes
          </button>
        </header>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (Main Form - 7 cols) */}
          <section className="lg:col-span-7 bg-surface border border-surface-border rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow space-y-4">
            <h2 className="text-lg font-semibold text-ink">General Details</h2>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-secondary">Business Name</label>
              <input 
                type="text" 
                defaultValue="Acme Fleet Rentals"
                className="w-full px-3 py-2 bg-bg-elevated border border-surface-border rounded-md text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-secondary">Support Email</label>
              <input 
                type="email" 
                defaultValue="support@acme.com"
                className="w-full px-3 py-2 bg-bg-elevated border border-surface-border rounded-md text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </section>

          {/* Right Column (Logo & Admin Form - 5 cols) */}
          <section className="lg:col-span-5 space-y-6">
            
            {/* Logo Card */}
            <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-card space-y-3">
              <h3 className="text-md font-semibold text-ink">Company Logo</h3>
              <div className="border-2 border-dashed border-surface-border-strong rounded-lg p-6 text-center bg-bg-elevated hover:bg-surface-hover transition-colors cursor-pointer">
                <span className="text-sm text-ink-muted">Click to upload SVG or PNG</span>
              </div>
            </div>

            {/* Admin Form Card */}
            <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-card space-y-3">
              <h3 className="text-md font-semibold text-ink">Admin Contact</h3>
              <p className="text-xs text-ink-subtle">Primary administrator for system notifications.</p>
              
              <input 
                type="text" 
                placeholder="Admin Full Name"
                className="w-full px-3 py-2 bg-bg-elevated border border-surface-border rounded-md text-ink text-sm focus:ring-2 focus:ring-primary"
              />
            </div>

          </section>

        </div>
      </div>
    </div>
  );
}
