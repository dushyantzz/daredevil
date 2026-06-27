# Graph Report - .  (2026-06-27)

## Corpus Check
- Large corpus: 309 files · ~2,407,283 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 945 nodes · 1240 edges · 166 communities (153 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_GNN Alias Resolution and 3D Visualization Scripts|GNN Alias Resolution and 3D Visualization Scripts]]
- [[_COMMUNITY_Project Package Dependencies|Project Package Dependencies]]
- [[_COMMUNITY_UFDR Ingestion and NLP RAG Engine Services|UFDR Ingestion and NLP RAG Engine Services]]
- [[_COMMUNITY_Video Monitoring Dashboard UI Components|Video Monitoring Dashboard UI Components]]
- [[_COMMUNITY_User Authentication UI Pages and Actions|User Authentication UI Pages and Actions]]
- [[_COMMUNITY_Real-time Video Streaming and Chat UI|Real-time Video Streaming and Chat UI]]
- [[_COMMUNITY_Security Alerts and UI Dialog Utilities|Security Alerts and UI Dialog Utilities]]
- [[_COMMUNITY_TypeScript Configuration Settings|TypeScript Configuration Settings]]
- [[_COMMUNITY_API Key Management and AI Analysis Routes|API Key Management and AI Analysis Routes]]
- [[_COMMUNITY_Project DevDependencies and Build Scripts|Project DevDependencies and Build Scripts]]
- [[_COMMUNITY_GNN Analysis Panel UI Components|GNN Analysis Panel UI Components]]
- [[_COMMUNITY_GNN Data Visualizer Cluster Components|GNN Data Visualizer Cluster Components]]
- [[_COMMUNITY_Next.js Build Types for WhatsApp Route|Next.js Build Types for WhatsApp Route]]
- [[_COMMUNITY_Supabase Tutorial and Checklist UI Components|Supabase Tutorial and Checklist UI Components]]
- [[_COMMUNITY_Next.js Build Types for Root Layout|Next.js Build Types for Root Layout]]
- [[_COMMUNITY_Webpack Polyfill Chunks|Webpack Polyfill Chunks]]
- [[_COMMUNITY_Chat Conversation Management Services|Chat Conversation Management Services]]
- [[_COMMUNITY_Next.js Build Types for Protected Route|Next.js Build Types for Protected Route]]
- [[_COMMUNITY_Root Layout and Environment Warnings UI|Root Layout and Environment Warnings UI]]
- [[_COMMUNITY_Webpack Hot Module Replacement Chunks|Webpack Hot Module Replacement Chunks]]
- [[_COMMUNITY_Tailwind Components Alias Configuration|Tailwind Components Alias Configuration]]
- [[_COMMUNITY_NLP Query Processor and 3D Visualizer UI|NLP Query Processor and 3D Visualizer UI]]
- [[_COMMUNITY_Edge Runtime Webpack Hot Reloading|Edge Runtime Webpack Hot Reloading]]
- [[_COMMUNITY_Next.js Typed Routes Definitions|Next.js Typed Routes Definitions]]
- [[_COMMUNITY_Theme Switcher and Dropdown Menu UI|Theme Switcher and Dropdown Menu UI]]
- [[_COMMUNITY_General Button Components and Statistics UI|General Button Components and Statistics UI]]
- [[_COMMUNITY_Video Data Generation and Gemini Setup|Video Data Generation and Gemini Setup]]
- [[_COMMUNITY_Visualization Dependency and Setup Scripts|Visualization Dependency and Setup Scripts]]
- [[_COMMUNITY_Bounding Box overlay Drawer Test Pages|Bounding Box overlay Drawer Test Pages]]
- [[_COMMUNITY_UFDR Data Visualizer and Analysis Dashboard|UFDR Data Visualizer and Analysis Dashboard]]
- [[_COMMUNITY_UFDR Data Parsing and Visualizer Filters|UFDR Data Parsing and Visualizer Filters]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 65|Community 65]]

## God Nodes (most connected - your core abstractions)
1. `Button` - 28 edges
2. `cn()` - 20 edges
3. `compilerOptions` - 18 edges
4. `Badge()` - 14 edges
5. `Timestamp` - 13 edges
6. `Input` - 12 edges
7. `createClient()` - 11 edges
8. `ConversationManager` - 10 edges
9. `RelationshipDetector` - 10 edges
10. `getPineconeIndex()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `DropdownMenuShortcut()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts
- `GET()` --calls--> `initializePinecone()`  [EXTRACTED]
  app/api/ufdr-ingest/route.ts → lib/pinecone-client.ts
