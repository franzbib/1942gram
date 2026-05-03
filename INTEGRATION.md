# Intégration Mission Nuance

Le jeu expose un contrat stable sur `window.MissionNuance`.

```ts
window.MissionNuance.CONTRACT = {
  gameId: "mission-nuance",
  version: "0.9.0",
  completeEventName: "missionNuance:complete",
  completeMessageType: "mission-nuance:complete",
  minScorePercent: 70,
  requiredLevel: "B2"
};
```

## CustomEvent

Une réussite déclenche :

```ts
window.addEventListener("missionNuance:complete", (event) => {
  console.log(event.detail);
});
```

## Iframe

Si le jeu est intégré dans une iframe, le parent peut écouter :

```ts
window.addEventListener("message", (event) => {
  if (event.data?.type === "mission-nuance:complete") {
    console.log(event.data.payload);
  }
});
```

## Payload

```ts
{
  gameId: "mission-nuance",
  version: "0.9.0",
  success: true,
  level: "B2",
  mode: "arcade",
  theme: "argumentation",
  score: 12800,
  scorePercent: 82,
  precision: 0.86,
  discernment: 0.78,
  bossCompleted: true,
  timestamp: "..."
}
```

`safeDispatchCompletion(result)` évite les doubles émissions pour une même fin de partie réussie.
