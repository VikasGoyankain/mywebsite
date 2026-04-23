import { Separator } from "@/components/ui/separator";

const JournalFooter = () => {
  return (
    <footer className="border-t border-border mt-16 md:mt-24">
      <div className="container max-w-6xl mx-auto px-4 py-12 text-center">
        <p className="font-serif text-lg font-semibold mb-2">Code, Coin &amp; Constitution</p>
        <p className="text-xs font-sans text-muted-foreground uppercase tracking-[0.2em] mb-6">
          A journal by Vikas Goyanka
        </p>
        <Separator className="w-12 mx-auto mb-6" />
        <p className="text-xs font-sans text-muted-foreground">
          © {new Date().getFullYear()} vikasgoyanka.in — All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default JournalFooter;
