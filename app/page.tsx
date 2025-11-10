'use client';

import { useEffect, useState } from 'react';
import MatchTable from './components/Matchtable';

export default function Home() {
  const [data, setData] = useState<string[][]>([]);

  useEffect(() => {
    const fetchCTE = async () => {
      try {
        // Exemple : ID de match 620906 — à changer selon le match
        const res = await fetch('/api/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ game: '620906' }),
        });

        const html = await res.text();
        console.log('HTML reçu:', html);

        // Parse le HTML du play-by-play
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const rows = Array.from(doc.querySelectorAll('tr.pxprow'));
        const allRows: string[][] = [];

        for (const row of rows) {
          const text = row.textContent?.toLowerCase() || '';
          if (!text.includes('ines')) continue;

          const chrono = row.querySelector('td.text-center')?.textContent?.trim() || '';
          const actionType = (() => {
            if (row.classList.contains('pxp_GOOD')) return '2pt';
            if (row.classList.contains('pxp_MISS')) return '2pt';
            if (row.classList.contains('pxp_REBOUND')) return 'rebound';
            if (row.classList.contains('pxp_ASSIST')) return 'assist';
            if (row.classList.contains('pxp_STEAL')) return 'steal';
            if (row.classList.contains('pxp_BLOCK')) return 'block';
            if (row.classList.contains('pxp_TURNOVER')) return 'turnover';
            if (row.classList.contains('pxp_FOUL')) return 'foul';
            return 'other';
          })();

          const success = (() => {
            if (row.classList.contains('pxp_GOOD')) return '1';
            if (row.classList.contains('pxp_MISS')) return '0';
            if (row.classList.contains('pxp_TURNOVER') || row.classList.contains('pxp_FOUL')) return '0';
            return '1';
          })();

          allRows.push(['?', chrono, actionType, success]); // '?' car pas de notion de période ici
        }

        setData(allRows);
      } catch (err) {
        console.error('Erreur parsing:', err);
      }
    };

    fetchCTE();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4 text-center">Actions d’Inès Debroise</h1>
      <MatchTable data={data} />
    </div>
  );
}
