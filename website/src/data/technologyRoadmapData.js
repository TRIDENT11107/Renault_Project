import researchRadarData from './technology_radar_data.json';

const RESEARCH_LEVER_MAP = {
  'Cost Optimization': 'Cost reduction',
  'Fuel Economy': 'Emission reduction',
  Lightweighting: 'Light weighting',
  'Friction Reduction': 'Friction reduction',
  'Thermal Efficiency': 'Emission reduction',
};

const PART_RESEARCH_PROFILES = {
  'gear-set': {
    topics: ['Automated Manual Transmission'],
    keywords: ['gear', 'gearbox', 'transmission', 'ratio', 'mesh', 'manual transmission', 'amt'],
  },
  'bearings-housing': {
    topics: ['Automated Manual Transmission', 'Small Displacement Engine'],
    keywords: ['bearing', 'housing', 'lubrication', 'gearbox', 'transmission', 'shaft'],
  },
  'propeller-shaft': {
    topics: ['Automated Manual Transmission'],
    keywords: ['shaft', 'driveline', 'drive shaft', 'torsion', 'power transfer'],
  },
  differential: {
    topics: ['Automated Manual Transmission'],
    keywords: ['differential', 'final drive', 'axle', 'torque split'],
  },
  'shift-forks': {
    topics: ['Automated Manual Transmission'],
    keywords: ['shift', 'selector', 'fork', 'synchronizer', 'amt', 'manual transmission'],
  },
  'actuation-module': {
    topics: ['Automated Manual Transmission'],
    keywords: ['actuator', 'control', 'shift', 'automated manual transmission', 'amt', 'clutch'],
  },
  'cam-drive': {
    topics: ['Small Displacement Engine', 'Three Cylinder Engine'],
    keywords: ['timing', 'cam', 'belt', 'chain', 'valvetrain', 'drive'],
  },
  'accessory-drive': {
    topics: ['Small Displacement Engine', 'Three Cylinder Engine'],
    keywords: ['accessory', 'belt', 'pulley', 'front end accessory', 'drive'],
  },
  catalyst: {
    topics: ['Exhaust Aftertreatment'],
    keywords: ['catalyst', 'aftertreatment', 'exhaust gas aftertreatment', 'methane slip', 'conversion'],
  },
  egr: {
    topics: ['Exhaust Aftertreatment', 'Small Displacement Engine'],
    keywords: ['egr', 'exhaust gas recirculation', 'nox', 'soot', 'aftertreatment'],
  },
  'head-casting': {
    topics: ['Small Displacement Engine', 'Three Cylinder Engine'],
    keywords: ['cylinder head', 'head', 'combustion chamber', 'port', 'casting', 'three cylinder'],
  },
  sealing: {
    topics: ['Small Displacement Engine', 'Three Cylinder Engine'],
    keywords: ['gasket', 'sealing', 'head gasket', 'combustion pressure', 'block'],
  },
  'piston-ring-pack': {
    topics: ['Small Displacement Engine', 'Three Cylinder Engine'],
    keywords: ['piston', 'ring', 'tribology', 'friction', 'blow by', 'oil consumption'],
  },
  cranktrain: {
    topics: ['Small Displacement Engine', 'Three Cylinder Engine'],
    keywords: ['crankshaft', 'connecting rod', 'journal', 'bearing', 'rotating', 'three cylinder'],
  },
  'clutch-disc': {
    topics: ['Automated Manual Transmission'],
    keywords: ['clutch', 'friction material', 'engagement', 'clutch disc'],
  },
  'flywheel-release': {
    topics: ['Automated Manual Transmission'],
    keywords: ['flywheel', 'release bearing', 'clutch', 'damping'],
  },
  'intake-manifold': {
    topics: ['Small Displacement Engine', 'Three Cylinder Engine'],
    keywords: ['intake', 'manifold', 'air', 'combustion', 'charge motion'],
  },
  'charge-air': {
    topics: ['Small Displacement Engine', 'Battery Thermal Management'],
    keywords: ['charge air', 'intercooler', 'duct', 'air filter', 'thermal'],
  },
  manifold: {
    topics: ['Exhaust Aftertreatment', 'Small Displacement Engine'],
    keywords: ['exhaust manifold', 'thermal', 'exhaust', 'aftertreatment'],
  },
  'acoustic-pack': {
    topics: ['Exhaust Aftertreatment'],
    keywords: ['muffler', 'resonator', 'nvh', 'vibration', 'acoustic', 'heat shield'],
  },
  'oil-pump': {
    topics: ['Small Displacement Engine'],
    keywords: ['oil pump', 'lubrication', 'pump efficiency', 'oil'],
  },
  'filtration-jets': {
    topics: ['Small Displacement Engine', 'Exhaust Aftertreatment'],
    keywords: ['filter', 'oil jet', 'lubrication', 'cooling jet', 'soot'],
  },
  'water-pump': {
    topics: ['Battery Thermal Management', 'Small Displacement Engine'],
    keywords: ['water pump', 'coolant', 'cooling', 'thermal management'],
  },
  'thermal-module': {
    topics: ['Battery Thermal Management', 'Small Displacement Engine', 'Exhaust Aftertreatment'],
    keywords: ['thermal', 'cooling', 'radiator', 'thermostat', 'battery thermal management', 'coolant'],
  },
  injectors: {
    topics: ['Small Displacement Engine'],
    keywords: ['injector', 'injection', 'fuel injection', 'spray'],
  },
  'pump-rail': {
    topics: ['Small Displacement Engine'],
    keywords: ['pump', 'rail', 'fuel pressure', 'high pressure'],
  },
  'compressor-turbine': {
    topics: ['Small Displacement Engine'],
    keywords: ['turbo', 'compressor', 'turbine', 'boost'],
  },
  'turbo-actuation': {
    topics: ['Small Displacement Engine'],
    keywords: ['wastegate', 'vgt', 'turbo actuator', 'boost control', 'bearing housing'],
  },
  'cng-tank': {
    topics: ['Battery Thermal Management', 'Exhaust Aftertreatment'],
    keywords: ['cng', 'tank', 'storage', 'methane', 'gas'],
  },
  'cng-delivery': {
    topics: ['Exhaust Aftertreatment', 'Small Displacement Engine'],
    keywords: ['cng', 'injector', 'pressure regulator', 'methane', 'gas'],
  },
};

