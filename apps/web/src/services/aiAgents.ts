/**
 * AI Agents service for market creation
 */
import apiClient from '@/lib/apiClient';

export interface MarketTopic {
  category: string;
  keywords: string[];
  context: string;
}

export interface AgentProgress {
  step: 'idle' | 'scout' | 'draft' | 'validate' | 'complete' | 'error';
  message: string;
  progress: number; // 0-100
}

export interface DraftGenerationResult {
  success: boolean;
  job_id: string;
  draft: any; // MarketDraftData from backend
  validation: {
    is_valid: boolean;
    quality_score: number;
    safety_score: number;
    clarity_score: number;
    errors: string[];
    warnings: string[];
    suggestions: string[];
    feedback?: string;
  } | null;
  submitted: boolean;
  draft_id?: string;
  errors: string[];
}

/**
 * Generate a market draft using AI agents
 */
export async function generateMarketDraft(
  topic: MarketTopic,
  deadlineDays: number = 30,
  onProgress?: (progress: AgentProgress) => void
): Promise<DraftGenerationResult> {
  try {
    // Update progress: Starting
    onProgress?.({
      step: 'scout',
      message: 'Researching data sources...',
      progress: 10,
    });

    // Call backend endpoint that triggers AI agents
    // Note: This endpoint needs to be added to the backend
    const response = await apiClient.post<DraftGenerationResult>(
      '/api/v1/ai/generate-draft',
      {
        topic,
        deadline_days: deadlineDays,
        auto_submit: false, // Don't auto-submit, let user review first
      }
    );

    const result = response.data;

    // Simulate progress updates (in production, use WebSocket for real-time updates)
    if (result.success) {
      onProgress?.({
        step: 'draft',
        message: 'Generating market specification...',
        progress: 40,
      });

      await sleep(1000);

      onProgress?.({
        step: 'validate',
        message: 'Validating quality and safety...',
        progress: 70,
      });

      await sleep(1000);

      onProgress?.({
        step: 'complete',
        message: 'Draft complete!',
        progress: 100,
      });
    } else {
      onProgress?.({
        step: 'error',
        message: `Generation failed: ${result.errors.join(', ')}`,
        progress: 0,
      });
    }

    return result;
  } catch (error: any) {
    onProgress?.({
      step: 'error',
      message: error.response?.data?.detail || 'Failed to generate draft',
      progress: 0,
    });

    throw error;
  }
}

/**
 * Refine an existing draft with AI
 */
export async function refineDraft(
  draftData: any,
  userFeedback: string
): Promise<DraftGenerationResult> {
  const response = await apiClient.post<DraftGenerationResult>(
    '/api/v1/ai/refine-draft',
    {
      draft_data: draftData,
      feedback: userFeedback,
    }
  );

  return response.data;
}

/**
 * Validate a draft without regenerating
 */
export async function validateDraft(draftData: any): Promise<any> {
  const response = await apiClient.post('/api/v1/ai/validate-draft', {
    draft_data: draftData,
  });

  return response.data;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
