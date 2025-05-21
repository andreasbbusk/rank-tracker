# Rank Tracker

Her følger en oversigt over den relevante kode i forhold til Rank Trackeren. Da der ikke kan gives adgang til det private repository, hvori Rank Trackeren ligger, følger her en rendering af, hvad den relevante kode er.

## Introduktion

Rank Tracker er et internt SEO-værktøj udviklet for det digitale bureau Conversio. Formålet med værktøjet er at understøtte SEO-specialisters daglige arbejde ved at monitorere og analysere søgeordsplaceringer over tid, visualisere søgedata på en lettilgængelig måde og integrere med virksomhedens eksisterende platform, Conversio Hub. Værktøjet er udviklet som et Minimum Viable Product (MVP) med henblik på at reducere afhængigheden af eksterne, omkostningstunge løsninger.

---

## Kode Struktur Overblik

Rank Tracker er implementeret som et modul inden for Conversio Hubs eksisterende Next.js frontend-arkitektur. Adgang til værktøjet sker via sidestrukturen:
`frontend/app/(client)/tool/rank-tracker-old/`

Selve Rank Tracker modulets kernemappe er placeret her:
`frontend/modules/rank-tracker-old/`

Internt i dette modul er koden organiseret modulært for at fremme vedligeholdelse, skalerbarhed og genbrug:

* **/actions**: Indeholder Server Actions for backend-kommunikation (f.eks. `ranker-domain.actions.ts`, `ranker-keyword.actions.ts`).
* **/components**: Huser UI-komponenter, yderligere opdelt efter ansvarsområde (f.eks. `/domain`, `/keywords`, `/graphs`, `/shared`).
    * Eksempler: `DomainTable.tsx`, `KeywordTableWrapper.tsx`, `GeneralGraph.tsx`, `AddDomainDialog.tsx`, `AddKeywordDialog.tsx`.
* **/constants**: Indeholder statiske data og konstanter (f.eks. `iso-countries.ts`).
* **/hooks**: Specialudviklede React hooks for genanvendelig state-logik (f.eks. `useDomainTable.tsx`, `useKeywordTable.tsx`).
* **/store**: Global state management med Zustand (konfigureret i `index.ts`).
* **/types**: TypeScript type-definitioner (interfaces og types i `index.ts`, `types.ts`).
* **/utils**: Diverse hjælpefunktioner (f.eks. `helpers.ts`, `calculate-dashboard-metrics.ts`).

Denne struktur understøtter princippet om "Separation of Concerns", hvor UI-komponenter holdes adskilt fra datahåndteringslogik.

---

## Kernefunktionaliteter

Rank Tracker er designet til at levere en række centrale funktioner, der imødekommer SEO-specialisters behov:

* **Integration med Google Search Console (GSC)**: Importerer domæner og søgeord direkte fra GSC.
* **Søgeordsregistrering og -tracking**: Overvåger søgeordsplaceringer, klik, visninger og Click-Through Rate (CTR).
* **Datavisualisering over tid**: Præsenterer SEO-data gennem interaktive grafer (linje- og søjlediagrammer) og tabeller, der viser udviklingen.
* **Sammenligning af datoperioder**: Giver mulighed for at sammenligne performance mellem forskellige tidsintervaller.
* **Dashboard-overblik**: Tilbyder et centralt dashboard med nøgletal for hurtig status på tværs af søgeord.
* **Filtrering og organisering**: Indeholder funktioner til at filtrere data baseret på placering, ændringer i metrikker, brand/non-brand, samt mulighed for at gruppere og tagge søgeord.
* **Håndtering af domæner og søgeord**: Giver brugeren mulighed for at tilføje, redigere og slette domæner og søgeord.
* **Optimistiske opdateringer**: Sikrer en hurtig og responsiv brugeroplevelse ved at opdatere UI'et øjeblikkeligt, før serveren har bekræftet handlinger som sletning af søgeord.
* **Håndtering af længerevarende processer**: Nye søgeord tilføjes som baggrundsjobs, så brugeren kan fortsætte arbejdet uforstyrret, mens systemet henter indledende data. Brugeren informeres om status via notifikationer.

---

## Teck-stack

Projektet er udviklet med følgende teknologier:

* **Frontend Framework**: Next.js
* **Programmeringssprog**: TypeScript
* **Styling**: Tailwind CSS
* **UI Komponenter**: Shadcn/UI og Radix UI
* **State Management**: Zustand
* **Datavisualisering**: Recharts
* **Server Actions**: Next.js Server Actions

---
