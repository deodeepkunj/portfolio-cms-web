"use client";

import React, {useEffect, useState} from "react";
import {Table, TableBody, TableCell, TableHeader, TableRow,} from "../ui/table";
import Badge from "../ui/badge/Badge";
import {useBlogApi} from "@/hooks/useBlogApi";
import Button from "../ui/button/Button";
import {formatDate} from "@/constants";
import {Modal} from "../ui/modal";
import {Blog} from "../../../types";


export default function BlogListingTable() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [page, setPage] = useState(1);
    const {loading, error, getBlogs, deleteBlog} = useBlogApi();
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null);
    const [selectedBlogTitle, setSelectedBlogTitle] = useState<string>("");

    useEffect(() => {
        fetchBlogs();
    }, [page]);

    const fetchBlogs = async () => {
        try {
            const data = await getBlogs(undefined, page, 10);
            setBlogs(data.blogs);
        } catch (err) {
            console.error("Error fetching blogs:", err);
        }
    };

    const openDeleteModal = (slug: string, title: string) => {
        setSelectedBlogSlug(slug);
        setSelectedBlogTitle(title);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedBlogSlug(null);
        setSelectedBlogTitle("");
    };

    const handleDelete = async () => {
        if (!selectedBlogSlug) return;

        setDeleteLoading(selectedBlogSlug);
        try {
            await deleteBlog(selectedBlogSlug);
            setDeleteSuccess(true);
            closeDeleteModal();
            fetchBlogs();
            setTimeout(() => setDeleteSuccess(false), 3000);
        } catch (err) {
            console.error("Error deleting blog:", err);
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleEdit = (id: string) => {
        window.location.href = `/blogs/${id}/edit`;
    };

    if (loading && blogs.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">Loading blogs...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Delete Success Message */}
            {deleteSuccess && (
                <div
                    className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                    <p className="text-sm text-green-800 dark:text-green-200">✓ Blog deleted successfully!</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
            )}

            {/* Table */}
            <div
                className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                    <div className="">
                        <Table>
                            {/* Table Header */}
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                    >
                                        Title
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                    >
                                        Slug
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                    >
                                        Status
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                    >
                                        Published
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                    >
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHeader>

                            {/* Table Body */}
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {blogs.length > 0 ? (
                                    blogs.map((blog) => (
                                        <TableRow key={blog._id}>
                                            {/* Title */}
                                            <TableCell className="px-5 py-4 sm:px-6 text-center">
                                                <div className="flex flex-col items-center justify-center">
                          <span
                              className="block font-medium text-gray-800 text-theme-sm dark:text-white/90 truncate max-w-xs">
                            {blog.title}
                          </span>
                                                    <span
                                                        className="block text-gray-500 text-theme-xs dark:text-gray-400 truncate max-w-xs">
                            {blog.excerpt}
                          </span>
                                                </div>
                                            </TableCell>

                                            {/* Slug */}
                                            <TableCell
                                                className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                                <code
                                                    className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs inline-block">
                                                    {blog.slug}
                                                </code>
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell
                                                className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                                <div className="flex justify-center">
                                                    <Badge
                                                        size="sm"
                                                        color={blog.status === "published" ? "success" : "warning"}
                                                    >
                                                        {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                                                    </Badge>
                                                </div>
                                            </TableCell>

                                            {/* Published Date */}
                                            <TableCell
                                                className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                                {formatDate(blog.createdAt)}
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEdit(blog.slug)}
                                                        className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openDeleteModal(blog.slug, blog.title)}
                                                        className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="px-5 py-8 text-center">
                                            <p className="text-gray-500 dark:text-gray-400">No blogs found</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                showCloseButton={true}
                className="max-w-[500px] m-4"
            >
                <div className="p-6 sm:p-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Delete Blog
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Are you sure you want to delete <span className="font-semibold">"{selectedBlogTitle}"</span>?
                        This action cannot be undone.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                        <Button
                            variant="outline"
                            onClick={closeDeleteModal}
                            className="order-2 sm:order-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={deleteLoading !== null}
                            className="order-1 sm:order-2 bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deleteLoading ? "Deleting..." : "Delete Blog"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}