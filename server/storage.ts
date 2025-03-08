import { users, interviews, type User, type Interview, type InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  saveInterview(interview: Omit<Interview, 'id'>): Promise<Interview>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private interviews: Map<number, Interview>;
  private currentUserId: number;
  private currentInterviewId: number;

  constructor() {
    this.users = new Map();
    this.interviews = new Map();
    this.currentUserId = 1;
    this.currentInterviewId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async saveInterview(interview: Omit<Interview, 'id'>): Promise<Interview> {
    const id = this.currentInterviewId++;
    const newInterview: Interview = { ...interview, id };
    this.interviews.set(id, newInterview);
    return newInterview;
  }
}

export const storage = new MemStorage();
