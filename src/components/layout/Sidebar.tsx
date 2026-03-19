import Link from "next/link";
import { NavSection } from "@/config/navigation";

const Sidebar = ({ navigation }: { navigation: NavSection[] }) => {
  return (
    <div>
      <div className="navbar bg-base-200 w-full">
        <div className="flex-1">
          {navigation.map((navSection) => (
            <div>
              <h2>{navSection.section}</h2>
              {navSection.items.map((item) => (
                <Link key={item.id} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
