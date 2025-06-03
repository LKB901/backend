/**
 * registryNormalize.ts
 * ─ 공식 등기부등본 API(JSON) → 내부 공통 스키마
 *   { owner , liens[] , auction } 로 변환
 */

export interface NormalizedRegistry {
  owner:   string;
  liens:   { rank: number; creditor: string; amt: string }[];
  auction: boolean;
}

export function normalize(apiResp: any): NormalizedRegistry {
  // ① 응답 루트 (PDF p.7 '출력부') --------------------------
  const root = apiResp?.output ?? apiResp;          // fail-safe

  /*   owner  ────────────────────────────────────────── */
  const owner = root.resUserNm ?? '';               // 소유자 이름(p.7)

  /*   liens[] ───────────────────────────────────────── */
  // resRegisterEntriesList 안의 resRegistrationHsList 중
  //  ▸ resType == '근저당권설정' 만 추출
  const entries = (
    root.resRegisterEntriesList?.flat?.() ??        // 배열 또는 단건
    []
  );

  const liens = entries
    .filter((e: any) => e.resType?.includes('근저당'))   // mortgage
    .map((e: any, idx: number) => ({
      rank    : idx + 1,
      creditor: e.resContentsList?.[0]?.resContents ?? '',   // 은행명
      amt     : e.resContentsList?.[1]?.resContents ?? '',   // 금액
    }));

  /*   auction flag  ─────────────────────────────────── */
  // 경매(압류) 상태: resState == '경매개시결정' 등으로 내려옴
  const auction = String(root.resState ?? '')
                    .includes('경매');

  return { owner, liens, auction };
}
