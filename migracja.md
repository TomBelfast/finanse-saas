● Widzę że komponenty shadcn/ui (Insurances, Loans) poprawnie używają CSS variables. To jest OK.

  Sprawdzę Dashboard - czy bg-muted/50 jest problemem:

● Bash(grep -n "bg-muted" "K:/SSSAAAAAAS dzialajacy/apps/web-app/src/pages/Dashboard/Dashboard.tsx")
  ⎿  71:          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min mt-4">

● Przywróciłem oryginalne pliki. Sprawdź czy tryb jasny teraz działa.

  Jeśli nie - powiedz mi która konkretna strona jest zepsuta i co dokładnie widzisz (czarne tło, niewidoczny tekst, etc).

  Odnośnie migracji z Ant Design do shadcn/ui - to jest duże zadanie. Czy chcesz żebym to zaplanował?