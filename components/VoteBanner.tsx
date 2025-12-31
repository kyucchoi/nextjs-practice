'use client';

import Link from 'next/link';

export default function VoteBanner() {
  return (
    <div className="mt-5">
      <Link href="/vote" className="block">
        <div
          className="bg-white border-2 rounded-xl p-5 transition-all hover:shadow-md"
          style={{ borderColor: 'var(--hyobam-primary)' }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.borderColor = 'var(--hyobam-primary-hover)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.borderColor = 'var(--hyobam-primary)')
          }
        >
          <div className="flex items-start gap-4">
            <div
              className="p-3 rounded-full"
              style={{ backgroundColor: 'var(--hyobam-bg)' }}
            >
              <i
                className="fa-solid fa-vote-yea text-2xl"
                style={{ color: 'var(--hyobam-text)' }}
              ></i>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">효밤 투표하기</h3>
              <p className="text-sm">TETZ와 함께 놀아보아요 →</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
