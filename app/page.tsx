'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import VideoHeader from './components/VideoHeader';
import InputForm from './components/InputForm';
import MatchTable from './components/MatchTable';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// 🕒 Convertit les secondes en format mm:ss
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

export default function Home() {
  const [csvGenerated, setCsvGenerated] = useState(false);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [selectedLink, setSelectedLink] = useState<string>('');
  const [customUrl, setCustomUrl] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isWaitingModalOpen, setIsWaitingModalOpen] = useState(false);

  const matchLinks = [

      { name: "Richmond", url: "/api/espn?gameId=401829153" },
   
     { name: "Fordham", url: "/api/espn?gameId=401829143" },
   
     { name: "La Salle", url: "/api/espn?gameId=401829140" },
   
     { name: "George Mason", url: "/api/espn?gameId=401829132" },
   
 { name: "VCU Rams", url: "/api/espn?gameId=401829129" },
   
       { name: "Saint Louis", url: "/api/espn?gameId=401829123" },
   
    { name: "St Joseph's", url: "/api/espn?gameId=401829116" },
   
    //  { name: "Fordham", url: "/api/espn?gameId=401829106" },
   
      // { name: "Dayton", url: "/api/espn?gameId=401829096" },
   
  // { name: "Davidson", url: "/api/espn?gameId=401829086" },
   
  //      { name: "Duquesne", url: "/api/espn?gameId=401829082" },
   
      // { name: "VCU Rams", url: "/api/espn?gameId=401829076" },
   
      // { name: "Saint Bonaventure", url: "/api/espn?gameId=401829068" },
   
//      { name: "George Washington", url: "/api/espn?gameId=401829061" },
//       { name: "Loyola", url: "/api/espn?gameId=401829034" },
 
//      { name: "Richmond", url: "/api/espn?gameId=401829029" },
 
//     { name: "Wagner", url: "/api/espn?gameId=401825008" },
 
// { name: "Providence", url: "/api/espn?gameId=401825007" },
 
// { name: "Black Bears", url: "/api/espn?gameId=401822844" },
 
// { name: "Saint Joseph's", url: "/api/espn?gameId=401829021" },
//     { name: "Princeton", url: "/api/espn?gameId=401825006" },
// { name: "NC State", url: "/api/espn?gameId=401817578" },
// { name: "Holy Cross", url: "/api/espn?gameId=401823108" },
 


// { name: "UAlbany", url: "/api/espn?gameId=401825005" },
//   { name: "Rutgers", url: "/api/espn?gameId=401813740" },
 

//         { name: "Emmanuel", url: "/api/espn?gameId=401825004" },
//    { name: "Merrimack", url: "/api/espn?gameId=401825003" },
 

//         { name: "Manhattan", url: "/api/espn?gameId=401813825" },
  ];

  // 🔁 Fonction principale
  const handleGenerate = async () => {
    // Si aucun match choisi
    if (selectedLink === "none") {
      setModalMessage("Inès s’échauffe 🏀");
      setIsWaitingModalOpen(true);
      setTimeout(() => setIsWaitingModalOpen(false), 3000);
      return;
    }

    const url = selectedLink || customUrl || "https://sidearmstats.com/rice/wbball/game.json?detail=full";

    try {
      let response;
      if (url.startsWith("/")) {
        response = await fetch(url); // API interne (pas de CORS)
      } else {
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
        response = await fetch(proxyUrl);
      }

      const data = await response.json();

      // 🧩 Accepte à la fois un tableau brut ou data.Plays
      const plays = Array.isArray(data)
        ? data
        : Array.isArray(data?.Plays)
        ? data.Plays
        : [];

      if (!plays.length) {
        console.error("Aucune donnée trouvée :", data);
        // 🟣 Ici on met le même message que pour le cas "échauffement"
        setModalMessage("Inès s’échauffe 🏀");
        setIsWaitingModalOpen(true);
        setTimeout(() => setIsWaitingModalOpen(false), 3000);
        return;
      }

      console.log("✅ Données ESPN récupérées :", plays.length, "actions");
      console.log("👀 Exemple :", plays[0]);

      // ✅ Tes données sont déjà au bon format [period, chrono, action, réussite]
      setCsvData(plays);
      setCsvGenerated(true);

    } catch (error) {
      console.error("Erreur dans handleGenerate:", error);
      setModalMessage("Erreur pendant le chargement des données 😅");
      setIsModalOpen(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 sm:p-12 gap-8 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <VideoHeader className="absolute top-0 left-0 w-full" />

      <main className="flex flex-col items-center gap-6 w-full max-w-lg sm:max-w-2xl md:max-w-4xl">
        <Select value={selectedLink} onValueChange={setSelectedLink}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionne un match" />
          </SelectTrigger>
          <SelectContent>
            {matchLinks.map((link) => (
              <SelectItem key={link.url} value={link.url}>
                {link.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <InputForm 
          value={customUrl} 
          onChange={(e) => setCustomUrl(e.target.value)} 
          onGenerate={handleGenerate} 
        />

        {csvGenerated && (
          <div className="w-full overflow-x-auto">
            <MatchTable data={csvData} />
          </div>
        )}
      </main>

      {/* ⚠️ Modale d'erreur */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[80%] max-w-xs rounded-lg shadow-lg bg-white dark:bg-gray-800 p-6">
          <DialogHeader>
            <DialogTitle className="text-center mb-4">⚠️ Erreur</DialogTitle>
            <DialogDescription className="text-center mt-4">{modalMessage}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* ⏳ Modale d’attente */}
      <Dialog open={isWaitingModalOpen} onOpenChange={setIsWaitingModalOpen}>
        <DialogContent className="w-[80%] max-w-xs rounded-lg shadow-lg bg-white dark:bg-gray-800 p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 mb-2">⏳ Patiente</DialogTitle>
            <DialogDescription className="text-center mt-2">{modalMessage}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <footer className="text-sm text-gray-900 mt-8">
        <a
          href="https://www.youtube.com/@fan_lucilej"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Produit par @fan_carlaleite
        </a>
      </footer>
    </div>
  );
}