- `GET()` --calls--> `createClient()`  [EXTRACTED]
  app/auth/callback/route.ts → utils/supabase/server.ts
- `Timeline()` --calls--> `cn()`  [EXTRACTED]
  app/components/Timeline.tsx → lib/utils.ts
- `ChatInterfaceProps` --references--> `Timestamp`  [EXTRACTED]
  components/chat-interface.tsx → app/types.ts

## Import Cycles
- 1-file cycle: `.next-runtime/types/app/api/send-whatsapp/route.ts -> .next-runtime/types/app/api/send-whatsapp/route.ts`

## Communities (166 total, 13 thin omitted)

### Community 0 - "GNN Alias Resolution and 3D Visualization Scripts"
Cohesion: 0.06
Nodes (40): Any, datetime, Graph, AliasResolver, GNNProcessor, main(), Detect hidden and indirect relationships using graph analysis, Build interaction graph from UFDR data (+32 more)

### Community 1 - "Project Package Dependencies"
Cohesion: 0.04
Nodes (57): dependencies, autoprefixer, chart.js, @chroma-core/default-embed, chromadb-default-embed, class-variance-authority, classnames, clsx (+49 more)

### Community 2 - "UFDR Ingestion and NLP RAG Engine Services"
Cohesion: 0.07
Nodes (46): analyzeQueryComplexity(), classifyIntent(), IntentClassification, QueryIntent, ruleBasedClassification(), deleteNamespace(), getPineconeClient(), getPineconeIndex() (+38 more)

### Community 3 - "Video Monitoring Dashboard UI Components"
Cohesion: 0.08
Nodes (24): BoundingBoxesOverlay(), BoundingBoxesOverlayProps, CameraFeed(), CameraFeedProps, CameraModal(), CameraModalProps, EventFeed(), EventFeedProps (+16 more)

### Community 4 - "User Authentication UI Pages and Actions"
Cohesion: 0.13
Nodes (20): forgotPasswordAction(), resetPasswordAction(), signInAction(), signOutAction(), signUpAction(), SmtpMessage(), GET(), AuthButtons() (+12 more)

### Community 5 - "Real-time Video Streaming and Chat UI"
Cohesion: 0.10
Nodes (23): Timestamp, ChatInterfaceProps, Message, Timeline(), TimelineProps, TimestampListProps, VideoPlayer, VideoPlayerProps (+15 more)

### Community 6 - "Security Alerts and UI Dialog Utilities"
Cohesion: 0.15
Nodes (11): SecurityAlertModal(), SecurityAlertModalProps, cn(), DialogContent, DialogDescription, DialogFooter(), DialogHeader(), DialogOverlay (+3 more)

### Community 7 - "TypeScript Configuration Settings"
Cohesion: 0.09
Nodes (21): compilerOptions, allowJs, esModuleInterop, forceConsistentCasingInFileNames, incremental, isolatedModules, jsx, lib (+13 more)

### Community 8 - "API Key Management and AI Analysis Routes"
Cohesion: 0.12
Nodes (8): genAI, getGeminiClient(), POST(), getGeminiClient(), POST(), retryWithBackoff(), ApiKeyManager, ApiKeyMetrics

### Community 9 - "Project DevDependencies and Build Scripts"
Cohesion: 0.10
Nodes (19): devDependencies, postcss, tailwind-merge, tailwindcss, tailwindcss-animate, @types/node, @types/plotly.js, @types/react (+11 more)

### Community 10 - "GNN Analysis Panel UI Components"
Cohesion: 0.15
Nodes (15): AliasGroup, CommunityCluster, GNNAnalysisData, GNNAnalysisPanelProps, HiddenRelationship, Card, CardContent, CardDescription (+7 more)

### Community 11 - "GNN Data Visualizer Cluster Components"
Cohesion: 0.11
Nodes (9): AliasCluster, CommunityCluster, GNNDataVisualizerProps, GNNEdge, GNNNode, GNNVisualizationData, HiddenRelationshipIndicator, NODE_COLORS (+1 more)

