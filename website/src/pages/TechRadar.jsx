import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, RadarChart, Radar as RechartsRadar, ResponsiveContainer, Tooltip } from 'recharts';

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

const TechRadar = () => {
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRing, setSelectedRing] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTech, setSelectedTech] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchTechnologies();
  }, []);

  const fetchTechnologies = async () => {
    try {
      const response = await axios.get(`${API}/technologies`);
      setTechnologies(response.data);
    } catch (error) {
      console.error('Error fetching technologies:', error);
      // Removed user-facing toast per request; keep console warning for debugging
      console.warn('Failed to load technologies');
    } finally {
      setLoading(false);
    }
  };

  const filteredTechs = useMemo(() => {
    let filtered = technologies;
    
    if (selectedRing !== 'all') {
      filtered = filtered.filter(tech => tech.ring === selectedRing);
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tech => tech.category === selectedCategory);
    }
    
    return filtered;
  }, [technologies, selectedRing, selectedCategory]);

  const handleTechClick = (tech) => {
    setSelectedTech(tech);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Prepare data for radar chart visualization
  const radarData = [
    { category: 'Techniques', Adopt: 0, Trial: 0, Assess: 0, Hold: 0 },
    { category: 'Tools', Adopt: 0, Trial: 0, Assess: 0, Hold: 0 },
    { category: 'Platforms', Adopt: 0, Trial: 0, Assess: 0, Hold: 0 },
    { category: 'Languages', Adopt: 0, Trial: 0, Assess: 0, Hold: 0 }
  ];

  filteredTechs.forEach(tech => {
    const categoryMap = {
      'Techniques': 0,
      'Tools': 1,
      'Platforms': 2,
      'Languages & Frameworks': 3
    };
    
    const index = categoryMap[tech.category];
    if (index !== undefined) {
      radarData[index][tech.ring] += 1;
    }
  });

  return (
    <div className="space-y-6" data-testid="radar-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Technology Radar</h1>
          <p className="text-muted-foreground mt-1">Interactive visualization of technology adoption</p>
        </div>
        
        <div className="flex gap-3">
          <Select value={selectedRing} onValueChange={setSelectedRing}>
            <SelectTrigger className="w-[150px]" data-testid="ring-filter">
              <SelectValue placeholder="Filter by Ring" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rings</SelectItem>
              <SelectItem value="Adopt">Adopt</SelectItem>
              <SelectItem value="Trial">Trial</SelectItem>
              <SelectItem value="Assess">Assess</SelectItem>
              <SelectItem value="Hold">Hold</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]" data-testid="category-filter">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Techniques">Techniques</SelectItem>
              <SelectItem value="Tools">Tools</SelectItem>
              <SelectItem value="Platforms">Platforms</SelectItem>
              <SelectItem value="Languages & Frameworks">Languages</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Radar Chart */}
      <Card data-testid="radar-chart-card">
        <CardHeader>
          <CardTitle>Technology Distribution Radar</CardTitle>
          <CardDescription>Technologies grouped by category and adoption ring</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={500}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#64748B', fontSize: 12 }} />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 'auto']}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={{ stroke: '#E5E7EB' }}
                tick={{ fill: '#64748B', fontSize: 11 }}
              />
              <RechartsRadar name="Adopt" dataKey="Adopt" stroke={RING_COLORS.Adopt} fill={RING_COLORS.Adopt} fillOpacity={0.6} />
              <RechartsRadar name="Trial" dataKey="Trial" stroke={RING_COLORS.Trial} fill={RING_COLORS.Trial} fillOpacity={0.6} />
              <RechartsRadar name="Assess" dataKey="Assess" stroke={RING_COLORS.Assess} fill={RING_COLORS.Assess} fillOpacity={0.6} />
              <RechartsRadar name="Hold" dataKey="Hold" stroke={RING_COLORS.Hold} fill={RING_COLORS.Hold} fillOpacity={0.6} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px' }} />
              <Legend wrapperStyle={{ color: '#64748B' }} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Technology Grid by Ring */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['Adopt', 'Trial', 'Assess', 'Hold'].map(ring => {
          const ringTechs = filteredTechs.filter(t => t.ring === ring);
          return (
            <Card key={ring} data-testid={`ring-${ring.toLowerCase()}-card`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: RING_COLORS[ring] }}
                  />
                  {ring}
                </CardTitle>
                <CardDescription>{ringTechs.length} technologies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {ringTechs.map(tech => (
                    <button
                      key={tech.id}
                      onClick={() => handleTechClick(tech)}
                      className="w-full text-left p-3 rounded-lg border border-border hover:bg-secondary transition-colors"
                      data-testid={`tech-item-${tech.id}`}
                    >
                      <div className="font-medium text-sm">{tech.name}</div>
                      <Badge variant="outline" className="mt-1 text-xs">{tech.category}</Badge>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Technology Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="tech-detail-dialog">
          {selectedTech && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedTech.name}</DialogTitle>
                <DialogDescription className="flex gap-2 mt-2">
                  <Badge style={{ backgroundColor: RING_COLORS[selectedTech.ring], color: RING_TEXT_COLORS[selectedTech.ring] }} className="border-0">
                    {selectedTech.ring}
                  </Badge>
                  <Badge variant="outline">{selectedTech.category}</Badge>
                  <Badge variant="secondary">{selectedTech.maturity}</Badge>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedTech.description}</p>
                </div>

                {selectedTech.supplier && (
                  <div>
                    <h4 className="font-semibold mb-2">Supplier</h4>
                    <p className="text-muted-foreground">{selectedTech.supplier}</p>
                  </div>
                )}

                {selectedTech.use_cases && selectedTech.use_cases.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Use Cases</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedTech.use_cases.map((useCase, idx) => (
                        <li key={idx} className="text-muted-foreground">{useCase}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {selectedTech.pros && selectedTech.pros.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-primary">Pros</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedTech.pros.map((pro, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">{pro}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedTech.cons && selectedTech.cons.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-red-600">Cons</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedTech.cons.map((con, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">{con}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {selectedTech.tags && selectedTech.tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTech.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTech.adoption_year && (
                  <div>
                    <h4 className="font-semibold mb-2">Adoption Year</h4>
                    <p className="text-muted-foreground">{selectedTech.adoption_year}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TechRadar;
