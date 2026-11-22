export type ParticipationIdentity = 
  | 'visitor' 
  | 'student' 
  | 'researcher' 
  | 'community_member' 
  | 'org_representative';

export type CommunityRole = 
  | 'member' 
  | 'author' 
  | 'verified_reviewer' 
  | 'custodian' 
  | 'none';

export type MembershipStatus = 
  | 'pending' 
  | 'verified' 
  | 'rejected' 
  | 'revoked' 
  | 'none';

export interface CommunityAffiliation {
  communityId: string;
  communityName: string;
  status: MembershipStatus;
  role: CommunityRole;
  joinedDate?: string;
}

export interface User {
  id: string;
  name: string;
  identity: ParticipationIdentity;
  roleLabel: string;
  avatar: string;
  email: string;
  organization?: string;
  affiliations: CommunityAffiliation[];
  bio: string;
  isDemo?: boolean;
  isTechnicalAdmin?: boolean; // NOT a universal cultural authority!
  /** Versión del módulo de Salud SABIA que le corresponde (la calcula el servidor desde su membresía verificada). */
  saludComunidad?: 'indigena' | 'afro' | 'campesina';
}

export type ConsultationLevel = 
  | 'public' 
  | 'community' 
  | 'restricted' 
  | 'private';

export type AiOperation = 
  | 'query' 
  | 'transcribe' 
  | 'transform' 
  | 'generate_audio' 
  | 'publish_derivative';

export type AiPermissionState = 
  | 'allowed' 
  | 'denied' 
  | 'requires_approval';

export interface AiOperationPermission {
  operation: AiOperation;
  allowed: boolean;
  requiresApproval: boolean;
  externalProviderAllowed: boolean;
  expiresAt?: string;
  revokedAt?: string;
}

export interface AccessGrant {
  id: string;
  knowledgeId: string;
  userId: string;
  requestId?: string;
  grantedByCustodianId?: string;
  grantedAt: string;
  expiresAt?: string;
  revokedAt?: string;
}

export interface CommunityPolicy {
  acceptsExternalContributions: boolean;
  requiresReviewForPublic: boolean;
  aiDefaultPermission: 'none' | 'educational_query' | 'derived_approval_required';
  allowsExternalDerivatives: boolean;
}

export interface Community {
  id: string;
  name: string;
  culturalCategory?: string;
  region: string;
  description: string;
  culturalContext: string;
  photoUrl: string;
  tags: string[];
  custodians: Array<{ id: string; name: string; title: string }>;
  membersCount: number;
  participationGuidelines: string;
  policies: CommunityPolicy;
  isDemo?: boolean;
  /** Versión del módulo de Salud SABIA que ve su gente. */
  saludModulo?: 'indigena' | 'afro' | 'campesina';
}

export type KnowledgeType = 
  | 'relato' 
  | 'historia' 
  | 'documento' 
  | 'audio' 
  | 'video' 
  | 'fotografia' 
  | 'practica' 
  | 'memoria';

export type ContentStatus = 
  | 'draft' 
  | 'pending_review' 
  | 'changes_requested' 
  | 'approved' 
  | 'rejected' 
  | 'revoked'
  | 'archived';

export interface GranularPermissions {
  consultation: ConsultationLevel;
  downloadAllowed: boolean;
  aiQueryAllowed: 'none' | 'educational_query' | 'derived_approval_required';
  derivativeGenerationAllowed: boolean;
  derivativePublicationApprovalRequired: boolean;
  reusableForEducation: boolean;
  operations?: Record<AiOperation, AiOperationPermission>;
  revokedAt?: string;
  expiresAt?: string;
}

export interface CommunityApproval {
  communityId: string;
  communityName: string;
  custodianId?: string;
  custodianName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested' | 'revoked';
  note?: string;
  decisionDate?: string;
}

export interface SlideItem {
  number: number;
  title: string;
  content: string;
  quote?: string;
  teachingNote: string;
  sourceAnchor: string;
}

export interface ConceptNode {
  id: string;
  label: string;
  category: 'origen' | 'practica' | 'principio' | 'territorio' | 'herramienta';
  description: string;
  connections: string[];
}

export interface PodcastSegment {
  speaker: string;
  role: string;
  time: string;
  text: string;
}

