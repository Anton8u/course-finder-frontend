import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronsUpDown } from "lucide-react";

interface Props {
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  emptyLabel: string;
  countLabel: (n: number) => string;
}

export function MultiSelectPopover({
  options,
  selected,
  onToggle,
  emptyLabel,
  countLabel,
}: Props) {
  const label = useMemo(() => {
    if (selected.length === 0) return emptyLabel;
    if (selected.length <= 2) return selected.join(", ");
    return countLabel(selected.length);
  }, [selected, emptyLabel, countLabel]);

  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between font-normal">
            <span className="truncate">{label}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-2">
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {options.map((p) => (
              <label
                key={p}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
              >
                <Checkbox
                  checked={selected.includes(p)}
                  onCheckedChange={() => onToggle(p)}
                />
                <span className="text-sm">{p}</span>
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((p) => (
            <Badge
              key={p}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => onToggle(p)}
            >
              {p} ✕
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
