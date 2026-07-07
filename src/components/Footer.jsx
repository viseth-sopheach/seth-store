import { Link } from "react-router-dom";

export function Footer() {
  const year = new Date().getFullYear();

  const linkStyle =
    "text-[#6B6558] transition-colors duration-200 hover:text-[#211F1C]";

  return (
    <footer className="w-full border-t border-[#E5DFD1] bg-[#FBF8F2]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-start">
          <div className="flex flex-1 flex-col gap-1">
            <span
              className="text-lg tracking-tight text-[#211F1C]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Viseth's Library
            </span>
            <p className="text-[#000000]">
              Reading is a valuable habit that improves knowledge,
              vocabulary, and critical thinking skills. It helps people
              understand new ideas, strengthens concentration, and enhances
              communication. Regular reading also encourages creativity and
              supports lifelong learning, making it an important activity for
              personal and academic growth.
            </p>
          </div>

          <nav className="flex flex-shrink-0 flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium">
            <Link to="/" className={linkStyle}>
              Books
            </Link>
            <Link to="/my-borrows" className={linkStyle}>
              My Borrows
            </Link>
          </nav>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-[#E5DFD1] pt-4 text-xs text-[#6B6558] sm:flex-row">
          <span>&copy; {year} Library. Let's read together!</span>
          <span className="inline-flex items-center gap-1.5">
            <a href="https://web.facebook.com/visethsopheach">Sopheach Viseth</a>
          </span>
        </div>
      </div>
    </footer>
  );
}