const slugify = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const decodeResearchEntities = (value = '') =>
  String(value)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

const cleanResearchText = (value = '') =>
  decodeResearchEntities(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/^abstract\b[:\s-]*/i, '')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeResearchText = (value = '') =>
  cleanResearchText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const buildResearchExcerpt = (value = '') => {
  const cleaned = cleanResearchText(value);
  if (!cleaned) return 'Abstract not provided by publisher. Open the DOI/source for more detail.';
  return cleaned.length > 240 ? `${cleaned.slice(0, 237).trim()}...` : cleaned;
};

export const TREND_LEVERS = [
  'Friction reduction',
  'Emission reduction',
  'Light weighting',
  'Alternate materials',
  'Cost reduction',
];

export const RESEARCH_NOTES = [
  'Track technology signals from research papers, journals, magazines, patents, supplier launches, and conference proceedings.',
  'Summaries should stay anchored to the five trend levers so every finding can be ranked by business impact.',
  'List the most relevant technologies in impact order, from strongest near-term effect to lowest priority.',
  'Even when full-article extraction is not available, retain the most useful summary points, data snippets, and source context.',
  'Map each signal to competitors, OEM programs, or supplier partnerships whenever adoption evidence is visible.',
  'Keep the framework source-agnostic so web articles, white papers, teardown notes, and technical catalogs can all contribute.',
  'Use this engine map as the first layer; the next step can extend the same interaction model to hybrid and EV systems.',
];

