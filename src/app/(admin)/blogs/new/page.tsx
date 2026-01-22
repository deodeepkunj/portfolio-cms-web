import Blogform from "@/components/blog/Blogform";

export default function NewBlogPage() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Create Blog</h1>
      <Blogform />
    </div>
  );
}
