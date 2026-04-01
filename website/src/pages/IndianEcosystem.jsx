import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { AlertTriangle, CheckCircle, Lightbulb, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const IMPACT_ICONS = {
  High: AlertTriangle,
  Medium: TrendingUp,
  Low: CheckCircle
};

const IMPACT_COLORS = {
  High: 'bg-red-500',
  Medium: 'bg-orange-500',
  Low: 'bg-primary'
};

const IndianEcosystem = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await axios.get(`${API}/insights`);
      setInsights(response.data);
    } catch (error) {
      console.error('Error fetching insights:', error);
      // Removed user-facing toast per request; keep console warning for debugging
      console.warn('Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const groupedInsights = insights.reduce((acc, insight) => {
    const level = insight.impact_level;
    if (!acc[level]) acc[level] = [];
    acc[level].push(insight);
    return acc;
  }, {});

  return (
    <div className="space-y-6" data-testid="insights-page">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Indian Ecosystem</h1>
        <p className="text-muted-foreground mt-1">AI-generated insights and trend analysis</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card data-testid="total-insights-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
            <Lightbulb className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Generated insights</p>
          </CardContent>
        </Card>

        <Card data-testid="high-impact-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Impact</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights.filter(i => i.impact_level === 'High').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Critical insights</p>
          </CardContent>
        </Card>

        <Card data-testid="medium-impact-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Impact</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights.filter(i => i.impact_level === 'Medium').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Important insights</p>
          </CardContent>
        </Card>

        <Card data-testid="low-impact-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Impact</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights.filter(i => i.impact_level === 'Low').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">General insights</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights by Impact Level */}
      {['High', 'Medium', 'Low'].map(level => {
        const levelInsights = groupedInsights[level] || [];
        if (levelInsights.length === 0) return null;
        
        const Icon = IMPACT_ICONS[level];
        
        return (
          <div key={level} className="space-y-4" data-testid={`${level.toLowerCase()}-impact-section`}>
            <div className="flex items-center gap-3">
              <Icon className="h-6 w-6" />
              <h2 className="text-2xl font-bold">{level} Impact Insights</h2>
              <Badge className={IMPACT_COLORS[level]}>{levelInsights.length}</Badge>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {levelInsights.map((insight) => (
                <Card 
                  key={insight.id} 
                  className="hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)] transition-shadow"
                  data-testid={`insight-${insight.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{insight.title}</CardTitle>
                        <CardDescription className="mt-2">
                          <Badge variant="outline">{insight.category}</Badge>
                        </CardDescription>
                      </div>
                      <Badge className={IMPACT_COLORS[level]}>{level}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {insight.description}
                    </p>
                    
                    {insight.technologies && insight.technologies.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Related Technologies:</h4>
                        <div className="flex flex-wrap gap-2">
                          {insight.technologies.map((tech, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Generated on {new Date(insight.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* All Insights List */}
      {insights.length === 0 && (
        <Card data-testid="no-insights-card">
          <CardContent className="py-12 text-center">
            <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Insights Available</h3>
            <p className="text-muted-foreground">Insights will be generated automatically as technologies are added and analyzed</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IndianEcosystem;