const ENGINE_SYSTEMS_BASE = [
  {
    id: 'transmission',
    title: 'Transmission',
    accent: '#0F766E',
    positionClass: 'top-[8%] left-[3%] items-start text-left',
    summary: 'Focus on ratio management, torque delivery efficiency, and durability under higher power density.',
    parts: [
      {
        id: 'gear-set',
        title: 'Gear Set',
        description: 'Core ratio hardware that determines torque multiplication, noise behavior, and mechanical losses.',
        levers: ['Friction reduction', 'Cost reduction'],
        dataPoints: [
          'Surface roughness, superfinishing level, and mesh efficiency by ratio',
          'Torque capacity versus gear size and material grade',
          'Shift shock and NVH performance under peak load',
        ],
        contentHighlights: [
          'Low-loss coatings and optimized tooth micro-geometry are reducing churning and contact losses.',
          'Compact ratio packs help downsized engines stay in their efficiency sweet spot for longer.',
        ],
        competitiveSignals: [
          'Watch for suppliers promoting superfinished gears in BS6 and hybrid-ready drivetrains.',
          'Benchmark ratio spread strategies used by Maruti, Hyundai, Tata, and Toyota.',
        ],
      },
      {
        id: 'bearings-housing',
        title: 'Bearings and Housing',
        description: 'Supports shaft stability, heat rejection, lubrication flow, and package-level weight targets.',
        levers: ['Friction reduction', 'Light weighting', 'Alternate materials'],
        dataPoints: [
          'Bearing drag across temperature range and load cases',
          'Housing mass, stiffness, and machining complexity',
          'Oil aeration, sealing losses, and thermal soak behavior',
        ],
        contentHighlights: [
          'Thin-wall castings and improved rib design are trimming weight without hurting stiffness.',
          'Low-torque bearing selections are being paired with smarter lubrication routing.',
        ],
        competitiveSignals: [
          'Track aluminum housing adoption and any move toward tailored bearing packs for compact SUVs.',
          'Look for supplier references to integrated cooling or structural optimization.',
        ],
      },
    ],
  },
  {
    id: 'power-transfer',
    title: 'Power Transfer',
    accent: '#15803D',
    positionClass: 'top-[18%] left-[3%] items-start text-left',
    summary: 'Study how torque moves from gearbox to wheels with minimum loss, vibration, and packaging penalty.',
    parts: [
      {
        id: 'propeller-shaft',
        title: 'Propeller Shaft',
        description: 'Transfers torque across longer wheelbases while balancing torsional stiffness and mass.',
        levers: ['Light weighting', 'Cost reduction'],
        dataPoints: [
          'Tube material mix, wall thickness, and balance tolerances',
          'Critical speed margin versus wheelbase variants',
          'Warranty trends tied to vibration and spline wear',
        ],
        contentHighlights: [
          'High-strength steel and hybrid shaft constructions are helping reduce rotating mass.',
          'Manufacturers are redesigning joints to reduce vibration in multi-utility platforms.',
        ],
        competitiveSignals: [
          'Monitor lightweight shaft adoption in body-on-frame and AWD vehicles.',
          'Supplier presentations often reveal material shifts before OEM brochures do.',
        ],
      },
      {
        id: 'differential',
        title: 'Differential Assembly',
        description: 'Manages wheel-speed difference and final torque split under varied traction conditions.',
        levers: ['Friction reduction', 'Cost reduction'],
        dataPoints: [
          'Final-drive efficiency, bearing preload, and temperature rise',
          'Gear oil grade and drain interval targets',
          'Backlash control and noise performance after endurance cycles',
        ],
        contentHighlights: [
          'Lower-viscosity fluids and optimized hypoid geometry are being used to reduce parasitic loss.',
          'Simplified carrier designs are targeting cost while holding acceptable NVH.',
        ],
        competitiveSignals: [
          'Track whether top OEMs move to lower-loss axle lubricants in efficiency programs.',
          'Teardown comparisons can highlight differential packaging and gear geometry differences.',
        ],
      },
    ],
  },
  {
    id: 'gear-shifting',
    title: 'Gear Shifting',
    accent: '#16A34A',
    positionClass: 'top-[28%] left-[3%] items-start text-left',
    summary: 'Track improvements in shift feel, response speed, actuator effort, and calibration quality.',
    parts: [
      {
        id: 'shift-forks',
        title: 'Shift Forks',
        description: 'Mechanical interface that guides synchronizer motion and directly affects shift precision.',
        levers: ['Friction reduction', 'Alternate materials'],
        dataPoints: [
          'Fork wear, surface coating life, and selector effort',
          'Material switch from steel to aluminum or polymer inserts',
          'Shift repeatability across hot and cold operating windows',
        ],
        contentHighlights: [
          'Low-friction inserts and revised pad geometry reduce wear and improve tactile feel.',
          'Lightweight fork concepts are helping cut inertia in automated manual systems.',
        ],
        competitiveSignals: [
          'Look for polymer-backed fork pads in supplier brochures and service literature.',
          'AMT-focused competitors often signal actuator and fork upgrades together.',
        ],
      },
      {
        id: 'actuation-module',
        title: 'Actuation Module',
        description: 'Combines mechanical linkage, hydraulic hardware, or electromechanical control for gear selection.',
        levers: ['Cost reduction', 'Emission reduction'],
        dataPoints: [
          'Shift time, actuation current draw, and calibration maps',
          'Hydraulic versus electromechanical bill of material comparison',
          'Field complaints tied to hesitation or missed shifts',
        ],
        contentHighlights: [
          'Electromechanical shifters are reducing package complexity and calibration drift over time.',
          'Better control logic lowers shift hunting and supports engine efficiency strategies.',
        ],
        competitiveSignals: [
          'Benchmark automated shift strategies used in urban drive cycles by major OEMs.',
          'Watch for supplier mentions of integrated actuator-plus-controller units.',
        ],
      },
    ],
  },
  {
    id: 'timing-accessory',
    title: 'Timing and Accessory System',
    accent: '#166534',
    positionClass: 'top-[42%] left-[1%] items-start text-left',
    summary: 'Map valve timing drive, belt systems, and accessory loads that shape efficiency and maintenance needs.',
    parts: [
      {
        id: 'cam-drive',
        title: 'Cam Drive',
        description: 'Timing chain or belt architecture that synchronizes crankshaft and valvetrain motion.',
        levers: ['Friction reduction', 'Cost reduction'],
        dataPoints: [
          'Chain stretch or belt life versus service interval',
          'Noise signature, tensioner behavior, and lubrication demand',
          'Packaging change required for variable valve timing systems',
        ],
        contentHighlights: [
          'Low-noise chain guides and coated sprockets are reducing friction and acoustic penalties.',
          'Long-life belt systems remain attractive where cost and maintenance targets dominate.',
        ],
        competitiveSignals: [
          'Track movement between chain and belt strategies in compact and midsize engines.',
          'Supplier catalogs can reveal silent chain and low-drag tensioner adoption.',
        ],
      },
      {
        id: 'accessory-drive',
        title: 'Accessory Drive Module',
        description: 'Manages power draw for alternator, pump drives, and auxiliary systems around the engine.',
        levers: ['Friction reduction', 'Light weighting'],
        dataPoints: [
          'Parasitic load by accessory and duty cycle',
          'Belt routing efficiency and pulley mass',
          'Failure rate of tensioners, idlers, and overrunning pulleys',
        ],
        contentHighlights: [
          'Decoupled pulleys and optimized routing lower accessory drag during transient driving.',
          'Packaging simplification is enabling more compact front-end accessory layouts.',
        ],
        competitiveSignals: [
          'Look for switchovers to smart alternator control in fuel-economy improvement programs.',
          'Service bulletins often expose accessory-load pain points earlier than brochures.',
        ],
      },
    ],
  },
  {
    id: 'post-treatment',
    title: 'Post Treatment (Catalyst and EGR)',
    accent: '#D97706',
    positionClass: 'top-[56%] left-[1%] items-start text-left',
    summary: 'Prioritize emissions hardware that helps engines meet tighter regulation without excessive cost or backpressure.',
    parts: [
      {
        id: 'catalyst',
        title: 'Catalyst Module',
        description: 'Controls conversion efficiency, precious metal loading, light-off response, and packaging heat balance.',
        levers: ['Emission reduction', 'Cost reduction'],
        dataPoints: [
          'Conversion efficiency during cold start and transient load',
          'PGM loading, substrate cell density, and pressure drop',
          'Durability after thermal aging and sulfur exposure',
        ],
        contentHighlights: [
          'Closer-coupled catalyst layouts improve light-off but demand better thermal shielding.',
          'Manufacturers are optimizing substrate and washcoat design to contain precious metal cost.',
        ],
        competitiveSignals: [
          'Track catalyst volume changes in refreshed BS6 Phase 2 powertrains.',
          'Supplier announcements often hint at low-PGM formulations and substrate upgrades.',
        ],
      },
      {
        id: 'egr',
        title: 'EGR Circuit',
        description: 'Reduces combustion temperature and NOx formation while influencing soot, driveability, and cooling load.',
        levers: ['Emission reduction', 'Cost reduction'],
        dataPoints: [
          'EGR rate map, cooler efficiency, and valve fouling tendency',
          'Combustion stability during part-load and high-EGR operation',
          'Warranty claims related to deposits and valve response lag',
        ],
        contentHighlights: [
          'Improved flow control and anti-fouling designs are extending EGR durability.',
          'Integrated calibration between EGR, boost, and injection is becoming more important.',
        ],
        competitiveSignals: [
          'Benchmark EGR hardware sizing in diesel and CNG-heavy commercial applications.',
          'Technical papers often reveal how OEMs balance NOx, soot, and fuel economy.',
        ],
      },
    ],
  },
  {
    id: 'cylinder-block-head',
    title: 'Cylinder Block and Cylinder Head',
    accent: '#334155',
    positionClass: 'top-[71%] left-[2%] items-start text-left',
    summary: 'Study thermal management, structural rigidity, combustion geometry, and manufacturing complexity.',
    parts: [
      {
        id: 'head-casting',
        title: 'Head Casting',
        description: 'Defines port geometry, cooling flow, valvetrain support, and combustion thermal behavior.',
        levers: ['Light weighting', 'Alternate materials'],
        dataPoints: [
          'Casting mass, cooling-jacket performance, and porosity rates',
          'Valve seat durability and thermal crack resistance',
          'Port flow coefficient and charge-motion behavior',
        ],
        contentHighlights: [
          'Improved casting simulation is helping OEMs pull weight out of non-critical sections.',
          'Port and coolant redesigns are targeting faster warm-up and better knock resistance.',
        ],
        competitiveSignals: [
          'Track whether refreshed engines use revised coolant routing or integrated manifolds.',
          'Supplier process notes can reveal movement toward thinner-wall aluminum castings.',
        ],
      },
      {
        id: 'sealing',
        title: 'Sealing and Gasket Stack',
        description: 'Protects combustion pressure, oil galleries, and coolant passages under higher peak pressures.',
        levers: ['Emission reduction', 'Cost reduction'],
        dataPoints: [
          'Combustion leakage, clamp load retention, and thermal cycle life',
          'Material stack-up for multi-layer steel gaskets and coatings',
          'Warranty incidents tied to coolant-oil mixing or compression loss',
        ],
        contentHighlights: [
          'Higher cylinder pressure is pushing gasket design toward stronger bead profiles and coatings.',
          'Improved sealing resilience supports leaner combustion and boosted downsized engines.',
        ],
        competitiveSignals: [
          'Look for sealing upgrades when OEMs raise compression or add boost to familiar blocks.',
          'Field-service data can reveal which competitors are struggling with pressure escalation.',
        ],
      },
    ],
  },
  {
    id: 'base-engine',
    title: 'Base Engine Parts',
    accent: '#B45309',
    positionClass: 'top-[84%] left-[12%] items-start text-left',
    summary: 'Track the high-stress rotating and reciprocating hardware that dominates friction and durability.',
    parts: [
      {
        id: 'piston-ring-pack',
        title: 'Pistons and Ring Pack',
        description: 'Major contributor to friction, blow-by control, oil consumption, and combustion stability.',
        levers: ['Friction reduction', 'Emission reduction', 'Alternate materials'],
        dataPoints: [
          'Ring tension, skirt coating wear, and oil consumption rate',
          'Mass reduction versus peak firing pressure capability',
          'Blow-by, particulate, and cold-start friction trends',
        ],
        contentHighlights: [
          'Low-tension rings and advanced skirt coatings are reducing friction without sacrificing sealing.',
          'Material and crown changes are supporting higher compression and lean-burn strategies.',
        ],
        competitiveSignals: [
          'Track graphite, DLC, and anodized piston solutions mentioned by global suppliers.',
          'Teardowns often expose ring-width and coating strategy differences very clearly.',
        ],
      },
      {
        id: 'cranktrain',
        title: 'Crankshaft and Connecting Rods',
        description: 'Controls rotating mass, stiffness, bearing load, and the engine durability envelope.',
        levers: ['Light weighting', 'Friction reduction', 'Cost reduction'],
        dataPoints: [
          'Forged versus cast material mix and journal surface finish',
          'Bearing load map, imbalance, and torsional vibration response',
          'Mass reduction achieved without durability penalty',
        ],
        contentHighlights: [
          'Selective machining and optimized counterweight geometry are trimming rotating inertia.',
          'Journal finish improvements and bearing pairing reduce drag in steady-state operation.',
        ],
        competitiveSignals: [
          'Monitor moves toward fracture-split rods and optimized forged crank strategies.',
          'Supplier papers often show how low-friction bearing choices pair with crank redesign.',
        ],
      },
    ],
  },
  {
    id: 'moving-parts-clutch',
    title: 'Moving Parts and Clutch',
    accent: '#059669',
    positionClass: 'top-[8%] right-[4%] items-end text-right',
    summary: 'Balance engagement feel, heat capacity, durability, and launch smoothness as torque levels rise.',
    parts: [
      {
        id: 'clutch-disc',
        title: 'Clutch Disc',
        description: 'Transfers engine torque while controlling heat, wear, and engagement quality.',
        levers: ['Friction reduction', 'Cost reduction', 'Alternate materials'],
        dataPoints: [
          'Clamp load, slip energy, and fade resistance over life',
          'Lining material mix and wear rate by duty cycle',
          'Pedal feel and engagement consistency in traffic-heavy use',
        ],
        contentHighlights: [
          'Revised friction materials are improving heat handling and driveability under higher torque.',
          'OEMs are pushing for longer life without making pedal effort or cost uncompetitive.',
        ],
        competitiveSignals: [
          'Benchmark friction material upgrades in manuals and AMT launch clutches.',
          'Watch supplier notes on copper-free or higher-temperature lining formulations.',
        ],
      },
      {
        id: 'flywheel-release',
        title: 'Flywheel and Release Mechanism',
        description: 'Shapes inertia management, torsional damping, and clutch actuation smoothness.',
        levers: ['Light weighting', 'Cost reduction'],
        dataPoints: [
          'Dual-mass versus single-mass trade-off on NVH and cost',
          'Release bearing durability and actuation effort',
          'Launch shudder and idle rattle trends after calibration changes',
        ],
        contentHighlights: [
          'Refined damping packages are helping smaller engines manage low-end vibration better.',
          'Mass-optimized flywheels are reducing inertia while maintaining acceptable refinement.',
        ],
        competitiveSignals: [
          'Track when OEMs downgrade or upgrade damping hardware across trims.',
          'Warranty data can reveal if refinement savings are creating durability issues.',
        ],
      },
    ],
  },
  {
    id: 'air-intake',
    title: 'Air Intake System',
    accent: '#2563EB',
    positionClass: 'top-[18%] right-[3%] items-end text-right',
    summary: 'Follow airflow efficiency, charge-motion tuning, filtration losses, and boost compatibility.',
    parts: [
      {
        id: 'intake-manifold',
        title: 'Throttle Body and Intake Manifold',
        description: 'Shapes airflow distribution, tumble, swirl, and pressure drop before combustion.',
        levers: ['Friction reduction', 'Emission reduction', 'Alternate materials'],
        dataPoints: [
          'Pressure drop across the intake path and cylinder-to-cylinder air balance',
          'Charge-motion behavior tied to combustion efficiency',
          'Polymer versus metal manifold mass and thermal soak',
        ],
        contentHighlights: [
          'Flow-tuned manifold runners help improve combustion stability and part-load efficiency.',
          'Polymer manifolds continue to win on weight and thermal isolation in cost-sensitive platforms.',
        ],
        competitiveSignals: [
          'Watch for variable-length or tumble-enhancing manifolds in higher-efficiency engines.',
          'Supplier launches often reveal new polymer and integrated-resonator concepts.',
        ],
      },
      {
        id: 'charge-air',
        title: 'Air Filter, Ducting, and Charge Air Cooler',
        description: 'Controls clean-air delivery, intake temperature, and turbocharged response consistency.',
        levers: ['Emission reduction', 'Light weighting'],
        dataPoints: [
          'Filter restriction growth and service interval targets',
          'Charge air cooler effectiveness and pressure drop',
          'Intake noise and response lag after duct geometry changes',
        ],
        contentHighlights: [
          'Lower restriction ducting and better cooler packaging improve combustion efficiency and transient response.',
          'Integrated duct modules are cutting joints, leaks, and assembly complexity.',
        ],
        competitiveSignals: [
          'Track whether competitors move to compact front-end charge air modules.',
          'Service manuals can reveal the true complexity of filter and duct packaging.',
        ],
      },
    ],
  },
  {
    id: 'exhaust-system',
    title: 'Exhaust System',
    accent: '#DC2626',
    positionClass: 'top-[29%] right-[3%] items-end text-right',
    summary: 'Evaluate heat handling, flow restriction, acoustic tuning, and emissions-system integration.',
    parts: [
      {
        id: 'manifold',
        title: 'Exhaust Manifold',
        description: 'Collects exhaust pulses and strongly affects turbo response, thermal load, and catalyst light-off.',
        levers: ['Emission reduction', 'Alternate materials'],
        dataPoints: [
          'Backpressure, surface temperature, and warm-up time',
          'Crack durability under repeated thermal cycles',
          'Integrated manifold versus separate manifold packaging effects',
        ],
        contentHighlights: [
          'Integrated manifold concepts are improving warm-up and reducing part count.',
          'Material upgrades target higher thermal fatigue resistance in boosted engines.',
        ],
        competitiveSignals: [
          'Track integration of manifold and head casting in next-generation small engines.',
          'Patent filings can reveal thermal shield and manifold packaging strategies early.',
        ],
      },
      {
        id: 'acoustic-pack',
        title: 'Muffler, Resonator, and Heat Shielding',
        description: 'Balances acoustic refinement, exhaust mass, and thermal protection near sensitive components.',
        levers: ['Cost reduction', 'Light weighting'],
        dataPoints: [
          'System mass, insertion loss, and cabin booming frequencies',
          'Heat shield material stack and durability near floor pan or fuel system',
          'Manufacturing complexity versus acoustic target achievement',
        ],
        contentHighlights: [
          'Stamping simplification and tuned resonators are reducing cost without a large NVH penalty.',
          'Thinner heat shields and revised packaging are trimming weight in underbody systems.',
        ],
        competitiveSignals: [
          'Benchmark acoustic-pack complexity in premium versus value-oriented trims.',
          'Supplier sourcing notes can reveal heat-shield material shifts quickly.',
        ],
      },
    ],
  },
  {
    id: 'lubrication',
    title: 'Lubrication System',
    accent: '#65A30D',
    positionClass: 'top-[43%] right-[3%] items-end text-right',
    summary: 'Track oil delivery, thermal stability, filtration quality, and the friction cost of pumping losses.',
    parts: [
      {
        id: 'oil-pump',
        title: 'Oil Pump',
        description: 'Direct driver of lubrication quality, parasitic loss, and engine durability margin.',
        levers: ['Friction reduction', 'Cost reduction'],
        dataPoints: [
          'Pump efficiency, control strategy, and pressure stability across rev range',
          'Variable displacement gains versus hardware complexity',
          'Cold-start lubrication timing and drain-back behavior',
        ],
        contentHighlights: [
          'Variable-displacement pumps are reducing pumping loss in modern efficiency programs.',
          'Improved pressure control is helping balance durability and lower-viscosity oils.',
        ],
        competitiveSignals: [
          'Track whether key OEMs move from fixed to variable pumps in mainstream engines.',
          'Technical papers often quantify pump-related fuel economy gains directly.',
        ],
      },
      {
        id: 'filtration-jets',
        title: 'Filter Module and Oil Jets',
        description: 'Supports cleanliness, piston cooling, and stable oil supply to high-stress components.',
        levers: ['Emission reduction', 'Cost reduction'],
        dataPoints: [
          'Filter efficiency, bypass events, and service interval durability',
          'Jet flow rate for piston crown cooling under high load',
          'Contamination-related wear and sludge formation trends',
        ],
        contentHighlights: [
          'Compact filter modules and smarter gallery design are reducing packaging complexity.',
          'Targeted oil-jet strategies are supporting boosted and higher-compression engines.',
        ],
        competitiveSignals: [
          'Monitor oil filtration module integration in refreshed compact engines.',
          'Supplier literature can reveal upgrades to oil-jet targeting and anti-drainback designs.',
        ],
      },
    ],
  },
  {
    id: 'cooling',
    title: 'Cooling System',
    accent: '#0284C7',
    positionClass: 'top-[56%] right-[3%] items-end text-right',
    summary: 'Prioritize warm-up speed, peak thermal control, pump load, and packaging efficiency.',
    parts: [
      {
        id: 'water-pump',
        title: 'Water Pump',
        description: 'Controls coolant circulation, warm-up behavior, and parasitic load at the front of the engine.',
        levers: ['Friction reduction', 'Cost reduction'],
        dataPoints: [
          'Pump efficiency, cavitation margin, and flow stability',
          'Mechanical versus electric pump energy draw',
          'Seal life and bearing durability in stop-start duty cycles',
        ],
        contentHighlights: [
          'Electrified and demand-based pumping strategies reduce unnecessary coolant circulation.',
          'Packaging simplification is pushing more compact pump modules in newer engines.',
        ],
        competitiveSignals: [
          'Track electric water pump usage in mild-hybrid and premium efficiency variants.',
          'Supplier launch material often highlights pump efficiency and cavitation improvements.',
        ],
      },
      {
        id: 'thermal-module',
        title: 'Thermostat, Radiator, and Fan Module',
        description: 'Shapes warm-up control, cabin comfort support, and high-load heat rejection capacity.',
        levers: ['Emission reduction', 'Light weighting'],
        dataPoints: [
          'Warm-up time, coolant target map, and fan duty cycle',
          'Radiator core mass and frontal-package efficiency',
          'Thermal event handling during towing, grade climb, or idle soak',
        ],
        contentHighlights: [
          'Integrated thermal modules help engines reach efficient temperature faster.',
          'High-efficiency radiator and fan packaging is supporting tighter under-hood spaces.',
        ],
        competitiveSignals: [
          'Benchmark thermal module complexity in turbocharged versus naturally aspirated vehicles.',
          'Look for active grille and fan-control integration in updated platforms.',
        ],
      },
    ],
  },
  {
    id: 'fuel-circuit',
    title: 'Fuel Circuit',
    accent: '#BE123C',
    positionClass: 'top-[68%] right-[3%] items-end text-right',
    summary: 'Follow injection precision, pressure stability, atomization quality, and hardware cost.',
    parts: [
      {
        id: 'injectors',
        title: 'Injectors',
        description: 'Core fuel metering hardware that shapes spray quality, emissions, and combustion efficiency.',
        levers: ['Emission reduction', 'Cost reduction'],
        dataPoints: [
          'Spray pattern, droplet size, and injection timing accuracy',
          'Deposit tendency, durability, and failure rate by fuel quality',
          'Particulate and combustion noise impact after calibration changes',
        ],
        contentHighlights: [
          'Improved nozzle geometry and tighter control help reduce emissions and improve fuel economy.',
          'Injector durability remains a strong differentiator in mixed real-world fuel conditions.',
        ],
        competitiveSignals: [
          'Monitor nozzle count and pressure strategy in refreshed GDI and CNG engines.',
          'Teardowns and supplier notes reveal injector sophistication better than brochures.',
        ],
      },
      {
        id: 'pump-rail',
        title: 'High-Pressure Pump, Rail, and Lines',
        description: 'Stabilizes fuel delivery under transient demand while limiting pulsation and noise.',
        levers: ['Cost reduction', 'Emission reduction'],
        dataPoints: [
          'Pressure ripple, response time, and leakage rates',
          'Material and manufacturing cost of lines and connectors',
          'Hot-fuel handling and vapor management during restart',
        ],
        contentHighlights: [
          'Compact rail packaging and better dampening reduce pulsation and improve control.',
          'Pump efficiency gains support both emissions and combustion consistency targets.',
        ],
        competitiveSignals: [
          'Track when OEMs adopt higher-pressure systems versus focusing on calibration only.',
          'Supplier documents can expose packaging shifts in pump and rail integration.',
        ],
      },
    ],
  },
  {
    id: 'turbocharger',
    title: 'Turbo Charger',
    accent: '#7C3AED',
    positionClass: 'top-[80%] right-[3%] items-end text-right',
    summary: 'Study boost response, thermal durability, bearing losses, and actuator sophistication.',
    parts: [
      {
        id: 'compressor-turbine',
        title: 'Compressor and Turbine Wheel',
        description: 'Primary energy-conversion elements that define boost efficiency and transient response.',
        levers: ['Friction reduction', 'Light weighting', 'Alternate materials'],
        dataPoints: [
          'Compressor efficiency island, surge margin, and inertia',
          'Wheel material, mass, and maximum temperature capability',
          'Transient spool response versus drivability targets',
        ],
        contentHighlights: [
          'Lighter wheel designs and aerodynamic refinement are improving response without overspeed risk.',
          'Material upgrades support hotter exhaust conditions from downsized engines.',
        ],
        competitiveSignals: [
          'Track movement toward higher-efficiency wheel designs in sub-1.5L engines.',
          'Supplier white papers often reveal where inertia and airflow gains are coming from.',
        ],
      },
      {
        id: 'turbo-actuation',
        title: 'Bearing Housing and Boost Actuation',
        description: 'Influences friction, oil management, thermal soak resistance, and boost-control accuracy.',
        levers: ['Friction reduction', 'Emission reduction'],
        dataPoints: [
          'Bearing drag, oil coking tendency, and housing temperature retention',
          'Wastegate or VGT response speed and repeatability',
          'Boost overshoot, lag, and durability in hot shutdown cycles',
        ],
        contentHighlights: [
          'Improved bearing systems reduce drag and support faster transient boost recovery.',
          'Electronic actuation enables tighter boost control and cleaner combustion events.',
        ],
        competitiveSignals: [
          'Benchmark pneumatic versus electronic actuation in performance and efficiency trims.',
          'Service issues around oil coking often surface in owner forums before formal recalls.',
        ],
      },
    ],
  },
  {
    id: 'cng-system',
    title: 'CNG System',
    accent: '#CA8A04',
    positionClass: 'top-[85%] right-[14%] items-end text-right',
    summary: 'Track storage, pressure control, injection reliability, and safety-focused packaging for gas-fuel programs.',
    parts: [
      {
        id: 'cng-tank',
        title: 'High-Pressure Tank',
        description: 'Critical safety and package component that strongly influences weight, range, and underbody layout.',
        levers: ['Light weighting', 'Alternate materials', 'Cost reduction'],
        dataPoints: [
          'Tank mass versus usable gas capacity and range',
          'Material choice, safety certification, and mounting complexity',
          'Refill cycle durability and real-world temperature sensitivity',
        ],
        contentHighlights: [
          'Composite and optimized steel-tank designs are balancing weight, cost, and safety.',
          'Packaging innovations are improving boot space retention in passenger vehicles.',
        ],
        competitiveSignals: [
          'Track whether OEMs prioritize underfloor integration or cargo-area tank packaging.',
          'Certification and supplier data can reveal which tank technologies are scaling fastest.',
        ],
      },
      {
        id: 'cng-delivery',
        title: 'Pressure Regulator and Injector Rail',
        description: 'Controls gas pressure, metering precision, and combustion stability under varying demand.',
        levers: ['Emission reduction', 'Cost reduction'],
        dataPoints: [
          'Pressure stability, injector response, and cold-start performance',
          'Backfire resistance and valve contamination rates',
          'Calibration behavior during fuel switching and transient load',
        ],
        contentHighlights: [
          'More stable regulation improves emissions consistency and reduces hesitation on fuel transitions.',
          'Injector durability and contamination control remain major differentiators in Indian conditions.',
        ],
        competitiveSignals: [
          'Benchmark dedicated CNG injector strategies versus bi-fuel retrofitted layouts.',
          'Supplier service networks often expose long-term durability confidence best.',
        ],
      },
    ],
  },
];

