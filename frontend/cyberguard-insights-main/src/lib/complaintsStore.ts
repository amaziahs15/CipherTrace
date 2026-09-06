export type ComplaintEntity = {
  id: string;
  timestamp: string;
  timeAgo: string;
  fraudType: string;
  bank: string;
  suspectAccountId: string;
  suspectPhone: string;
  victimCoords: string;
  victimLat: number;
  victimLon: number;
  predictedHotspot: string;
  hotspotCity: string;
  fraudAmount: number;
  confidence: number;
  riskLevel: "Tier 1: High Risk" | "Tier 1: Standard";
  status: "New" | "Under Investigation" | "Resolved";
  suspectAccountAge: number;
  ipVelocity: number;
  evidenceHash: string;
  assignedUnit: string;
  syndicateTag?: string | undefined;
  isNewEntry?: boolean | undefined;
};

export const INITIAL_COMPLAINTS_REGISTRY: ComplaintEntity[] = [
  {
    id: "LEA-2024-8901",
    timestamp: "2026-08-28 02:45",
    timeAgo: "15m ago",
    fraudType: "UPI Fraud",
    bank: "SBI",
    suspectAccountId: "SBI-984210349281",
    suspectPhone: "+91 98765 43210",
    victimCoords: "28.6139°N, 77.2090°E",
    victimLat: 28.6139,
    victimLon: 77.2090,
    predictedHotspot: "Delhi NCR — Dwarka Sector 12 ATM Kiosks",
    hotspotCity: "Delhi NCR Zone",
    fraudAmount: 145000,
    confidence: 89.7,
    riskLevel: "Tier 1: High Risk",
    status: "New",
    suspectAccountAge: 6,
    ipVelocity: 14,
    evidenceHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    assignedUnit: "Delhi Cyber Special Cell",
    syndicateTag: "Jamtara UPI Mule Syndicate",
  },
  {
    id: "LEA-2024-8899",
    timestamp: "2026-08-28 02:10",
    timeAgo: "50m ago",
    fraudType: "Fake Investment",
    bank: "HDFC",
    suspectAccountId: "HDFC-491209384721",
    suspectPhone: "+91 91234 56789",
    victimCoords: "19.0760°N, 72.8777°E",
    victimLat: 19.0760,
    victimLon: 72.8777,
    predictedHotspot: "Mumbai Metro — Bandra Kurla Complex ATM Belt",
    hotspotCity: "Mumbai Metro Zone",
    fraudAmount: 220000,
    confidence: 93.4,
    riskLevel: "Tier 1: High Risk",
    status: "Under Investigation",
    suspectAccountAge: 12,
    ipVelocity: 18,
    evidenceHash: "1e1107dbc25c2c864d3885221e7658d2a6f821af0eef0cf47ef42ca95da31a25",
    assignedUnit: "Mumbai Cyber Police (BKC HQ)",
    syndicateTag: "Mewat Investment Scam Ring",
  },
  {
    id: "LEA-2024-8895",
    timestamp: "2026-08-27 23:30",
    timeAgo: "3h ago",
    fraudType: "OTP Fraud",
    bank: "ICICI",
    suspectAccountId: "SBI-984210349281", // Shared account with 8901 (Mule match)
    suspectPhone: "+91 98765 43210", // Shared phone with 8901
    victimCoords: "12.9716°N, 77.5946°E",
    victimLat: 12.9716,
    victimLon: 77.5946,
    predictedHotspot: "Bengaluru South — Koramangala Hub ATM Cluster",
    hotspotCity: "Bengaluru South Zone",
    fraudAmount: 115000,
    confidence: 86.2,
    riskLevel: "Tier 1: High Risk",
    status: "Under Investigation",
    suspectAccountAge: 4,
    ipVelocity: 9,
    evidenceHash: "8a4f912c9b4e6789123456789abcdef0123456789abcdef0123456789abcdef0",
    assignedUnit: "Karnataka CID Cyber Command",
    syndicateTag: "Jamtara UPI Mule Syndicate",
  },
  {
    id: "LEA-2024-8890",
    timestamp: "2026-08-27 21:15",
    timeAgo: "6h ago",
    fraudType: "Loan App Scam",
    bank: "Axis Bank",
    suspectAccountId: "AXIS-774910284719",
    suspectPhone: "+91 98450 11223",
    victimCoords: "22.5726°N, 88.3639°E",
    victimLat: 22.5726,
    victimLon: 88.3639,
    predictedHotspot: "Kolkata Central — Lalbazar Commercial Sector",
    hotspotCity: "Kolkata Central Zone",
    fraudAmount: 85000,
    confidence: 78.5,
    riskLevel: "Tier 1: Standard",
    status: "New",
    suspectAccountAge: 21,
    ipVelocity: 5,
    evidenceHash: "5f4dcc3b5aa765d61d8327deb882cf992b95bc995b95bc995b95bc995b95bc99",
    assignedUnit: "Kolkata Cyber Police",
    syndicateTag: "Instant Loan Extortion Network",
  },
  {
    id: "LEA-2024-8882",
    timestamp: "2026-08-27 18:40",
    timeAgo: "8h ago",
    fraudType: "Phishing",
    bank: "Punjab National Bank",
    suspectAccountId: "PNB-338192049182",
    suspectPhone: "+91 91234 56789", // Shared phone with 8899
    victimCoords: "13.0827°N, 80.2707°E",
    victimLat: 13.0827,
    victimLon: 80.2707,
    predictedHotspot: "Chennai North — Anna Salai Corridor Kiosks",
    hotspotCity: "Chennai North Zone",
    fraudAmount: 94000,
    confidence: 82.0,
    riskLevel: "Tier 1: Standard",
    status: "Resolved",
    suspectAccountAge: 35,
    ipVelocity: 3,
    evidenceHash: "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72",
    assignedUnit: "Chennai Cyber Crime Wing",
    syndicateTag: "Mewat Investment Scam Ring",
  },
];

