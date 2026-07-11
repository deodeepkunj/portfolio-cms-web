import type {Metadata} from "next";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";

export const metadata: Metadata = {
    title: "Portfolio CMS", description: "",
};

export default function Dashboard() {
    return <AnalyticsDashboard/>;
}
