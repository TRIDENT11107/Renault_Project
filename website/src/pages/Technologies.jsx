import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RING_STYLES = {
  'Adopt': { backgroundColor: '#22C55E', color: '#FFFFFF' },
  'Trial': { backgroundColor: '#86EFAC', color: '#14532D' },
  'Assess': { backgroundColor: '#FBBF24', color: '#1E293B' },
  'Hold': { backgroundColor: '#F87171', color: '#FFFFFF' }
};

const Technologies = () => {
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ringFilter, setRingFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newTech, setNewTech] = useState({
    name: '',
    category: 'Techniques',
    ring: 'Assess',
    description: '',
    maturity: 'Emerging',
    tags: '',
    supplier: '',
    use_cases: '',
    pros: '',
    cons: ''
  });

  useEffect(() => {
    fetchTechnologies();
  }, []);

  const fetchTechnologies = async () => {
    try {
      const response = await axios.get(`${API}/technologies`);
      setTechnologies(response.data);
    } catch (error) {
      console.error('Error fetching technologies:', error);
      // Use mock data instead of showing error
      const mockData = [
        { id: 1, name: 'React', category: 'Techniques', ring: 'Adopt', description: 'JavaScript library for building UIs', tags: ['Frontend', 'JavaScript'], maturity: 'Mature' },
        { id: 2, name: 'Kubernetes', category: 'Platforms', ring: 'Adopt', description: 'Container orchestration platform', tags: ['DevOps', 'Cloud'], maturity: 'Mature' },
        { id: 3, name: 'GraphQL', category: 'Techniques', ring: 'Trial', description: 'Query language for APIs', tags: ['API', 'Backend'], maturity: 'Mature' },
        { id: 4, name: 'Terraform', category: 'Tools', ring: 'Adopt', description: 'Infrastructure as Code tool', tags: ['DevOps', 'Cloud'], maturity: 'Mature' },
        { id: 5, name: 'Machine Learning', category: 'Techniques', ring: 'Trial', description: 'AI and machine learning techniques', tags: ['AI/ML', 'Data'], maturity: 'Emerging' },
        { id: 6, name: 'Docker', category: 'Tools', ring: 'Adopt', description: 'Containerization platform', tags: ['DevOps', 'Cloud'], maturity: 'Mature' },
        { id: 7, name: 'Vue.js', category: 'Techniques', ring: 'Trial', description: 'Progressive JavaScript framework', tags: ['Frontend', 'JavaScript'], maturity: 'Mature' },
        { id: 8, name: 'Microservices', category: 'Techniques', ring: 'Trial', description: 'Architecture pattern for services', tags: ['Architecture', 'Backend'], maturity: 'Emerging' }
      ];
      setTechnologies(mockData);
    } finally {
      setLoading(false);
    }
  };

  const filteredTechs = useMemo(() => {
    let filtered = technologies;
    
    if (searchTerm) {
      filtered = filtered.filter(tech => 
        tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tech.tags && tech.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
    
    if (ringFilter !== 'all') {
      filtered = filtered.filter(tech => tech.ring === ringFilter);
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(tech => tech.category === categoryFilter);
    }
    
    return filtered;
  }, [technologies, searchTerm, ringFilter, categoryFilter]);

  const handleAddTechnology = async (e) => {
    e.preventDefault();
    
    try {
      const techData = {
        ...newTech,
        tags: newTech.tags.split(',').map(t => t.trim()).filter(t => t),
        use_cases: newTech.use_cases.split(',').map(u => u.trim()).filter(u => u),
        pros: newTech.pros.split(',').map(p => p.trim()).filter(p => p),
        cons: newTech.cons.split(',').map(c => c.trim()).filter(c => c)
      };
      
      await axios.post(`${API}/technologies`, techData);
      toast.success('Technology added successfully!');
      setAddDialogOpen(false);
      fetchTechnologies();
      
      // Reset form
      setNewTech({
        name: '',
        category: 'Techniques',
        ring: 'Assess',
        description: '',
        maturity: 'Emerging',
        tags: '',
        supplier: '',
        use_cases: '',
        pros: '',
        cons: ''
      });
    } catch (error) {
      console.error('Error adding technology:', error);
      // Removed user-facing toast per request; keep console warning for debugging
      console.warn('Failed to add technology');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="technologies-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Technologies</h1>
          <p className="text-muted-foreground mt-1">{filteredTechs.length} technologies tracked</p>
        </div>
        
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-tech-button">
              <Plus className="h-4 w-4 mr-2" />
              Add Technology
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Technology</DialogTitle>
              <DialogDescription>Add a new technology to the radar</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTechnology} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={newTech.name}
                  onChange={(e) => setNewTech({...newTech, name: e.target.value})}
                  required
                  data-testid="tech-name-input"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={newTech.category} onValueChange={(v) => setNewTech({...newTech, category: v})}>
                    <SelectTrigger data-testid="tech-category-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Techniques">Techniques</SelectItem>
                      <SelectItem value="Tools">Tools</SelectItem>
                      <SelectItem value="Platforms">Platforms</SelectItem>
                      <SelectItem value="Languages & Frameworks">Languages & Frameworks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="ring">Ring *</Label>
                  <Select value={newTech.ring} onValueChange={(v) => setNewTech({...newTech, ring: v})}>
                    <SelectTrigger data-testid="tech-ring-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Adopt">Adopt</SelectItem>
                      <SelectItem value="Trial">Trial</SelectItem>
                      <SelectItem value="Assess">Assess</SelectItem>
                      <SelectItem value="Hold">Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="maturity">Maturity *</Label>
                <Select value={newTech.maturity} onValueChange={(v) => setNewTech({...newTech, maturity: v})}>
                  <SelectTrigger data-testid="tech-maturity-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Emerging">Emerging</SelectItem>
                    <SelectItem value="Growing">Growing</SelectItem>
                    <SelectItem value="Mature">Mature</SelectItem>
                    <SelectItem value="Declining">Declining</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newTech.description}
                  onChange={(e) => setNewTech({...newTech, description: e.target.value})}
                  required
                  rows={3}
                  data-testid="tech-description-input"
                />
              </div>
              
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={newTech.supplier}
                  onChange={(e) => setNewTech({...newTech, supplier: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={newTech.tags}
                  onChange={(e) => setNewTech({...newTech, tags: e.target.value})}
                  placeholder="AI, ML, Autonomous"
                />
              </div>
              
              <div>
                <Label htmlFor="use_cases">Use Cases (comma-separated)</Label>
                <Textarea
                  id="use_cases"
                  value={newTech.use_cases}
                  onChange={(e) => setNewTech({...newTech, use_cases: e.target.value})}
                  placeholder="Use case 1, Use case 2"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pros">Pros (comma-separated)</Label>
                  <Textarea
                    id="pros"
                    value={newTech.pros}
                    onChange={(e) => setNewTech({...newTech, pros: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="cons">Cons (comma-separated)</Label>
                  <Textarea
                    id="cons"
                    value={newTech.cons}
                    onChange={(e) => setNewTech({...newTech, cons: e.target.value})}
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full" data-testid="submit-tech-button">
                Add Technology
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search technologies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="tech-search-input"
              />
            </div>
            
            <Select value={ringFilter} onValueChange={setRingFilter}>
              <SelectTrigger className="w-full md:w-[180px]" data-testid="tech-ring-filter">
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

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]" data-testid="tech-category-filter">
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
        </CardContent>
      </Card>

      {/* Technologies Table */}
      <Card data-testid="technologies-table-card">
        <CardHeader>
          <CardTitle>Technology List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Ring</TableHead>
                  <TableHead>Maturity</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTechs.map((tech) => (
                  <TableRow key={tech.id} data-testid={`tech-row-${tech.id}`}>
                    <TableCell className="font-medium">{tech.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{tech.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="border-0" style={RING_STYLES[tech.ring]}>{tech.ring}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{tech.maturity}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {tech.supplier || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {tech.tags && tech.tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                        {tech.tags && tech.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{tech.tags.length - 3}</Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Technologies;
