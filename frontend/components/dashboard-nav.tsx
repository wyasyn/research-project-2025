import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { images } from "@/assets/images/images";
import NavItem from "./nav-item";
import SidebarWrapper from "./sidebar-wrapper";
import UserBtn from "./user-btn";
import { adminSidebarLinks } from "@/lib/sidebar-limks";

export default function DashboardNav() {
  return (
    <SidebarWrapper>
      <Button variant="ghost" size={"icon"} asChild>
        <Link href="/">
          <Image src={images.logo.src} alt="Logo" width={32} height={32} />
        </Link>
      </Button>
      <section className="flex flex-col gap-4 md:mt-8">
        {adminSidebarLinks.map((item) => (
          <NavItem
            key={item.name}
            name={item.name}
            icon={item.icon}
            link={item.link}
          />
        ))}
      </section>
      <UserBtn />
    </SidebarWrapper>
  );
}
