import { db } from '@/db';
import { organizations, organizationMembers, users, payouts } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// ---- Users (Clerk mirror) ----
export async function upsertUser(data: {
  clerkId: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
}) {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, data.clerkId))
    .limit(1);

  if (existing[0]) {
    const rows = await db
      .update(users)
      .set({ email: data.email, fullName: data.fullName, avatarUrl: data.avatarUrl })
      .where(eq(users.clerkId, data.clerkId))
      .returning();
    return rows[0];
  }

  const rows = await db.insert(users).values(data).returning();
  return rows[0];
}

export async function getUserByClerkId(clerkId: string) {
  const rows = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  return rows[0] ?? null;
}

// ---- Organizations ----
export async function createOrganization(
  data: typeof organizations.$inferInsert,
  ownerUserId: string
) {
  const org = (await db.insert(organizations).values(data).returning())[0];
  await db.insert(organizationMembers).values({
    organizationId: org.id,
    userId: ownerUserId,
    role: 'owner',
  });
  return org;
}

export async function getOrgBySlug(slug: string) {
  const rows = await db.select().from(organizations).where(eq(organizations.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getOrgById(id: string) {
  const rows = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getUserOrgs(userId: string) {
  return db
    .select({
      org: organizations,
      role: organizationMembers.role,
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
    .where(eq(organizationMembers.userId, userId));
}

export async function getMemberRole(orgId: string, userId: string) {
  const rows = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, userId)
      )
    )
    .limit(1);
  return rows[0]?.role ?? null;
}

// ---- Payouts ----
export async function getPayoutsByOrg(orgId: string) {
  return db
    .select()
    .from(payouts)
    .where(eq(payouts.organizationId, orgId))
    .orderBy(desc(payouts.requestedAt));
}

export async function requestPayout(data: typeof payouts.$inferInsert) {
  const rows = await db.insert(payouts).values(data).returning();
  return rows[0];
}


// ---- Platform Admin ----
export async function getAllOrganizations() {
  return db.select().from(organizations).orderBy(desc(organizations.createdAt));
}

export async function getAllUsers() {
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getOrgWithMembers(orgId: string) {
  const members = await db
    .select({
      user: users,
      role: organizationMembers.role,
    })
    .from(organizationMembers)
    .innerJoin(users, eq(organizationMembers.userId, users.id))
    .where(eq(organizationMembers.organizationId, orgId));
  return members;
}