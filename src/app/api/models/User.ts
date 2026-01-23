// typescript
// File: `src/models/User.ts`
import mongoose, {Document, Schema} from 'mongoose';
import bcryptjs from 'bcryptjs';

export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    firstName?: string;
    lastName?: string;
    role: number; // changed to string to accept titles like "Senior Software Engineer"
    designation?: string;
    header?: {
        location?: string;
        socials?: Record<string, string>;
    };
    phone?: string;
    bio?: string;
    address?: {
        country?: string;
        cityState?: string;
        postalCode?: string;
        taxId?: string;
    };
    createdAt: Date;
    updatedAt: Date;

    comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        firstName: {type: String},
        lastName: {type: String},
        // role now accepts textual titles
        role: {
            type: Number,
            default: 1,
        },
        designation: {
            type: String,
            default: 'user',
            trim: true,
        },
        header: {
            location: {type: String},
            socials: {type: Schema.Types.Mixed},
        },
        phone: {type: String, trim: true},
        bio: {type: String},
        address: {
            country: {type: String},
            cityState: {type: String},
            postalCode: {type: String},
            taxId: {type: String},
        },
    },
    {timestamps: true}
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

userSchema.methods.comparePassword = async function (password: string) {
    return await bcryptjs.compare(password, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);