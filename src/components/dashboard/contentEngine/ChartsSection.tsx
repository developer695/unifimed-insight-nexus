import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { ProductionTrend, TopPerformingContent } from "@/types/content-engine";

interface ChartsSectionProps {
    productionTrendData: ProductionTrend[];
    topPerformingData: TopPerformingContent[];
}

export const ChartsSection = ({ productionTrendData, topPerformingData }: ChartsSectionProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Production Velocity by Type</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={productionTrendData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="week" className="text-xs" />
                            <YAxis className="text-xs" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "0.5rem",
                                }}
                            />
                            <Legend />
                            <Area type="monotone" dataKey="blogs" name="Blogs" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" />
                            <Area type="monotone" dataKey="social" name="Social" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" />
                            <Area type="monotone" dataKey="newsletters" name="Newsletters" stackId="1" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" />
                            <Area type="monotone" dataKey="graphics" name="Graphics" stackId="1" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Top Performing Content</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topPerformingData.slice(0, 4)} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis type="number" className="text-xs" />
                            <YAxis dataKey="title" type="category" className="text-xs" width={180} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "0.5rem",
                                }}
                            />
                            <Legend />
                            <Bar dataKey="leads" name="Leads Generated" fill="hsl(var(--chart-4))" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};