import { SidebarTrigger } from "../ui/sidebar";

type AppHeaderProps = {
    title: string;
};

const AppHeader = ({ title }: AppHeaderProps) => {
    return (
        <header className="stickey top-0 z-10 flex h-14 shrink-0 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <h1 className="font-headline text-xl font-bold tracking-tight">{title}</h1>
        </header>
    );
};

export default AppHeader;