import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useCTAs, useCTAAnalytics } from '@/hooks/useCTAs';
import { BarChart3, TrendingUp, MousePointer, Eye, Target, Calendar, Download } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AnalyticsData {
  cta_id: string;
  views: number;
  clicks: number;
  conversions: number;
  ctr: number; // Click-through rate
  conversionRate: number;
}

export const CTAAnalyticsDashboard: React.FC = () => {
  const { ctas } = useCTAs();
  const { getCTAAnalytics } = useCTAAnalytics();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedCTA, setSelectedCTA] = useState<string>('all');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod, selectedCTA]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - getPeriodMs(selectedPeriod)).toISOString();
      
      const rawData = await getCTAAnalytics(
        selectedCTA === 'all' ? undefined : selectedCTA,
        startDate,
        endDate
      );

      // Process analytics data
      const processedData = processAnalyticsData(rawData);
      setAnalyticsData(processedData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodMs = (period: string): number => {
    switch (period) {
      case '1d': return 24 * 60 * 60 * 1000;
      case '7d': return 7 * 24 * 60 * 60 * 1000;
      case '30d': return 30 * 24 * 60 * 60 * 1000;
      case '90d': return 90 * 24 * 60 * 60 * 1000;
      default: return 7 * 24 * 60 * 60 * 1000;
    }
  };

  const processAnalyticsData = (rawData: any[]): AnalyticsData[] => {
    const ctaMap = new Map<string, AnalyticsData>();

    rawData.forEach((event) => {
      const ctaId = event.cta_id;
      
      if (!ctaMap.has(ctaId)) {
        ctaMap.set(ctaId, {
          cta_id: ctaId,
          views: 0,
          clicks: 0,
          conversions: 0,
          ctr: 0,
          conversionRate: 0
        });
      }

      const data = ctaMap.get(ctaId)!;
      
      switch (event.event_type) {
        case 'view':
          data.views++;
          break;
        case 'click':
          data.clicks++;
          break;
        case 'conversion':
          data.conversions++;
          break;
      }
    });

    // Calculate rates
    return Array.from(ctaMap.values()).map(data => ({
      ...data,
      ctr: data.views > 0 ? (data.clicks / data.views) * 100 : 0,
      conversionRate: data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0
    }));
  };

  const getCTAName = (ctaId: string) => {
    const cta = ctas.find(c => c.id === ctaId);
    return cta?.name || 'Unknown CTA';
  };

  const getTotalStats = () => {
    return analyticsData.reduce(
      (acc, data) => ({
        totalViews: acc.totalViews + data.views,
        totalClicks: acc.totalClicks + data.clicks,
        totalConversions: acc.totalConversions + data.conversions,
        avgCTR: 0, // Will calculate below
        avgConversionRate: 0 // Will calculate below
      }),
      { totalViews: 0, totalClicks: 0, totalConversions: 0, avgCTR: 0, avgConversionRate: 0 }
    );
  };

  const totalStats = getTotalStats();
  totalStats.avgCTR = totalStats.totalViews > 0 ? (totalStats.totalClicks / totalStats.totalViews) * 100 : 0;
  totalStats.avgConversionRate = totalStats.totalClicks > 0 ? (totalStats.totalConversions / totalStats.totalClicks) * 100 : 0;

  // Chart data
  const chartData = analyticsData.map(data => ({
    name: getCTAName(data.cta_id).substring(0, 20),
    views: data.views,
    clicks: data.clicks,
    conversions: data.conversions,
    ctr: data.ctr
  }));

  const pieData = analyticsData.map(data => ({
    name: getCTAName(data.cta_id),
    value: data.clicks
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">CTA Analytics</h1>
          <p className="text-muted-foreground">Track performance and optimize your call-to-action campaigns</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCTA} onValueChange={setSelectedCTA}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All CTAs</SelectItem>
              {ctas.map((cta) => (
                <SelectItem key={cta.id} value={cta.id}>
                  {cta.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalytics}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +0% from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +0% from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalConversions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +0% from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg CTR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.avgCTR.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              Click-through rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.avgConversionRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              Click to conversion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#8884d8" name="Views" />
                <Bar dataKey="clicks" fill="#82ca9d" name="Clicks" />
                <Bar dataKey="conversions" fill="#ffc658" name="Conversions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Click Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CTA Name</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Conversions</TableHead>
                <TableHead>CTR</TableHead>
                <TableHead>Conversion Rate</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analyticsData.map((data) => (
                <TableRow key={data.cta_id}>
                  <TableCell className="font-medium">
                    {getCTAName(data.cta_id)}
                  </TableCell>
                  <TableCell>{data.views.toLocaleString()}</TableCell>
                  <TableCell>{data.clicks.toLocaleString()}</TableCell>
                  <TableCell>{data.conversions.toLocaleString()}</TableCell>
                  <TableCell>{data.ctr.toFixed(2)}%</TableCell>
                  <TableCell>{data.conversionRate.toFixed(2)}%</TableCell>
                  <TableCell>
                    {data.ctr > totalStats.avgCTR ? (
                      <Badge variant="default">Above Average</Badge>
                    ) : data.ctr > totalStats.avgCTR * 0.7 ? (
                      <Badge variant="secondary">Average</Badge>
                    ) : (
                      <Badge variant="outline">Below Average</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {analyticsData.length === 0 && (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">No analytics data found</div>
              <p className="text-sm text-muted-foreground">
                CTAs need to be viewed or clicked to generate analytics data.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};