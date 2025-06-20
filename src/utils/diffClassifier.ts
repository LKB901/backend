import type { Diff } from 'deep-diff';

export type AlertKind =
  | 'OWNER_CHANGE'
  | 'LIEN_ADD'
  | 'LIEN_EDIT'
  | 'LIEN_REMOVE'
  | 'AUCTION_START'
  | 'AUCTION_END'
  | 'LEASE_ADD'  
  | 'LEASE_EDIT'  
  | 'LEASE_REMOVE'
  | 'UNKNOWN';

export function classifyDiff(d: Diff<any, any>): AlertKind {
  const p = (d.path ?? []).join('.');

  if (p === 'owner' && d.kind === 'E')                   return 'OWNER_CHANGE';
  if (p === 'leaseholds' && d.kind === 'A' && d.item?.kind === 'N')
                                                        return 'LEASE_ADD';
  if (/^leaseholds\.\d+\./.test(p) && d.kind === 'E')
                                                        return 'LEASE_EDIT';
  if (p === 'leaseholds' && d.kind === 'A' && d.item?.kind === 'D')
                                                        return 'LEASE_REMOVE';
  if (p === 'liens' && d.kind === 'A' && d.item?.kind === 'N')
                                                        return 'LIEN_ADD';
  if (/^liens\.\d+\./.test(p) && d.kind === 'E')        return 'LIEN_EDIT';
  if (p === 'liens' && d.kind === 'A' && d.item?.kind === 'D')
                                                        return 'LIEN_REMOVE';
  if (p === 'auction' && d.kind === 'E' && d.rhs === true)
                                                        return 'AUCTION_START';
  if (p === 'auction' && ((d.kind === 'E' && d.rhs === false) || d.kind === 'D'))
                                                        return 'AUCTION_END';
                                                      
  return 'UNKNOWN';
}

export const classify = classifyDiff; 
