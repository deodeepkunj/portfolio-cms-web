"use client";

import {useEffect, useState} from "react";
import {useBlogApi} from "@/hooks/useBlogApi";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import BlogListingTable from "@/components/blog/BlogListingTable";
import {Blog} from "../../../../types";


interface PaginationData {
    blogs: Blog[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export default function BlogListPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        pages: 0,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const {loading, error, getBlogs} = useBlogApi();

    useEffect(() => {
        fetchBlogs(currentPage);
    }, [currentPage]);

    const fetchBlogs = async (page: number) => {
        try {
            const data: PaginationData = await getBlogs(undefined, page, 10);
            setBlogs(data.blogs);
            setPagination(data.pagination);
        } catch (err) {
            console.error("Error fetching blogs:", err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Blog Posts
                    </h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        Manage your blog posts and content
                    </p>
                </div>
                <Link href="/blogs/new">
                    <Button>Create Blog</Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                    className="p-4 border border-gray-200 dark:border-white/[0.05] rounded-lg bg-white dark:bg-white/[0.03]">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Blogs</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {pagination.total}
                    </p>
                </div>
                <div
                    className="p-4 border border-gray-200 dark:border-white/[0.05] rounded-lg bg-white dark:bg-white/[0.03]">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {blogs.filter((b) => b.status === "published").length}
                    </p>
                </div>
                <div
                    className="p-4 border border-gray-200 dark:border-white/[0.05] rounded-lg bg-white dark:bg-white/[0.03]">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Drafts</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {blogs.filter((b) => b.status === "draft").length}
                    </p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
            )}

            {/* Loading State */}
            {loading && blogs.length === 0 && (
                <div className="flex items-center justify-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">Loading blogs...</p>
                </div>
            )}

            {/* Table */}
            {!loading && blogs.length > 0 && (
                <>
                    <BlogListingTable/>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <Button
                                variant="outline"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                            >
                                Previous
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({length: pagination.pages}, (_, i) => i + 1).map(
                                    (page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-2 rounded ${
                                                currentPage === page
                                                    ? "bg-blue-600 text-white"
                                                    : "border border-gray-200 dark:border-white/[0.05] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                )}
                            </div>
                            <Button
                                variant="outline"
                                disabled={currentPage === pagination.pages}
                                onClick={() => setCurrentPage(currentPage + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {!loading && blogs.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        No blogs found
                    </p>
                    <Link href="/blogs/new">
                        <Button>Create Your First Blog</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}