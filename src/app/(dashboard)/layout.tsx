import Sidebar from "@/components/layout/Sidebar";
import { navigation } from "@/config/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar navigation={navigation} />
      <hr />
      <div>{children}</div>
    </>
  );
}
