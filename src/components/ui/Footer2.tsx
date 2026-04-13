interface Footer2Props {
  copyright?: string;
  bottomLinks?: {
    text: string;
    url: string;
  }[];
}

const Footer2 = ({
  copyright = `© ${new Date().getFullYear()} Yap. All rights reserved.`,
  bottomLinks = [
    { text: "Terms and Conditions", url: "#" },
    { text: "Privacy Policy", url: "#" },
  ],
}: Footer2Props) => {
  return (
    <section className="py-4 bg-base-100/80 backdrop-blur-sm">
      <div className="px-4 max-w-xl mx-auto">
        <footer>
          <div className="flex flex-col justify-between gap-4 border-t border-base-300 pt-8 text-sm font-medium text-base-content/60 md:flex-row md:items-center">
            <p>{copyright}</p>
            <ul className="flex gap-4">
              {bottomLinks.map((link, linkIdx) => (
                <li key={linkIdx} className="underline hover:text-primary transition-colors">
                  <a href={link.url}>{link.text}</a>
                </li>
              ))}
            </ul>
          </div>
        </footer>
      </div>
    </section>
  );
};

export { Footer2 };
