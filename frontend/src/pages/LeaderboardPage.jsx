import React from 'react';

const LeaderboardPage = () => {
  return (
    <div style={{ padding: '40px', width: '100%', maxWidth: '800px' }}>
      <h1>Top Models</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
        Compare the performance of different AI models in the arena.
      </p>

      <div style={{ marginTop: '32px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '16px' }}>Rank</th>
              <th style={{ padding: '16px' }}>Model</th>
              <th style={{ padding: '16px' }}>Elo Rating</th>
            </tr>
          </thead>
          <tbody>
            {/* Mock Rows placeholder until Leaderboard backend is connected */}
            {[
              { rank: 1, name: 'Model A (Turbo)', elo: 1250 },
              { rank: 2, name: 'Model B (Ultra)', elo: 1210 },
              { rank: 3, name: 'Model C (Standard)', elo: 1100 },
            ].map((row) => (
              <tr key={row.rank} style={{ borderTop: '1px solid var(--border-color)' }}>
                <td style={{ padding: '16px', fontFamily: 'var(--font-bold)' }}>#{row.rank}</td>
                <td style={{ padding: '16px' }}>{row.name}</td>
                <td style={{ padding: '16px', color: 'var(--accent-primary)' }}>{row.elo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeaderboardPage;
