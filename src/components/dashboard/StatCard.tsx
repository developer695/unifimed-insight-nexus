import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  subtitle?: string;
}

export function StatCard({ title, value, change, changeLabel, icon, subtitle }: StatCardProps) {

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}

      </CardContent>
    </Card>
  );
}
