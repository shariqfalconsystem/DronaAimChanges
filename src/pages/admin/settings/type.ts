export type ScoringAlgo = {
    scoringAlgoId: string;
    name: string;
    weightage: number;
    description: string;
  };
  
  export type ScoringConfig = {
    effectiveDate: number;
    lookupScoringAlgoMaster: ScoringAlgo[];
    weightage: { scoringAlgoId: string; weightage: number }[]; 
  };