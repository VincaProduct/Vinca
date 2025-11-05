import type { FFRFoundationsChecklist, FFRUserAction, FFRScore } from '@/types/ffr';

// FFR Scoring Engine (Client-side calculations)
export class FFRScoringEngine {
  // Foundation Score (0-40): Based on checklist completions
  static calculateFoundationScore(checklist: FFRFoundationsChecklist): number {
    const items = [
      checklist.kyc_refresh,
      checklist.nomination_updated,
      checklist.emergency_fund_baseline,
      checklist.sip_mandate_active,
      checklist.document_vault_setup,
      checklist.insurance_evidence
    ];
    
    const completedItems = items.filter(Boolean).length;
    return Math.round((completedItems / items.length) * 40);
  }

  // Habit Score (0-25): Based on SIP reliability and saving patterns
  static calculateHabitScore(sipReliability: number, savingConsistency: number): number {
    // sipReliability: 0-100 (percentage of on-time SIPs)
    // savingConsistency: 0-100 (consistency of saving vs income)
    const reliabilityScore = (sipReliability / 100) * 15;
    const consistencyScore = (savingConsistency / 100) * 10;
    return Math.round(reliabilityScore + consistencyScore);
  }

  // Literacy Score (0-20): Based on educational content completion
  static calculateLiteracyScore(actions: FFRUserAction[]): number {
    const educationActions = actions.filter(action => 
      action.action_type === 'education_opened' || action.action_type === 'document_viewed'
    );
    
    const totalPoints = educationActions.reduce((sum, action) => sum + action.points_earned, 0);
    return Math.min(Math.round(totalPoints), 20);
  }

  // Opportunity Score (0-10): Based on engagement with opportunities
  static calculateOpportunityScore(actions: FFRUserAction[]): number {
    const opportunityActions = actions.filter(action => 
      action.action_type === 'handoff_clicked'
    );
    
    const totalPoints = opportunityActions.reduce((sum, action) => sum + action.points_earned, 0);
    return Math.min(Math.round(totalPoints), 10);
  }

  // Decumulation Score (0-5): Based on retirement planning education
  static calculateDecumulationScore(actions: FFRUserAction[]): number {
    const decumulationActions = actions.filter(action => 
      action.metadata?.category === 'decumulation'
    );
    
    const totalPoints = decumulationActions.reduce((sum, action) => sum + action.points_earned, 0);
    return Math.min(Math.round(totalPoints), 5);
  }

  // Calculate total FFR scores across three scenarios
  static calculateTotalScores(
    foundationScore: number,
    habitScore: number,
    literacyScore: number,
    opportunityScore: number,
    decumulationScore: number
  ): FFRScore {
    const baseTotal = foundationScore + habitScore + literacyScore + opportunityScore + decumulationScore;
    
    return {
      conservative: Math.max(baseTotal - 15, 0), // Conservative scenario
      base: baseTotal, // Base scenario
      optimistic: Math.min(baseTotal + 15, 100) // Optimistic scenario
    };
  }

  // Get FFR band description
  static getFFRBand(score: number): { band: string; color: string; description: string } {
    if (score >= 80) {
      return {
        band: 'Excellent',
        color: 'text-green-600',
        description: 'You are well-prepared for financial freedom'
      };
    } else if (score >= 60) {
      return {
        band: 'Good',
        color: 'text-blue-600',
        description: 'You are on track with some areas to improve'
      };
    } else if (score >= 40) {
      return {
        band: 'Developing',
        color: 'text-yellow-600',
        description: 'You have a foundation but need focused improvement'
      };
    } else {
      return {
        band: 'Getting Started',
        color: 'text-orange-600',
        description: 'Great time to begin building your financial freedom foundation'
      };
    }
  }

  // Calculate next steps based on scores
  static calculateNextSteps(
    foundationScore: number,
    habitScore: number,
    literacyScore: number,
    opportunityScore: number,
    decumulationScore: number
  ): Array<{ title: string; description: string; priority: number; type: string }> {
    const steps = [];

    if (foundationScore < 30) {
      steps.push({
        title: 'Complete Your Financial Foundations',
        description: 'Set up emergency fund, KYC, and SIP mandate to build a strong base',
        priority: 1,
        type: 'checklist'
      });
    }

    if (habitScore < 15) {
      steps.push({
        title: 'Improve Your Saving Habits',
        description: 'Learn about systematic saving and maintain regular SIP contributions',
        priority: 2,
        type: 'education'
      });
    }

    if (literacyScore < 10) {
      steps.push({
        title: 'Expand Your Financial Knowledge',
        description: 'Complete educational modules to understand investment options better',
        priority: 3,
        type: 'education'
      });
    }

    return steps.slice(0, 3); // Return top 3 steps
  }
}