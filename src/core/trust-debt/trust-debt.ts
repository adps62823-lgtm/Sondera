import { Claim, EvidenceItem, ClaimEvidenceRelation, TrustDebtAssessment } from '../../types/domain';

export function calculateTrustDebt(
  claims: Claim[],
  evidenceItems: EvidenceItem[],
  relations: ClaimEvidenceRelation[]
): TrustDebtAssessment {
  const totalClaims = claims.length;
  let supportedClaims = 0;
  let unsupportedClaims = 0;
  const reasons: string[] = [];
  const recommendedSteps: string[] = [];

  // Group relations by claim
  const claimRelationMap = new Map<string, ClaimEvidenceRelation[]>();
  for (const rel of relations) {
    const list = claimRelationMap.get(rel.claimId) || [];
    list.push(rel);
    claimRelationMap.set(rel.claimId, list);
  }

  // Count independent sources (excluding unverified user notes or repeated claims)
  const independentSources = evidenceItems.filter(
    (e) => e.type === 'official_statement' || (e.type === 'url_source' && e.status === 'supports')
  );

  for (const claim of claims) {
    const rels = claimRelationMap.get(claim.id) || [];
    const hasSupport = rels.some((r) => r.relation === 'supports');
    const hasContradiction = rels.some((r) => r.relation === 'contradicts');

    if (hasSupport && !hasContradiction) {
      supportedClaims++;
    } else {
      unsupportedClaims++;
    }
  }

  // Detect concrete explanatory conditions
  if (totalClaims === 0) {
    return {
      level: 'low',
      headline: 'No specific claims registered yet',
      reasons: [
        'Add the core claims extracted from this message to begin mapping supporting and contradicting evidence.',
      ],
      recommendedSteps: [
        'Break down the message into 1 or 2 specific assertions in the Claims tab.',
      ],
      metrics: {
        totalClaims: 0,
        supportedClaims: 0,
        unsupportedClaims: 0,
        independentSourcesCount: evidenceItems.length,
        repetitionCount: 0,
      },
    };
  }

  if (unsupportedClaims > 0 && independentSources.length === 0) {
    reasons.push(
      `${unsupportedClaims} claim(s) are stated with confidence, but zero independent primary sources have been attached to this case.`
    );
    recommendedSteps.push('Search for an official press release, gazette notification, or direct company announcement.');
  }

  if (evidenceItems.length > 0 && relations.length === 0) {
    reasons.push(
      'Evidence items exist in this case, but none are linked to specific claims to prove or disprove them.'
    );
    recommendedSteps.push('Connect each source in the Evidence tab to the exact claim it addresses.');
  }

  const contradictedRelations = relations.filter((r) => r.relation === 'contradicts');
  if (contradictedRelations.length > 0) {
    reasons.push(
      `${contradictedRelations.length} evidence connection(s) explicitly contradict the claims made in the original text.`
    );
    recommendedSteps.push('Review the contradicting evidence notes and consider issuing a caution or debunk report.');
  }

  // Determine categorical level (NOT pseudo-scientific percentages)
  let level: 'low' | 'moderate' | 'elevated' | 'high' = 'low';
  let headline = 'Balanced Evidence Record';

  if (unsupportedClaims === 0 && supportedClaims > 0) {
    level = 'low';
    headline = 'Low Trust Debt: All registered claims are backed by recorded evidence';
  } else if (supportedClaims > 0 && unsupportedClaims > 0) {
    level = 'moderate';
    headline = 'Moderate Trust Debt: Partial evidence backing with unverified claims remaining';
  } else if (unsupportedClaims > 0 && independentSources.length > 0) {
    level = 'elevated';
    headline = 'Elevated Trust Debt: Sources recorded, but key claims lack direct support';
  } else {
    level = 'high';
    headline = 'High Trust Debt: High circulation or urgency without independent evidence';
  }

  if (recommendedSteps.length === 0) {
    recommendedSteps.push('Continue monitoring for official updates or archived source corroboration.');
  }

  return {
    level,
    headline,
    reasons,
    recommendedSteps,
    metrics: {
      totalClaims,
      supportedClaims,
      unsupportedClaims,
      independentSourcesCount: independentSources.length,
      repetitionCount: 0,
    },
  };
}
