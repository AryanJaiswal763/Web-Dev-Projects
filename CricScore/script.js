async function fetchTodayGames() {
  const today = '2025-06-04' // YYYY-MM-DD
  const scheduleUrl = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${today}`;
  
  try {
    const scheduleResponse = await fetch(scheduleUrl);
    const scheduleData = await scheduleResponse.json();
    
    const games = scheduleData.dates[0]?.games || [];
    const container = document.getElementById('score');
    container.innerHTML = ''; // Clear previous content
    
    for (const game of games) {
      const gameId = game.gamePk;
      const gameDiv = document.createElement('div');
      gameDiv.classList.add('game');

      // Fetch live data for each game
      const liveDataResponse = await fetch(`https://statsapi.mlb.com/api/v1.1/game/${gameId}/feed/live`);
      const liveData = await liveDataResponse.json();

      // Teams
      const home = liveData.gameData?.teams?.home || {};
      const away = liveData.gameData?.teams?.away || {};
      const linescore = liveData.liveData?.linescore || {};

      // Basic score
      const homeScore = linescore.teams?.home?.runs ?? 0;
      const awayScore = linescore.teams?.away?.runs ?? 0;

      // Logos (MLB static logos by team id)
      const homeLogo = home.id ? `https://www.mlbstatic.com/team-logos/${home.id}.svg` : '';
      const awayLogo = away.id ? `https://www.mlbstatic.com/team-logos/${away.id}.svg` : '';

      // Current inning info
      const inning = linescore.currentInning ?? 'N/A';
      const inningState = linescore.inningState ?? 'N/A';

      // Outs
      const outs = linescore.outs ?? 'N/A';

      // Inning-wise breakdown
      const innings = linescore.innings ?? [];
      let inningScoresHtml = '<table><tr><th>Inning</th>';
      for (let i = 0; i < innings.length; i++) inningScoresHtml += `<th>${i + 1}</th>`;
      inningScoresHtml += '<th>R</th></tr><tr><td>' + (away.name || '') + '</td>';
      innings.forEach(inning => inningScoresHtml += `<td>${inning.away?.runs ?? '-'}</td>`);
      inningScoresHtml += `<td>${awayScore}</td></tr><tr><td>${home.name || ''}</td>`;
      innings.forEach(inning => inningScoresHtml += `<td>${inning.home?.runs ?? '-'}</td>`);
      inningScoresHtml += `<td>${homeScore}</td></tr></table>`;

      gameDiv.innerHTML = `
        <div class="teams">
          <div class="team">
            ${awayLogo ? `<img src="${awayLogo}" alt="${away.name}" onerror="this.style.display='none'"/>` : ''}
            <strong>${away.name || 'Away Team'}</strong>: ${awayScore}
          </div>
          <div class="team">
            ${homeLogo ? `<img src="${homeLogo}" alt="${home.name}" onerror="this.style.display='none'"/>` : ''}
            <strong>${home.name || 'Home Team'}</strong>: ${homeScore}
          </div>
        </div>
        <div>Inning: ${inning} (${inningState}), Outs: ${outs}</div>
        <div class="inning-table">${inningScoresHtml}</div>
        <hr/>
      `;

      container.appendChild(gameDiv);
    }
  } catch (error) {
    console.error('Error fetching MLB data:', error);
    document.getElementById('score').innerText = 'Failed to load MLB data.';
  }
}

fetchTodayGames();
setInterval(fetchTodayGames, 1000);  // Refresh every 1 second

