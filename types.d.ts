import mongoose from 'mongoose';

declare global {
    var mongoose: {
        conn: mongoose.Mongoose | null;
        promise: Promise<mongoose.Mongoose> | null;
    };
}

type NavItem = {
    name: string;
    icon: React.ReactNode;
    path?: string;
    subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};


type BlogPost = {
    id: string;
    title: string;
    slug: string;
    content: string; // CKEditor HTML
    excerpt: string;
    featuredImage?: string;
    status: "draft" | "published";
    publishedAt?: string;
    seo: {
        metaTitle: string;
        metaDescription: string;
        noIndex?: boolean;
    };
};

interface Blog {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    status: "draft" | "published";
    featuredImage?: string;
    createdAt: string;
    updatedAt: string;
    seo: {
        metaTitle: string;
        metaDescription: string;
    };
}

type BannerForm = {
    badge: string;
    headlineLine1: string;
    headlineLine2: string;
    description: string;

    whatsappNumber: string;
    whatsappMessage: string;

    consultationLabel: string;
    consultationUrl: string;

    featuredTitle: string;
    featuredDescription: string;
};
type TechTool = {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    order: number;
};

type TechStackData = {
    status: "draft" | "published";
    header: {
        badge: string;
        title: string;
        subtitle: string;
    };
    tools: TechTool[];
};