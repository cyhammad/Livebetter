import Image from "next/image";
import Link from "next/link";

export const HEADER_HEIGHT = 57;

export const Header = () => {
  return (
    <header className="border-solid border-b border-slate-100 py-2 sticky top-0 bg-white">
      <Link href="/">
        <a className="flex gap-3 items-center container px-6 mx-auto">
          <div className="flex-none">
            <Image
              src="/logo.png"
              width={40}
              height={40}
              layout="raw"
              alt="Live Better logo"
            />
          </div>
          <h1 className="text-2xl font-bold">Live Better</h1>
        </a>
      </Link>
    </header>
  );
};
