import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { formatEther } from "viem";

export type BetHistoryItem = {
  ticketId?: bigint;
  marketId: bigint;
  outcome: number;
  stakeWei: bigint;
  txHash: string;
  createdAt: number;
  status: "pending" | "success" | "failed";
};

type BetsHistoryTableProps = {
  entries: BetHistoryItem[];
};

const outcomeLabel = (value: number) => {
  const fallback = `Outcome ${value + 1}`;
  return ["Team A Victory", "Team B Victory", "Draw"][value] ?? fallback;
};

export const BetsHistoryTable = ({ entries }: BetsHistoryTableProps) => {
  if (!entries.length) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Your encrypted bets will appear here once submitted.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-muted/20 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-muted-foreground">Match</TableHead>
            <TableHead className="text-muted-foreground">Outcome</TableHead>
            <TableHead className="text-muted-foreground">Stake (ETH)</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.txHash} className="hover:bg-muted/40">
              <TableCell className="font-medium text-foreground">#{entry.marketId.toString()}</TableCell>
              <TableCell className="text-foreground">{outcomeLabel(entry.outcome)}</TableCell>
              <TableCell className="text-foreground">
                {Number.parseFloat(formatEther(entry.stakeWei)).toFixed(3)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    entry.status === "success" ? "default" : entry.status === "pending" ? "secondary" : "destructive"
                  }
                >
                  {entry.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDistanceToNow(entry.createdAt, { addSuffix: true })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
