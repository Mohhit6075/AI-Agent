import { Button } from "./ui/Button"
import {
  Brain,
  Sparkles
} from "lucide-react";

export const Options = ({method}) => {
  return (
    <div
              className="sticky top-[74px] space-y-4"
              onClick={method}
            >
              <Button
                variant="secondary"
                className="w-full justify-between rounded-2xl px-4 py-6"
              >
                <span className="flex items-center gap-2 mr-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  New Chat
                </span>
                <Brain className="h-4 w-4 text-violet-300" />
              </Button>
              <div className="rounded-xl border border-white/10 bg-white/5 overflow-auto shadow-[0_10px_40px_-15px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between gap-4 p-4 px-3">
                  <span className="text-xs text-neutral-400">Model</span>
                  <span className="w-full text-amber-300 items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs">
                    Gemini-1.5-flash
                  </span>
                </div>
              </div>
            </div>
  )
}