const STORAGE_KEY = "ct_complaints_registry_v1";

export function getStoredComplaints(): ComplaintEntity[] {
  if (typeof localStorage === "undefined") return INITIAL_COMPLAINTS_REGISTRY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to read complaints from localStorage", e);
  }
  return INITIAL_COMPLAINTS_REGISTRY;
}

export function saveComplaints(complaints: ComplaintEntity[]) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    window.dispatchEvent(new CustomEvent("ciphertrace:complaints_updated"));
  } catch (e) {
    console.error("Failed to save complaints to localStorage", e);
  }
}

export type CrossReferenceMatch = {
  field: "suspectAccountId" | "suspectPhone" | "bank";
  label: string;
  matchedValue: string;
  matchedComplaints: {
    id: string;
    fraudType: string;
    amount: number;
    timestamp: string;
    status: string;
    hotspot: string;
  }[];
};

export type CrossReferenceResult = {
  hasMatch: boolean;
  matchCount: number;
  matches: CrossReferenceMatch[];
  matchedComplaintIds: string[];
  suggestedSyndicate?: string | undefined;
};

/**
 * Cross-references entered entity attributes against the existing complaint database
 */
export function crossReferenceComplaint(
  params: {
    suspectAccountId?: string | undefined;
    suspectPhone?: string | undefined;
    bank?: string | undefined;
    excludeId?: string | undefined;
  },
  complaintsList: ComplaintEntity[] = getStoredComplaints()
): CrossReferenceResult {
  const matches: CrossReferenceMatch[] = [];
  const matchedIdsSet = new Set<string>();
  let suggestedSyndicate: string | undefined = undefined;

  const cleanAcc = params.suspectAccountId?.trim().toLowerCase();
  const cleanPhone = params.suspectPhone?.replace(/\D/g, "");

  // 1. Cross-reference Suspect Account ID
  if (cleanAcc && cleanAcc.length >= 3) {
    const accMatches = complaintsList.filter((c) => {
      if (params.excludeId && c.id === params.excludeId) return false;
      const cAcc = c.suspectAccountId.trim().toLowerCase();
      return cAcc.includes(cleanAcc) || cleanAcc.includes(cAcc);
    });

    if (accMatches.length > 0) {
      accMatches.forEach((c) => {
        matchedIdsSet.add(c.id);
        if (c.syndicateTag && !suggestedSyndicate) suggestedSyndicate = c.syndicateTag;
      });

      matches.push({
        field: "suspectAccountId",
        label: "Suspect Bank Account Number",
        matchedValue: params.suspectAccountId!,
        matchedComplaints: accMatches.map((c) => ({
          id: c.id,
          fraudType: c.fraudType,
          amount: c.fraudAmount,
          timestamp: c.timestamp,
          status: c.status,
          hotspot: c.predictedHotspot,
        })),
      });
    }
  }

  // 2. Cross-reference Suspect Phone Number
  if (cleanPhone && cleanPhone.length >= 6) {
    const phoneMatches = complaintsList.filter((c) => {
      if (params.excludeId && c.id === params.excludeId) return false;
      const cPhone = c.suspectPhone.replace(/\D/g, "");
      return cPhone.includes(cleanPhone) || cleanPhone.includes(cPhone);
    });

    if (phoneMatches.length > 0) {
      phoneMatches.forEach((c) => {
        matchedIdsSet.add(c.id);
        if (c.syndicateTag && !suggestedSyndicate) suggestedSyndicate = c.syndicateTag;
      });

      matches.push({
        field: "suspectPhone",
        label: "Suspect Calling/UPI Phone",
        matchedValue: params.suspectPhone!,
        matchedComplaints: phoneMatches.map((c) => ({
          id: c.id,
          fraudType: c.fraudType,
          amount: c.fraudAmount,
          timestamp: c.timestamp,
          status: c.status,
          hotspot: c.predictedHotspot,
        })),
      });
    }
  }

  return {
    hasMatch: matches.length > 0,
    matchCount: matchedIdsSet.size,
    matches,
    matchedComplaintIds: Array.from(matchedIdsSet),
    suggestedSyndicate,
  };
}

