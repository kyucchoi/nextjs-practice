'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export default function InvitationSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-5">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div
            className="bg-white border-2 rounded-xl p-5 transition-all hover:shadow-md cursor-pointer"
            style={{ borderColor: 'var(--hyobam-primary)' }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor =
                'var(--hyobam-primary-hover)')
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
                  className="fa-solid fa-envelope text-2xl"
                  style={{ color: 'var(--hyobam-text)' }}
                ></i>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">
                  💌이효석의 밤 S2, 초대장
                </h3>
                <p className="text-base text-sm">초대장을 열어보세요 →</p>
              </div>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent
          className="max-w-full w-full h-full max-h-screen m-0 rounded-none p-0 overflow-y-auto !top-0 !left-0 !translate-x-0 !translate-y-0 sm:!top-[50%] sm:!left-[50%] sm:!translate-x-[-50%] sm:!translate-y-[-50%] sm:max-w-lg sm:h-auto sm:max-h-[90vh] sm:rounded-lg sm:p-6"
          style={{
            backgroundColor: 'var(--hyobam-bg)',
          }}
        >
          <div className="p-6 space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">
                💌이효석의 밤 S2, 초대장
              </h1>
              <h2 className="text-lg  text-gray-900 mb-4">
                Invitation for Tetz&apos;s night S2!
              </h2>
            </div>

            <div className="flex justify-center mb-2">
              <img
                src="https://tetz-night.netlify.app/tetz_invitation.png"
                alt="초대장"
                className="max-w-full h-auto rounded-lg shadow-md"
              />
            </div>

            <div className="text-center mb-6">
              <h3 className="text-sm text-gray-900">
                Special thanks for 규찬!
              </h3>
            </div>

            <div className="space-y-6">
              {/* 일시 */}
              <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                <h2 className="text-lg font-bold mb-2">
                  🎈일시 : 2026년 1월 31일
                  <br />
                  토요일 오후 5시 - 일요일 오전 7시
                </h2>
              </div>

              {/* 장소 */}
              <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                <h2 className="text-lg font-bold mb-2">🎈장소 : 서울 어딘가</h2>
                <h2 className="text-base mb-2">
                  이번에는 투표를 1월 10일까지 진행 후,
                  <br />
                  참여 인원에 따라 장소를 확정하여
                  <br />
                  공지 하겠습니다!
                </h2>
              </div>

              {/* 참여자 */}
              <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                <h2 className="text-lg font-bold mb-2">
                  🎈참여자 : Tetz 의 수업을 들었던 분들
                </h2>
                <h3 className="text-base  mt-2">
                  KDT 1기, KDT 5기, KB 5기, KB 6기 +@
                </h3>
              </div>

              {/* 참가비 */}
              <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                <h2 className="text-lg font-bold mb-2">🎈참가비 : 2만원</h2>
                <h3 className="text-base text-base mt-2">
                  작년 참여자 분들의 성화에
                  <br /> 참가비를 한 번 받아보겠습니다 🙃
                </h3>
              </div>

              {/* 무얼 하나요? */}
              <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                <h2 className="text-lg font-bold mb-2">🎈무얼 하나요?</h2>
                <h3 className="text-base text-base mt-2">
                  참여자들 간의 네트워킹
                </h3>
                <h3 className="text-base text-base mt-2">
                  테츠 퀴즈 풀기 & 상품 전달
                </h3>
                <h3 className="text-base text-base mt-2">각종 레크레이션</h3>
                <h3 className="text-base text-base mt-2">
                  재미있게 놀기 😁🤣😄😎🤗😏😝😇🤮
                </h3>
                <h3 className="text-base text-base mt-2">🍺🍾🍸🍷🍹🥂🍻🍺</h3>
              </div>

              {/* 작년의 기록 */}
              <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                <h2 className="text-lg font-bold mb-4">🧾Season1 의 기록</h2>
                <a
                  href="https://tetz-night.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-4"
                >
                  <h3 className="text-base text-base">
                    작년 초대장 보기 (클릭)
                  </h3>
                </a>

                <div className="flex flex-col gap-4 mt-4">
                  <img
                    src="https://tetz-night.netlify.app/tetz-night-7.jpg"
                    alt="S1 의 기록 1"
                    className="w-full h-auto"
                  />
                  <img
                    src="https://tetz-night.netlify.app/tetz-night-6.jpg"
                    alt="S1 의 기록 2"
                    className="w-full h-auto"
                  />
                  <img
                    src="https://tetz-night.netlify.app/tetz-night-2.jpg"
                    alt="S1 의 기록 3"
                    className="w-full h-auto"
                  />
                  <img
                    src="https://tetz-night.netlify.app/tetz-night-8.jpg"
                    alt="S1 의 기록 4"
                    className="w-full h-auto"
                  />
                  <img
                    src="https://tetz-night.netlify.app/tetz-night-5.jpg"
                    alt="S1 의 기록 5"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