const FLATTENED_RESEARCH_ENTRIES = Object.entries(researchRadarData).flatMap(
  ([researchTopic, leverGroups]) =>
    Object.entries(leverGroups || {}).flatMap(([researchLever, papers]) =>
      (papers || []).map((paper, index) => {
        const cleanedAbstract = cleanResearchText(paper.abstract);

        return {
          id: `${slugify(researchTopic)}-${slugify(researchLever)}-${index + 1}`,
          title: paper.title || 'Untitled research entry',
          url: paper.url || '',
          year: Number.isFinite(Number(paper.year)) ? Number(paper.year) : null,
          impactScore: Number.isFinite(Number(paper.impact_score)) ? Number(paper.impact_score) : 0,
          abstract: cleanedAbstract || 'Abstract not provided by publisher. Open the DOI/source for more detail.',
          excerpt: buildResearchExcerpt(cleanedAbstract),
          researchTopic,
          researchLever,
          normalizedLever: RESEARCH_LEVER_MAP[researchLever] || researchLever,
          searchText: normalizeResearchText(
            `${researchTopic} ${researchLever} ${paper.title || ''} ${cleanedAbstract}`,
          ),
        };
      }),
    ),
);

const getResearchScoreForPart = (part, entry) => {
  const profile = PART_RESEARCH_PROFILES[part.id];
  if (!profile) return 0;

  let score = 0;

  if (profile.topics.includes(entry.researchTopic)) {
    score += 18;
  }

  if (
    Array.isArray(part.levers) &&
    part.levers.some(
      (lever) => lever.toLowerCase() === String(entry.normalizedLever || '').toLowerCase(),
    )
  ) {
    score += 7;
  }

  profile.keywords.forEach((keyword) => {
    if (entry.searchText.includes(normalizeResearchText(keyword))) {
      score += keyword.includes(' ') ? 5 : 3;
    }
  });

  if (entry.searchText.includes(normalizeResearchText(part.title))) {
    score += 8;
  }

  score += Math.min(entry.impactScore || 0, 15) / 3;

  if (entry.year && entry.year >= 2024) {
    score += 1;
  }

  return score;
};

