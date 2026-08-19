export type Team = 'BURRO' | 'JUMENTO';
export type Role = 'SABICHAO' | 'PSEUDO_INTELECTUAL';

export interface Player {
  id: string;
  nickname: string;
  team: Team | null;
  role: Role | null;
  isHost: boolean;
}

export interface Room {
  slug: string;
  createdAt: Date;
  players: Player[];
}
