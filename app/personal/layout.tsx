import { PersonalAuthWrapper } from "@/components/personal/PersonalAuthWrapper";

export default function PersonalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PersonalAuthWrapper>{children}</PersonalAuthWrapper>;
} 