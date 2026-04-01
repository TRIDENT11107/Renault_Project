import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { Calendar, Sparkles, Target, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RING_COLORS = {
  'Adopt': '#22C55E',
  'Trial': '#86EFAC',
  'Assess': '#FBBF24',
  'Hold': '#F87171'
};
const RING_TEXT_COLORS = {
  'Adopt': '#FFFFFF',
  'Trial': '#14532D',
  'Assess': '#1E293B',
  'Hold': '#FFFFFF'
};

const TechnologyRoadmap = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const response = await axios.get(`${API}/roadmap`);
      setPredictions(response.data);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      console.warn('Failed to load roadmap predictions');
    } finally {
      setLoading(false);
    }
  };

  const generatePredictions = async () => {
    setGenerating(true);
    try {
      const response = await axios.post(`${API}/roadmap/generate`);
      setPredictions(response.data.predictions);
      toast.success(`Generated ${response.data.predictions.length} predictions!`);
    } catch (error) {
      console.error('Error generating predictions:', error);
      console.warn('Failed to generate predictions');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const predictionsByYear = predictions.reduce((acc, pred) => {
    const year = pred.prediction_year;
    if (!acc[year]) acc[year] = [];
    acc[year].push(pred);
    return acc;
  }, {});

  return (
    <div className="space-y-6" data-testid="roadmap-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Technology Roadmap</h1>
          <p className="text-muted-foreground mt-1">AI-powered predictions for technology evolution</p>
        </div>

        <Button
          onClick={generatePredictions}
          disabled={generating}
          data-testid="generate-predictions-button"
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Predictions
            </>
          )}
        </Button>
      </div>

      {predictions.length === 0 ? (
        <Card data-testid="no-predictions-card">
          <CardContent className="py-12 text-center">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Predictions Yet</h3>
            <p className="text-muted-foreground mb-4">Click the button above to generate AI-powered technology roadmap predictions</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card data-testid="total-predictions-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{predictions.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Technologies analyzed</p>
              </CardContent>
            </Card>

            <Card data-testid="avg-confidence-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length * 100).toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Prediction accuracy</p>
              </CardContent>
            </Card>

            <Card data-testid="moving-adopt-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Moving to Adopt</CardTitle>
                <Calendar className="h-4 w-4 text-[#16A34A]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {predictions.filter(p => p.predicted_ring === 'Adopt').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Ready for adoption</p>
              </CardContent>
            </Card>

            <Card data-testid="under-trial-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Moving to Trial</CardTitle>
                <Sparkles className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {predictions.filter(p => p.predicted_ring === 'Trial').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Entering trial phase</p>
              </CardContent>
            </Card>
          </div>

          {Object.entries(predictionsByYear).sort(([a], [b]) => a - b).map(([year, preds]) => (
            <Card key={year} data-testid={`year-${year}-predictions`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {year} Predictions
                </CardTitle>
                <CardDescription>{preds.length} technology transitions expected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {preds.map((pred) => (
                    <div
                      key={pred.id}
                      className="p-4 rounded-lg border border-border bg-secondary"
                      data-testid={`prediction-${pred.id}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{pred.technology_name}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              style={{ backgroundColor: RING_COLORS[pred.current_ring], color: RING_TEXT_COLORS[pred.current_ring] }}
                              className="border-0"
                            >
                              {pred.current_ring}
                            </Badge>
                            <span className="text-muted-foreground">-&gt;</span>
                            <Badge
                              style={{ backgroundColor: RING_COLORS[pred.predicted_ring], color: RING_TEXT_COLORS[pred.predicted_ring] }}
                              className="border-0"
                            >
                              {pred.predicted_ring}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Confidence</div>
                          <div className="text-2xl font-bold text-primary">
                            {(pred.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {pred.reasoning}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <Card data-testid="confidence-chart">
            <CardHeader>
              <CardTitle>Prediction Confidence Levels</CardTitle>
              <CardDescription>Distribution of confidence scores across predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={predictions.map((pred, idx) => ({
                  name: pred.technology_name.substring(0, 20) + '...',
                  confidence: pred.confidence * 100,
                  index: idx
                }))}>
                  <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                  <XAxis dataKey="index" hide />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748B' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="confidence" stroke="#16A34A" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default TechnologyRoadmap;