/**
 * Registers a new complaint into the database and generates link-analysis connectivity
 */
export function registerNewComplaint(
  complaint: Omit<ComplaintEntity, "timeAgo" | "status" | "evidenceHash"> & {
    status?: "New" | "Under Investigation" | "Resolved" | undefined;
  }
): ComplaintEntity {
  const current = getStoredComplaints();
  
  // Cross reference for syndicate classification
  const xref = crossReferenceComplaint({
    suspectAccountId: complaint.suspectAccountId,
    suspectPhone: complaint.suspectPhone,
    bank: complaint.bank,
  }, current);

  const newEntry: ComplaintEntity = {
    ...complaint,
    timeAgo: "Just now",
    status: complaint.status || "New",
    evidenceHash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
    syndicateTag: complaint.syndicateTag || xref.suggestedSyndicate || (xref.hasMatch ? "Linked Multi-Mule Ring" : "Isolated Case"),
    isNewEntry: true,
  };

  const updated = [newEntry, ...current];
  saveComplaints(updated);
  return newEntry;
}

// ─── Graph Model for Link-Analysis Network ────────────────────────────────────

export type GraphNodeType = "complaint" | "account" | "phone" | "bank" | "hotspot";

export type GraphNode = {
  id: string;
  label: string;
  subLabel?: string | undefined;
  type: GraphNodeType;
  degree: number;
  isNew?: boolean | undefined;
  isFlaggedMatch?: boolean | undefined;
  amount?: number | undefined;
  complaintRefId?: string | undefined;
  x?: number | undefined;
  y?: number | undefined;
  vx?: number | undefined;
  vy?: number | undefined;
};

export type GraphLink = {
  id: string;
  source: string;
  target: string;
  relationship: "TRANSFERRED_TO" | "CALLED_FROM" | "WITHDRAWAL_AT" | "REGISTERED_BANK";
  isHighlighted?: boolean | undefined;
};

export type NetworkGraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
  summary: {
    totalComplaints: number;
    totalAccounts: number;
    totalPhones: number;
    totalHotspots: number;
    syndicateClusters: string[];
  };
};

/**
 * Builds a complete Node-Link Network Graph from all complaints in the registry
 */
