import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const JournalHeader = () => {
  return (
    <header className="border-b border-border">
      <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-serif text-lg font-bold tracking-tight hover:opacity-80 transition-opacity">
            VG
          </Link>
          <Separator orientation="vertical" className="h-5" />
          <span className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground hidden sm:inline">
            vikasgoyanka.in
          </span>
        </div>
        <nav className="flex items-center gap-6 font-sans text-sm">
          <Link href="/ccc" className="text-foreground font-medium border-b border-foreground pb-0.5">
            Journal
          </Link>
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default JournalHeader;
