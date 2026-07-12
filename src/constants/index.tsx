import {
    BoltIcon,
    BoxCubeIcon,
    BriefcaseIcon,
    ChatIcon,
    DocsIcon,
    GraduationCapIcon,
    GridIcon,
    ImageIcon,
    ShootingStarIcon,
    UserCircleIcon,
} from "../icons";

type NavItem = {
    name: string;
    icon: React.ReactNode;
    path?: string;
    subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};


export const navItems: NavItem[] = [
    {
        icon: <GridIcon/>,
        name: "Dashboard",
        path: "/dashboard",
    },
    {
        icon: <DocsIcon/>,
        name: "Blogs",
        path: "/blogs",
    },
    {
        icon: <ImageIcon/>,
        name: "Banner",
        path: "/banner"
    },
    {
        icon: <UserCircleIcon/>,
        name: "About Us",
        path: "/about"
    },
    {
        icon: <BriefcaseIcon/>,
        name: "Experience",
        path: "/experience"
    },
    {
        icon: <GraduationCapIcon/>,
        name: "Education",
        path: "/education"
    },
    {
        icon: <BoltIcon/>,
        name: "Services",
        path: "/services"
    },
    {
        icon: <ShootingStarIcon/>,
        name: "Featured Projects",
        path: "/projects"
    },
    {
        icon: <BoxCubeIcon/>,
        name: "Tech stack",
        path: "/techstack"
    },
    {
        icon: <ChatIcon/>,
        name: "Recommendations",
        path: "/recommendations"
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" fill="currentColor"/>
            </svg>
        ),
        name: "Site Settings",
        path: "/site-settings",
    },

    // {
    //   icon: <CalenderIcon />,
    //   name: "Calendar",
    //   path: "/calendar",
    // },
    // {
    //   icon: <UserCircleIcon />,
    //   name: "User Profile",
    //   path: "/profile",
    // },

    // {
    //   name: "Forms",
    //   icon: <ListIcon />,
    //   subItems: [{ name: "Form Elements", path: "/form-elements", pro: false }],
    // },
    // {
    //   name: "Tables",
    //   icon: <TableIcon />,
    //   subItems: [{ name: "Basic Tables", path: "/basic-tables", pro: false }],
    // },
    // {
    //   name: "Pages",
    //   icon: <PageIcon />,
    //   subItems: [
    //     // { name: "Blank Page", path: "/blank", pro: false },
    //     { name: "404 Error", path: "/error-404", pro: false },
    //   ],
    // },
];

export const othersItems: NavItem[] = [
    // {
    //   icon: <PieChartIcon />,
    //   name: "Charts",
    //   subItems: [
    //     { name: "Line Chart", path: "/line-chart", pro: false },
    //     { name: "Bar Chart", path: "/bar-chart", pro: false },
    //   ],
    // },
    // {
    //   icon: <BoxCubeIcon />,
    //   name: "UI Elements",
    //   subItems: [
    //     { name: "Alerts", path: "/alerts", pro: false },
    //     { name: "Avatar", path: "/avatars", pro: false },
    //     { name: "Badge", path: "/badge", pro: false },
    //     { name: "Buttons", path: "/buttons", pro: false },
    //     { name: "Images", path: "/images", pro: false },
    //     { name: "Videos", path: "/videos", pro: false },
    //   ],
    // },
    // {
    //   icon: <PlugInIcon />,
    //   name: "Authentication",
    //   subItems: [
    //     { name: "Sign In", path: "/signin", pro: false },
    //     { name: "Sign Up", path: "/signup", pro: false },
    //   ],
    // },
];

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}


export const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};