export function buildNetworkGraph(
  complaints: ComplaintEntity[] = getStoredComplaints(),
  activeHighlightId?: string
): NetworkGraphData {
  const nodesMap = new Map<string, GraphNode>();
  const links: GraphLink[] = [];
  const syndicateSet = new Set<string>();

  complaints.forEach((c) => {
    if (c.syndicateTag) syndicateSet.add(c.syndicateTag);

    const isCurrentActive = activeHighlightId === c.id || c.isNewEntry;

    // 1. Complaint Node
    const complaintNodeId = `node_cmp_${c.id}`;
    if (!nodesMap.has(complaintNodeId)) {
      nodesMap.set(complaintNodeId, {
        id: complaintNodeId,
        label: c.id,
        subLabel: `₹${(c.fraudAmount / 1000).toFixed(0)}k · ${c.fraudType}`,
        type: "complaint",
        degree: 0,
        isNew: isCurrentActive,
        amount: c.fraudAmount,
        complaintRefId: c.id,
      });
    }

    // 2. Suspect Bank Account Node
    if (c.suspectAccountId) {
      const accNodeId = `node_acc_${c.suspectAccountId}`;
      if (!nodesMap.has(accNodeId)) {
        nodesMap.set(accNodeId, {
          id: accNodeId,
          label: c.suspectAccountId,
          subLabel: `Mule Account · ${c.bank}`,
          type: "account",
          degree: 0,
        });
      }
      const accNode = nodesMap.get(accNodeId)!;
      accNode.degree += 1;
      if (accNode.degree > 1) accNode.isFlaggedMatch = true;

      links.push({
        id: `link_${c.id}_acc_${c.suspectAccountId}`,
        source: complaintNodeId,
        target: accNodeId,
        relationship: "TRANSFERRED_TO",
        isHighlighted: isCurrentActive,
      });
    }

    // 3. Suspect Phone Node
    if (c.suspectPhone) {
      const phoneNodeId = `node_phone_${c.suspectPhone}`;
      if (!nodesMap.has(phoneNodeId)) {
        nodesMap.set(phoneNodeId, {
          id: phoneNodeId,
          label: c.suspectPhone,
          subLabel: "Caller / UPI VPA",
          type: "phone",
          degree: 0,
        });
      }
      const phoneNode = nodesMap.get(phoneNodeId)!;
      phoneNode.degree += 1;
      if (phoneNode.degree > 1) phoneNode.isFlaggedMatch = true;

      links.push({
        id: `link_${c.id}_phone_${c.suspectPhone}`,
        source: complaintNodeId,
        target: phoneNodeId,
        relationship: "CALLED_FROM",
        isHighlighted: isCurrentActive,
      });
    }

    // 4. Hotspot Withdrawal Zone Node
    if (c.predictedHotspot) {
      const cityOrHotspot = c.hotspotCity || c.predictedHotspot;
      const hotspotNodeId = `node_hotspot_${cityOrHotspot}`;
      if (!nodesMap.has(hotspotNodeId)) {
        nodesMap.set(hotspotNodeId, {
          id: hotspotNodeId,
          label: (c.predictedHotspot || "").split("—")[0]?.trim() || "Hotspot Zone",
          subLabel: "Predicted ATM Cluster",
          type: "hotspot",
          degree: 0,
        });
      }
      const hotspotNode = nodesMap.get(hotspotNodeId);
      if (hotspotNode) {
        hotspotNode.degree += 1;
      }

      links.push({
        id: `link_${c.id}_hotspot_${hotspotNodeId}`,
        source: complaintNodeId,
        target: hotspotNodeId,
        relationship: "WITHDRAWAL_AT",
        isHighlighted: isCurrentActive || undefined,
      });
    }

    // 5. Bank Node
    if (c.bank) {
      const bankNodeId = `node_bank_${c.bank}`;
      if (!nodesMap.has(bankNodeId)) {
        nodesMap.set(bankNodeId, {
          id: bankNodeId,
          label: c.bank,
          subLabel: "Financial Institution",
          type: "bank",
          degree: 0,
        });
      }
      const bankNode = nodesMap.get(bankNodeId);
      if (bankNode) {
        bankNode.degree += 1;
      }

      links.push({
        id: `link_${c.id}_bank_${c.bank}`,
        source: complaintNodeId,
        target: bankNodeId,
        relationship: "REGISTERED_BANK",
        isHighlighted: isCurrentActive || undefined,
      });
    }
  });

  const nodes = Array.from(nodesMap.values());

  return {
    nodes,
    links,
    summary: {
      totalComplaints: complaints.length,
      totalAccounts: nodes.filter((n) => n.type === "account").length,
      totalPhones: nodes.filter((n) => n.type === "phone").length,
      totalHotspots: nodes.filter((n) => n.type === "hotspot").length,
      syndicateClusters: Array.from(syndicateSet),
    },
  };
}