export interface KnowledgeEducationalData {
  simpleExplanation: string;
  summary: string;
  sampleQuestions: Array<{
    q: string;
    ans: string;
    quote: string;
    anchor: string;
  }>;
  outOfDomainQuestion: {
    q: string;
    ans: string;
    explanation: string;
  };
  slides: SlideItem[];
  learningGuide: {
    keyConcepts: Array<{ term: string; definition: string }>;
    reflectionQuestions: string[];
    classroomActivity: string;
  };
  podcastTranscript: PodcastSegment[];
  conceptNodes: ConceptNode[];
  videoStoryboard: Array<{ scene: number; visual: string; narration: string; note: string }>;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  type: KnowledgeType;
  communityIds: string[]; // Supports multiple communities
  communityNames: string[];
  author: string;
  authorRole: string;
  authorUserId: string;
  isCommunityCollectiveKnowledge: boolean;
  date: string;
  permissions: GranularPermissions;
  description: string;
  fullContent: string;
  mediaUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  tags: string[];
  status: ContentStatus;
  approvals: CommunityApproval[]; // Unanimous approval required for all linked communities
  authorizedUserIds: string[];
  accessGrants?: AccessGrant[];
  excerptForPublic?: string;
  audioDuration?: string;
  educationalData: KnowledgeEducationalData;
  isDemo?: boolean;
}

export interface AccessRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  userEmail: string;
  userOrganization?: string;
  knowledgeId: string;
  knowledgeTitle: string;
  communityId: string;
  communityName: string;
  requestDate: string;
  purpose: string;
  requestedPermissions: {
    consultation: boolean;
    aiProcessing: boolean;
    derivatives: boolean;
  };
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  responseDate?: string;
  responseNote?: string;
  custodianId?: string;
  custodianName?: string;
}

export interface AffiliationRequest {
  id: string;
  userId: string;
  userName: string;
  communityId: string;
  communityName: string;
  requestDate: string;
  rationale: string;
  status: 'pending' | 'approved' | 'rejected';
  responseNote?: string;
}

export type AILabMode = 
  | 'chat' 
  | 'transform'
  | 'explanation' 
  | 'presentation' 
  | 'learning_guide' 
  | 'podcast' 
  | 'concept_map' 
  | 'video_storyboard';

export interface CeibaCitation {
  knowledgeId: string;
  assetId: string;
  title: string;
  author: string;
  communityNames: string[];
  consultationLevel: ConsultationLevel;
  chunkRef: string;
  excerpt: string;
}

export interface CeibaQueryRequest {
  knowledgeIds: string[];
  question: string;
}

export interface CeibaQueryResponse {
  answer: string | null;
  supported: boolean;
  citations: CeibaCitation[];
  refusalReason?: 
    | 'NO_EVIDENCE' 
    | 'NO_READ_PERMISSION' 
    | 'AI_NOT_ALLOWED' 
    | 'AI_PERMISSION_REVOKED'
    | 'SOURCE_UNAVAILABLE'
    | 'PROMPT_INJECTION_BLOCKED';
  isBackupDemoResponse?: boolean;
}

export interface TransformRequest {
  knowledgeIds: string[];
  audience: 'Niños' | 'Jóvenes' | 'Adultos' | 'Público general';
  level: 'Inicial' | 'Intermedio' | 'Avanzado';
  objective: string;
  format: 'Explicación' | 'Guía de aprendizaje' | 'Presentación pedagógica';
  language: string;
  context?: string;
}

export interface AILabArtifact {
  id: string;
  knowledgeId: string;
  knowledgeTitle: string;
  communityIds: string[]; // Strictly scoped to owner communities
  communityName: string;
  type: AILabMode;
  title: string;
  summary: string;
  generatedAt: string;
  authorUserId: string;
  authorName: string;
  status: 'draft_pending_review' | 'approved_by_custodian' | 'rejected';
  public?: boolean;
  custodianFeedback?: string;
  transformMeta?: {
    audience: string;
    level: string;
    objective: string;
    format: string;
    language: string;
    context?: string;
  };
  slides?: SlideItem[];
  chatMessages?: Array<{ sender: 'user' | 'ai'; text: string; sourceQuote?: string; sourceAnchor?: string; citations?: CeibaCitation[] }>;
  podcastSegments?: PodcastSegment[];
  conceptNodes?: ConceptNode[];
  videoStoryboard?: Array<{ scene: number; visual: string; narration: string; note: string }>;
}

export interface WellnessItem {
  id: string;
  category: 'orientacion' | 'necesidad' | 'apoyo' | 'canales';
  title: string;
  description: string;
  communityTarget: string;
  channelInfo: string;
  status: 'activo' | 'en_definicion';
}

export type ActiveScreen = 
  | 'welcome' 
  | 'login'
  | 'register' 
  | 'dashboard' 
  | 'communities' 
  | 'community_detail' 
  | 'my_community' 
  | 'library' 
  | 'upload' 
  | 'permissions' 
  | 'requests' 
  | 'ai_lab' 
  | 'custodian' 
  | 'profile' 
  | 'wellness';
