import React, { useEffect, useState } from 'react';
import leaderboardService from '../services/leaderboard.service';

const LeaderboardPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const leaderboard = await leaderboardService.getLeaderboard();
        setData(leaderboard);
      } catch {
        setError("Failed to load leaderboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div style={{ padding: '40px', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Live Leaderboard</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontFamily: 'var(--font-inter-regular)' }}>
        Compare the performance of different AI models in the arena based on real matched battles.
      </p>

      {error && <p style={{ color: 'var(--error-color)', marginTop: '16px' }}>{error}</p>}

      <div style={{ marginTop: '32px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-inter-regular)' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '16px' }}>Rank</th>
              <th style={{ padding: '16px' }}>Model</th>
              <th style={{ padding: '16px' }}>Elo Rating</th>
              <th style={{ padding: '16px' }}>Win Rate</th>
              <th style={{ padding: '16px' }}>Matches</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>Calculating Elo Standings...</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>No battles have been fought yet!</td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.rank} style={{ borderTop: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px', fontFamily: 'var(--font-inter-bold)' }}>#{row.rank}</td>
                  <td style={{ padding: '16px', fontWeight: '500' }}>{row.name}</td>
                  <td style={{ padding: '16px', color: 'var(--accent-primary)', fontFamily: 'var(--font-inter-bold)' }}>{row.elo}</td>
                  <td style={{ padding: '16px' }}>{row.winRate}%</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{row.matches}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeaderboardPage;
