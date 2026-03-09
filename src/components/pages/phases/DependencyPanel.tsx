import { X } from "lucide-react"
import type { PhaseResponse } from "@/types"
import { card } from "@/styles"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DependencyPanelProps {
  selectedPhase: PhaseResponse
  phases: PhaseResponse[]
  dependencies: string[]
  onAddDependency: (dependsOnId: string) => void
  onRemoveDependency: (dependsOnId: string) => void
}

export function DependencyPanel({
  selectedPhase,
  phases,
  dependencies,
  onAddDependency,
  onRemoveDependency,
}: DependencyPanelProps) {
  const depPhases = phases.filter((p) => dependencies.includes(p.id))
  const availablePhases = phases.filter(
    (p) => p.id !== selectedPhase.id && !dependencies.includes(p.id),
  )

  return (
    <div className={card.padded}>
      <h4 className="text-sm font-semibold text-preto mb-3">
        Dependencies for &ldquo;{selectedPhase.name}&rdquo;
      </h4>

      {depPhases.length > 0 ? (
        <ul className="space-y-2 mb-4">
          {depPhases.map((dep) => (
            <li
              key={dep.id}
              className="flex items-center justify-between rounded-lg border border-areia/20 bg-surface-alt/50 px-3 py-2"
            >
              <span className="text-sm text-preto">{dep.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveDependency(dep.id)}
                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-verde/60 mb-4">
          No dependencies. This phase can start immediately.
        </p>
      )}

      {availablePhases.length > 0 && (
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Select onValueChange={onAddDependency}>
              <SelectTrigger>
                <SelectValue placeholder="Add a dependency..." />
              </SelectTrigger>
              <SelectContent>
                {availablePhases.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
