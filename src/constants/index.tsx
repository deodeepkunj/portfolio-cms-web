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
        path: "/",
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