const buildResearchForPart = (part) => {
  const scoredEntries = new Map();

  FLATTENED_RESEARCH_ENTRIES.forEach((entry) => {
    const score = getResearchScoreForPart(part, entry);
    if (score <= 0) return;

    const dedupeKey = entry.url || entry.title;
    const candidate = { ...entry, score };
    const current = scoredEntries.get(dedupeKey);

    if (!current || candidate.score > current.score) {
      scoredEntries.set(dedupeKey, candidate);
    }
  });

  const orderedEntries = Array.from(scoredEntries.values()).sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    if (right.impactScore !== left.impactScore) return right.impactScore - left.impactScore;
    return (right.year || 0) - (left.year || 0);
  });

  return {
    researchEntries: orderedEntries.slice(0, 4),
    researchMatchCount: orderedEntries.length,
  };
};

export const ENGINE_SYSTEMS = ENGINE_SYSTEMS_BASE.map((system) => {
  const enrichedParts = system.parts.map((part) => ({
    ...part,
    ...buildResearchForPart(part),
  }));

  return {
    ...system,
    parts: enrichedParts,
    researchMatchCount: enrichedParts.reduce(
      (sum, part) => sum + Number(part.researchMatchCount || 0),
      0,
    ),
  };
});

export const TOTAL_RESEARCH_ENTRIES = FLATTENED_RESEARCH_ENTRIES.length;

export const TOTAL_TRACKED_PARTS = ENGINE_SYSTEMS.reduce(
  (sum, system) => sum + system.parts.length,
  0,
);
