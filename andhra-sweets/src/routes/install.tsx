import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export const Route = createFileRoute("/install")({
  head: () => ({
    meta: [
      { title: "Get the App — Andhra Sweets" },
      { name: "description", content: "Install Andhra Sweets on your phone home screen like an app." },
      { property: "og:title", content: "Get the App — Andhra Sweets" },
      { property: "og:description", content: "Install Andhra Sweets on your phone." },
    ],
  }),
  component: Install,
});

type PromptEvent = Event & { prompt: () => Promise<void> };

function Install() {
  const [prompt, setPrompt] = useState<PromptEvent | null>(null);
  const [link, setLink] = useState("");
  useEffect(() => {
    setLink(window.location.origin);
    const h = (e: Event) => { e.preventDefault(); setPrompt(e as PromptEvent); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold text-primary">Get the mobile app</h1>
      <div className="card-soft space-y-3 p-5">
        <p>Open this link on your phone, then add it to the home screen:</p>
        <p className="break-all rounded-md bg-muted p-3 font-mono text-sm">{link}</p>
        {prompt && (
          <button className="btn btn-gold" onClick={() => prompt.prompt()}><Download className="h-4 w-4" />Install now</button>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card-soft p-5">
          <h2 className="mb-2 text-xl font-semibold">Android (Chrome)</h2>
          <p className="text-sm text-muted-foreground">Tap the ⋮ menu → <b>Install app</b> / <b>Add to Home screen</b>.</p>
        </div>
        <div className="card-soft p-5">
          <h2 className="mb-2 text-xl font-semibold">iPhone (Safari)</h2>
          <p className="text-sm text-muted-foreground">Tap the Share button → <b>Add to Home Screen</b>.</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">All items, shops and bills are saved on this phone only.</p>
    </div>
  );
}
