import { getDatabase, saveDatabase, User } from "./database"
import { generateMemberId } from "./utils"

export function createUser(data: Omit<User, "id" | "memberId" | "createdAt" | "updatedAt" | "totalEarnings" | "availableBalance" | "totalReferrals">): User {
  const db = getDatabase()

  const newUser: User = {
    ...data,
    id: db.nextUserId++,
    memberId: generateMemberId(),
    status: "pending",
    role: "user",
    totalEarnings: 0,
    availableBalance: 0,
    totalReferrals: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  db.users.push(newUser)
  saveDatabase(db)

  return newUser
}
