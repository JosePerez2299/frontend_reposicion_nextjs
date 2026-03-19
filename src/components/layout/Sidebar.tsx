import Link from "next/link";
import { NavSection } from "@/config/navigation";

const Sidebar = ({ navigation }: { navigation: NavSection[] }) => {
  return (
    <div>
      <div className="">
        <div className="">
          {navigation.map((navSection) => (
            <div key={navSection.section}>
              <h2 className="text-lg font-semibold mb-2">{navSection.section}</h2>
              {navSection.items.map((item) => (
                <Link
                  className="block mb-1 hover:underline"
                  key={item.id}
                  href={item.href}
                >
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
