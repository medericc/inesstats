'use client';

import { useEffect, useState } from 'react';
import MatchTable from './components/Matchtable';

export default function Home() {
  const [data, setData] = useState<string[][]>([]);

  useEffect(() => {
    const fetchAndParse = async () => {
      try {
        const res = await fetch('/api/stats');
        const html = await res.text();
         console.log('HTML reçu:', html);
        // Découper par période
        const periodBlocks = html.split(/<div class="card-header card-title">Period\s+(\d)\s+Plays<\/div>/);

        const allRows: string[][] = [];

        for (let i = 1; i < periodBlocks.length; i += 2) {
          const period = periodBlocks[i]; // "1", "2", "3", ...
          const htmlContent = periodBlocks[i + 1];
          if (!htmlContent) continue;

          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlContent, 'text/html');
          const rows = Array.from(doc.querySelectorAll('tr.pxprow'));

          for (const row of rows) {
            const text = row.textContent?.toLowerCase() || '';
            if (!text.includes('ines')) continue;

            const chrono = row.querySelector('td.text-center')?.textContent?.trim() || '';
            const actionType = (() => {
              if (row.classList.contains('pxp_GOOD')) return '2pt'; // ou 3pt/1pt si tu veux affiner
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

            allRows.push([period, chrono, actionType, success]);
          }
        }

        setData(allRows);
      } catch (err) {
        console.error('Erreur parsing:', err);
      }
    };

    fetchAndParse();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4 text-center">Actions d’Inès Debroise</h1>
      <MatchTable data={data} />
    </div>
  );
}