### Community 12 - "Next.js Build Types for WhatsApp Route"
Cohesion: 0.12
Nodes (16): Diff, FirstArg, LayoutProps, MaybeField, Negative, NonNegative, Numeric, OmitWithTag (+8 more)

### Community 13 - "Supabase Tutorial and Checklist UI Components"
Cohesion: 0.15
Nodes (6): CodeBlock(), client, create, server, TutorialStep(), Checkbox

### Community 14 - "Next.js Build Types for Root Layout"
Cohesion: 0.12
Nodes (14): Diff, FirstArg, LayoutProps, MaybeField, Negative, NonNegative, Numeric, OmitWithTag (+6 more)

### Community 15 - "Webpack Polyfill Chunks"
Cohesion: 0.17
Nodes (7): e(), eb(), ib(), nb(), ob(), rb(), t()

### Community 16 - "Chat Conversation Management Services"
Cohesion: 0.14
Nodes (3): ConversationManager, ConversationState, Message

### Community 17 - "Next.js Build Types for Protected Route"
Cohesion: 0.12
Nodes (14): Diff, FirstArg, LayoutProps, MaybeField, Negative, NonNegative, Numeric, OmitWithTag (+6 more)

### Community 18 - "Root Layout and Environment Warnings UI"
Cohesion: 0.18
Nodes (7): metadata, poppins, DeployButton(), EnvVarWarning(), GeminiFooter(), HeaderNav(), NavigationEvents()

### Community 19 - "Webpack Hot Module Replacement Chunks"
Cohesion: 0.27
Nodes (11): applyInvalidatedModules(), createModuleHotObject(), createRequire(), hotApply(), hotCheck(), internalApply(), setStatus(), trackBlockingPromise() (+3 more)

### Community 20 - "Tailwind Components Alias Configuration"
Cohesion: 0.14
Nodes (13): aliases, components, utils, rsc, $schema, style, tailwind, baseColor (+5 more)

### Community 21 - "NLP Query Processor and 3D Visualizer UI"
Cohesion: 0.18
Nodes (9): NLPQueryProcessorProps, QueryIntent, QueryResult, Plot, UFDR3DVisualizerProps, VisualizationData, Badge(), BadgeProps (+1 more)

### Community 22 - "Edge Runtime Webpack Hot Reloading"
Cohesion: 0.27
Nodes (11): applyInvalidatedModules(), createModuleHotObject(), createRequire(), hotApply(), hotCheck(), internalApply(), setStatus(), trackBlockingPromise() (+3 more)

### Community 23 - "Next.js Typed Routes Definitions"
Cohesion: 0.14
Nodes (13): AppRouteHandlerRoutes, AppRoutes, LayoutProps, LayoutRoutes, LayoutSlotMap, PageProps, PageRoutes, ParamMap (+5 more)

### Community 24 - "Theme Switcher and Dropdown Menu UI"
Cohesion: 0.20
Nodes (9): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+1 more)

### Community 25 - "General Button Components and Statistics UI"
Cohesion: 0.21
Nodes (5): SavedVideo, KeyMoment, Button, ButtonProps, buttonVariants

### Community 26 - "Video Data Generation and Gemini Setup"
Cohesion: 0.23
Nodes (11): load_env(), main(), process_video(), Rotate to the next available API key, Uploads the given file to Gemini., Waits for the given files to be active., Process a single video and return its analysis, Load environment variables from .env.local (+3 more)

### Community 27 - "Visualization Dependency and Setup Scripts"
Cohesion: 0.24
Nodes (11): check_python_version(), install_dependencies(), main(), Run a command and handle errors, Check if Python version is compatible, Install Python dependencies, Test if all required packages can be imported, Test the visualization script with sample data (+3 more)

### Community 28 - "Bounding Box overlay Drawer Test Pages"
Cohesion: 0.22
Nodes (6): BoundingBox, BoundingBoxDrawer(), BoundingBoxDrawerProps, boxes, rawBoxes, boxes

### Community 29 - "UFDR Data Visualizer and Analysis Dashboard"
Cohesion: 0.20
Nodes (8): UFDRDataVisualizer(), UFDRVisualizerProps, AppData, CallData, ChatData, ImageData, UFDRData, VideoData

