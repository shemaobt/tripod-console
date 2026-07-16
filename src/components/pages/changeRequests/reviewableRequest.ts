import type {
  ChangeRequestKind,
  ChangeRequestResponse,
  PublicRequestAdminResponse,
} from "@/types"

export type RequestOrigin = "change" | "public"

export interface ReviewableRequest {
  id: string
  origin: RequestOrigin
  kind: ChangeRequestKind
  requesterName: string | null
  requesterEmail: string
  status: "pending" | "approved" | "rejected"
  name: string | null
  code: string | null
  description: string | null
  languageId: string | null
  newLanguageName: string | null
  newLanguageCode: string | null
  grantManagerAccess: boolean
  reviewReason: string | null
  reviewedAt: string | null
  requestedAt: string
}

export function fromChangeRequest(req: ChangeRequestResponse): ReviewableRequest {
  return {
    id: req.id,
    origin: "change",
    kind: req.kind,
    requesterName: req.requester_display_name,
    requesterEmail: req.requester_email,
    status: req.status,
    name: req.name,
    code: req.code,
    description: req.description,
    languageId: req.language_id,
    newLanguageName: req.new_language_name,
    newLanguageCode: req.new_language_code,
    grantManagerAccess: req.grant_manager_access,
    reviewReason: req.review_reason,
    reviewedAt: req.reviewed_at,
    requestedAt: req.requested_at,
  }
}

export function fromPublicRequest(req: PublicRequestAdminResponse): ReviewableRequest {
  return {
    id: req.id,
    origin: "public",
    kind: req.kind,
    requesterName: req.requester_name,
    requesterEmail: req.requester_email,
    status: req.status,
    name: req.name,
    code: req.code,
    description: req.description,
    languageId: req.language_id,
    newLanguageName: req.new_language_name,
    newLanguageCode: req.new_language_code,
    grantManagerAccess: false,
    reviewReason: req.review_reason,
    reviewedAt: req.reviewed_at,
    requestedAt: req.requested_at,
  }
}

export function byNewestFirst(a: ReviewableRequest, b: ReviewableRequest) {
  return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
}
