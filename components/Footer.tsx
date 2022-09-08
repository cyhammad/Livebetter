import classNames from "classnames";
import Image from "next/future/image";
import Link from "next/link";

export const Footer = ({ className }: JSX.IntrinsicElements["footer"]) => {
  return (
    <footer
      className={classNames("w-full sticky top-0 bg-slate-100 z-40", className)}
    >
      <div className="container mx-auto flex flex-wrap justify-between items-center py-5 px-4">
        <Link href="/">
          <a className="flex gap-2 items-center">
            <div className="flex-none">
              <Image
                alt="Live Better logo"
                className="h-4 w-4"
                height={16}
                priority={true}
                src="/logo.svg"
                width={16}
              />
            </div>
            <span className="flex flex-col">
              <p className="text-xs text-slate-400">Live Better PHL</p>
            </span>
          </a>
        </Link>
        <p className="text-xs text-slate-400">
          Email us at{" "}
          <a href="mailto:livebetterphl@gmail.com">livebetterphl@gmail.com</a>.
        </p>
      </div>
    </footer>
  );
};
