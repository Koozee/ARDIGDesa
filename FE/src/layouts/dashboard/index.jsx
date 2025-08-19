export default function DashboardLayout({ children, isExpanded }) {
  return (
    <div
      className={`flex-1 transition-all duration-300 py-6 ${
        isExpanded
          ? "ml-[360px] 2xl:ml-[420px] w-[calc(100%-360px)] 2xl:w-[calc(100%-420px)]"
          : "ml-[150px] 2xl:ml-[200px] w-[calc(100%-130px)] 2xl:w-[calc(100%-200px)]"
      }`}
    >
      <section className={`font-onest relative top-20 pb-12 px-12`}>{children}</section>
    </div>
  );
}
