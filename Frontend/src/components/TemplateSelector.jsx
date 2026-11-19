export default function TemplateSelector({onClickSelect,onClickCreate,label}) {
  return (
    <div className="flex flex-col gap-2 mb-3">
            <div className="flex items-center gap-[5px] justify-end">
              <button
                type="button"
                className="w-full bg-[var(--primary)] text-[#fff] h-[40px] flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left hover:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--primary)]"
                onClick={onClickSelect}
              >
                <span
                  className="text-[#fff]"
                >
                  {label}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  style={{
                    width: "32px",
                    height: "32px",
                  }}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm bg-[var(--primary)] text-[#fff] text-[14px] h-[40px]"
                onClick={onClickCreate}
              >
                Nuevo
              </button>
            </div>
    </div>
  );
}