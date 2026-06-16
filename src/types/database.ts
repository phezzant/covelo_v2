// Hand-written to match supabase/migrations/0001_init.sql.
// Once a real Supabase project exists, regenerate with:
//   npx supabase gen types typescript --project-id <id> > src/types/database.ts
// and reconcile any drift against this file.
//
// IMPORTANT: every table needs Row/Insert/Update/Relationships (even if
// Relationships is just []), and the schema needs Tables/Views/Functions,
// or @supabase/postgrest-js's GenericSchema constraint fails and every
// query silently types as `never`. This bit us once already — don't trim
// these fields to "simplify" the file.

export type UserRole = "child" | "adult";
export type PartnerStatus = "pending" | "active" | "expired" | "declined";
export type InviteDirection = "child_invited_adult" | "adult_invited_child";
export type TradeSide = "buy" | "sell";

export type Profile = {
  id: string;
  role: UserRole;
  display_name: string;
  username: string | null;
  avatar_emoji: string;
  age_range: string | null;
  onboarding_completed: boolean;
  onboarding_step: number;
  created_at: string;
}

export type JourneyPartner = {
  id: string;
  adult_id: string | null;
  child_id: string | null;
  status: PartnerStatus;
  initiated_by: InviteDirection;
  invited_email: string | null;
  invited_name: string | null;
  created_at: string;
  confirmed_at: string | null;
  expires_at: string;
}

export type Instrument = {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  price: number;
  day_change_pct: number;
  logo_emoji: string;
  description: string | null;
}

export type Portfolio = {
  id: string;
  profile_id: string;
  cash_balance: number;
  created_at: string;
}

export type Holding = {
  id: string;
  portfolio_id: string;
  instrument_id: string;
  quantity: number;
  avg_cost: number;
}

export type Trade = {
  id: string;
  portfolio_id: string;
  instrument_id: string;
  side: TradeSide;
  quantity: number;
  price: number;
  total: number;
  created_at: string;
}

type Rel = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
}[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; role: UserRole; display_name: string };
        Update: Partial<Profile>;
        Relationships: Rel;
      };
      journey_partner: {
        Row: JourneyPartner;
        Insert: Partial<JourneyPartner> & { initiated_by: InviteDirection };
        Update: Partial<JourneyPartner>;
        Relationships: Rel;
      };
      instruments: {
        Row: Instrument;
        Insert: Partial<Instrument> & {
          ticker: string;
          name: string;
          sector: string;
          price: number;
        };
        Update: Partial<Instrument>;
        Relationships: Rel;
      };
      portfolios: {
        Row: Portfolio;
        Insert: Partial<Portfolio> & { profile_id: string };
        Update: Partial<Portfolio>;
        Relationships: Rel;
      };
      holdings: {
        Row: Holding;
        Insert: Partial<Holding> & {
          portfolio_id: string;
          instrument_id: string;
          quantity: number;
          avg_cost: number;
        };
        Update: Partial<Holding>;
        Relationships: Rel;
      };
      trades: {
        Row: Trade;
        Insert: Partial<Trade> & {
          portfolio_id: string;
          instrument_id: string;
          side: TradeSide;
          quantity: number;
          price: number;
          total: number;
        };
        Update: Partial<Trade>;
        Relationships: Rel;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      partner_status: PartnerStatus;
      invite_direction: InviteDirection;
      trade_side: TradeSide;
    };
    CompositeTypes: Record<string, never>;
  };
}
