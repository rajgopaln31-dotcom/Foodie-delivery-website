export function CardSkeletons({ count = 4 }: { count?: number }) {
  return (
    <div className="grid" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card">
          <div className="skeleton" style={{ height: 150 }} />
          <div className="card-body">
            <div className="skeleton" style={{ height: 16, width: '70%' }} />
            <div className="skeleton" style={{ height: 12, width: '45%', marginTop: 10 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="empty-state">
      <div className="empty-emoji">⚠️</div>
      <h3>Something went wrong</h3>
      <p className="muted">{message}</p>
      <button className="btn btn-primary" onClick={onRetry}>Try again</button>
    </div>
  );
}
