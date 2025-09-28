import { Button } from '@/components/ui/button';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-3xl font-bold">MyWidZ</div>
        <div className="text-lg text-muted-foreground mt-4">
          내가 원하는 위젯을
        </div>
        <div className="text-lg text-muted-foreground">추가해보세요!</div>
      </div>
      <Button
        className="w-full max-w-xs kakao-login text-black font-medium mt-8"
        size="lg"
      >
        <i className="fa-brands fa-kakao-talk"></i>
        <span>카카오톡 로그인</span>
      </Button>
    </div>
  );
}
