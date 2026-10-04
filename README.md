# 1분 눈운동

점을 눈으로 따라가는 60초 눈 스트레칭 PWA + 안드로이드 TWA 래퍼.
구성은 눈운동 앱 1위 Eye Care Plus(누적 설치 약 300만)의 '점 따라가기' 방식을 참고했고, 인트로·배경은 독자 디자인(해 질 녘 호수)이다.

## 동작 (각 10초)
좌우 → 위아래 → 원(시계/반시계) → 8자 → 가까이·멀리 초점 → 깜빡이고 눈 감고 쉬기

## 파일
- `index.html` `style.css` `app.js` — 앱 본체 (빌드 과정 없음, 그대로 GitHub Pages 에 올림)
- `sw.js` — 오프라인 캐시. 파일을 고치면 `CACHE` 버전을 올릴 것
- `privacy.html` — 개인정보처리방침 (수집 없음, 기기 localStorage 만 사용)
- `android/` — TWA 래퍼, 패키지 `io.github.danielmoon82.eyebreak`, 실행 주소 `https://danielmoon82.github.io/eye-break/`
- `.github/workflows/android.yml` — 서명된 APK·AAB 빌드 (시크릿 `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`)
- `store-icon-512.png`, `store-feature-1024x500.png` — Play 스토어 그래픽

## 출시 순서
1. GitHub 저장소 `eye-break` 생성 → push → Pages(main, 루트) 켜기
2. 저장소에 서명 키 시크릿 2개 등록 → Actions 의 android 실행 → AAB 받기
3. Play Console 앱 서명 키 SHA-256 을 `DanielMoon82.github.io/.well-known/assetlinks.json` 에 항목으로 추가
   (없으면 앱 상단에 주소창이 보인다)
