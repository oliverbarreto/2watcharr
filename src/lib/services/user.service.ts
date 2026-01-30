import { Database } from 'sqlite';
import { UserRepository } from '../repositories';
import { User, UserProfile } from '../domain/models';
import bcrypt from 'bcryptjs';

export class UserService {
    private userRepo: UserRepository;

    constructor(db: Database) {
        this.userRepo = new UserRepository(db);
    }

    /**
     * Authenticate a user
     */
    async authenticate(username: string, password: string): Promise<User | null> {
        const user = await this.userRepo.findByUsername(username);
        if (!user || !user.password) return null;

        // Special case for initial 'changeme' password if not yet hashed
        if (user.password === password && user.password === 'changeme') {
            return user;
        }

        const isValid = await bcrypt.compare(password, user.password);
        return isValid ? user : null;
    }

    /**
     * Create a new user with hashed password
     */
    async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        const hashedPassword = await bcrypt.hash(data.password!, 10);
        return this.userRepo.create({
            ...data,
            password: hashedPassword,
        });
    }

    /**
     * Update user (handles password hashing if changed)
     */
    async updateUser(id: string, updates: Partial<User>): Promise<User> {
        const data = { ...updates };
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        return this.userRepo.update(id, data);
    }

    /**
     * Get all profiles (safe for UI)
     */
    async getProfiles(): Promise<UserProfile[]> {
        return this.userRepo.findAllProfiles();
    }

    /**
     * Is onboarding needed?
     */
    async isOnboardingNeeded(): Promise<boolean> {
        const count = await this.userRepo.count();
        if (count === 0) return true;

        const admin = await this.userRepo.findByUsername('admin');
        if (admin && admin.password === 'changeme') {
            return true;
        }

        // Also check if there are NO admin users
        const profiles = await this.userRepo.findAllProfiles();
        if (!profiles.some(p => p.isAdmin)) return true;

        return false;
    }

    /**
     * Initialize first admin or complete onboarding
     */
    async completeOnboarding(username: string, password: string, emoji?: string, color?: string): Promise<User> {
        const existingDefault = await this.userRepo.findById('default-admin');
        
        if (existingDefault) {
            // Update the default admin
            const user = await this.updateUser('default-admin', {
                username,
                password,
                displayName: username,
                emoji: emoji || '👤',
                color: color || '#FF0000',
                isAdmin: true,
            });
            return user;
        } else {
            // Create new admin
            return this.createUser({
                username,
                password,
                displayName: username,
                emoji: emoji || '👤',
                color: color || '#FF0000',
                isAdmin: true,
            });
        }
    }

    /**
     * Get user by ID
     */
    async getUserById(id: string): Promise<User | null> {
        return this.userRepo.findById(id);
    }

    /**
     * Delete user
     */
    async deleteUser(id: string): Promise<void> {
        await this.userRepo.delete(id);
    }
}