### Community 30 - "UFDR Data Parsing and Visualizer Filters"
Cohesion: 0.24
Nodes (6): ParsedData, UFDRDataParser(), UFDRDataParserProps, FilterState, UFDRVisualizationFiltersProps, Progress

### Community 32 - "Community 32"
Cohesion: 0.25
Nodes (6): NLPQuickActions(), NLPQuickActionsProps, QuickAction, ChatMessage, QueryResult, UFDRData

### Community 33 - "Community 33"
Cohesion: 0.22
Nodes (8): SpeechRecognition, SpeechRecognitionAlternative, SpeechRecognitionConstructor, SpeechRecognitionErrorEvent, SpeechRecognitionEvent, SpeechRecognitionResult, SpeechRecognitionResultList, Window

### Community 35 - "Community 35"
Cohesion: 0.32
Nodes (7): args, createNewIndexWithCorrectDimensions(), fs, loadEnvFile(), path, { Pinecone }, setupPineconeIndex()

### Community 36 - "Community 36"
Cohesion: 0.25
Nodes (6): GNNAnalysisData, GNNDataVisualizer, InteractiveControls, ParticleBackground, Scene3D, UFDRData

### Community 37 - "Community 37"
Cohesion: 0.25
Nodes (6): DataPoint, DataVisualizer, InteractiveControls, ParticleBackground, Scene3D, UFDRData

### Community 38 - "Community 38"
Cohesion: 0.25
Nodes (6): DataPoint, DataVisualizer, InteractiveControls, ParticleBackground, Scene3D, UFDRData

### Community 39 - "Community 39"
Cohesion: 0.29
Nodes (6): AppPageConfig, __Check, __IsExpected, LayoutConfig, RouteHandlerConfig, __Unused

### Community 40 - "Community 40"
Cohesion: 0.33
Nodes (4): CATEGORY_COLORS, CATEGORY_ICONS, DataPoint, DataVisualizerProps

### Community 45 - "Community 45"
Cohesion: 0.60
Nodes (3): config, middleware(), updateSession()

### Community 46 - "Community 46"
Cohesion: 0.50
Nodes (4): fs, { GoogleGenerativeAI }, loadEnv(), testModels()

### Community 48 - "Community 48"
Cohesion: 0.83
Nodes (3): normalizeWhatsappAddress(), POST(), truncateText()

### Community 50 - "Community 50"
Cohesion: 0.67
Nodes (3): main(), process_video(), Process video to detect people and save bounding boxes data.     Args:

## Knowledge Gaps
- **312 isolated node(s):** `type`, `TEntry`, `SegmentParams`, `RouteContext`, `PageProps` (+307 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Button` connect `General Button Components and Statistics UI` to `Community 32`, `User Authentication UI Pages and Actions`, `Real-time Video Streaming and Chat UI`, `Security Alerts and UI Dialog Utilities`, `GNN Analysis Panel UI Components`, `Supabase Tutorial and Checklist UI Components`, `Root Layout and Environment Warnings UI`, `NLP Query Processor and 3D Visualizer UI`, `Theme Switcher and Dropdown Menu UI`, `UFDR Data Visualizer and Analysis Dashboard`, `UFDR Data Parsing and Visualizer Filters`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `cn()` connect `Security Alerts and UI Dialog Utilities` to `Video Monitoring Dashboard UI Components`, `User Authentication UI Pages and Actions`, `Real-time Video Streaming and Chat UI`, `GNN Analysis Panel UI Components`, `Supabase Tutorial and Checklist UI Components`, `NLP Query Processor and 3D Visualizer UI`, `Theme Switcher and Dropdown Menu UI`, `General Button Components and Statistics UI`, `Community 56`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **What connects `type`, `TEntry`, `SegmentParams` to the rest of the system?**
  _347 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `GNN Alias Resolution and 3D Visualization Scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.0647307924984876 - nodes in this community are weakly interconnected._
- **Should `Project Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.03508771929824561 - nodes in this community are weakly interconnected._
- **Should `UFDR Ingestion and NLP RAG Engine Services` be split into smaller, more focused modules?**
  _Cohesion score 0.06801346801346801 - nodes in this community are weakly interconnected._
- **Should `Video Monitoring Dashboard UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.07928118393234672 - nodes in this community are weakly interconnected._