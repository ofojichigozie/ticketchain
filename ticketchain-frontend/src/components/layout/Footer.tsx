export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="" className="h-5 w-5" />
          <span>&copy; {new Date().getFullYear()} TicketChain</span>
        </div>
        <span>Built with Ethereum &amp; NFTs</span>
      </div>
    </footer>
  );
}
