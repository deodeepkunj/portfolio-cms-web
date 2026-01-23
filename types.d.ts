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